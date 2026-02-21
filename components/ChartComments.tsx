import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Send, Image as ImageIcon, X, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { collection, addDoc, query, orderBy, onSnapshot, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

interface Comment {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
    imageUrl?: string;
    timestamp: any; // Firestore timestamp
}

interface ChartCommentsProps {
    isExpanded?: boolean;
    onToggleExpand?: () => void;
}

const ChartComments: React.FC<ChartCommentsProps> = ({ isExpanded, onToggleExpand }) => {
    const { user, uploadImage } = useApp();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Real-time subscription to Firestore
    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, "chart_comments"), orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedComments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Comment[];
            setComments(loadedComments);
            setError(null);
        }, (err) => {
            console.error("Firestore subscription error:", err);
            if (err.code === 'permission-denied') {
                setError("Sem permissão para acessar o chat.");
            } else {
                setError("Erro ao conectar ao chat.");
            }
        });

        return () => unsubscribe();
    }, [user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [comments]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                alert("A imagem deve ter no máximo 2MB.");
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!newComment.trim() && !selectedImage) return;

        setIsSubmitting(true);
        try {
            let imageUrl = null;
            if (selectedImage) {
                try {
                    // Tenta fazer upload para a pasta 'chart_images'
                    imageUrl = await uploadImage(selectedImage, 'chart_images');
                } catch (uploadError: any) {
                    console.error("Falha detalhada no upload:", uploadError);
                    
                    // Tratamento específico para erro de permissão
                    if (uploadError.code === 'storage/unauthorized') {
                        const errorMessage = "Erro de Permissão no Storage.\n\n" +
                            "O servidor bloqueou o upload. Se você é o administrador, configure as regras do Firebase Storage para permitir gravação na pasta 'chart_images'.\n\n" +
                            "Deseja enviar apenas o comentário de texto?";
                        
                        const proceed = window.confirm(errorMessage);
                        
                        if (!proceed) {
                            setIsSubmitting(false);
                            return;
                        }
                        // Usuário aceitou enviar sem imagem
                        imageUrl = null;
                    } else {
                        // Outros erros (rede, tamanho, etc)
                        alert("Erro ao fazer upload da imagem: " + uploadError.message);
                        setIsSubmitting(false);
                        return;
                    }
                }
            }

            await addDoc(collection(db, "chart_comments"), {
                userId: user.id,
                userName: user.name,
                userAvatar: user.avatar || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}`,
                text: newComment,
                imageUrl: imageUrl || null,
                timestamp: serverTimestamp()
            });

            setNewComment('');
            setSelectedImage(null);
            setImagePreview(null);
        } catch (error) {
            console.error("Error posting comment:", error);
            alert("Erro ao enviar comentário. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return '';
        // Handle Firestore Timestamp or Date string/object
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 border-t border-slate-800 w-full flex-shrink-0">
            <div className="p-2 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-white flex items-center gap-2 text-xs">
                        Chat do Gráfico <span className="text-[10px] bg-red-600 px-1.5 rounded text-white">LIVE</span>
                    </h3>
                    <p className="text-[10px] text-slate-500">Compartilhe suas análises</p>
                </div>
                {onToggleExpand && (
                    <button 
                        onClick={onToggleExpand} 
                        className="p-1.5 text-slate-400 hover:text-white transition-colors hover:bg-slate-800 rounded-lg"
                        title={isExpanded ? "Minimizar Chat" : "Expandir Chat"}
                    >
                        {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar bg-black/20">
                {error && (
                    <div className="text-center text-red-500 text-xs py-4 bg-red-900/10 rounded-lg border border-red-900/30">
                        {error}
                    </div>
                )}
                {comments.length === 0 && !error && (
                    <div className="text-center text-slate-500 text-sm py-8 flex flex-col items-center gap-2 opacity-50">
                        <ImageIcon size={24} />
                        <p className="text-xs">Seja o primeiro a compartilhar uma análise!</p>
                    </div>
                )}
                {comments.map(comment => {
                    const isMe = user?.id === comment.userId;
                    
                    return (
                        <div key={comment.id} className={`flex gap-2 animate-fadeIn group ${isMe ? 'flex-row-reverse' : ''}`}>
                            <div className="w-6 h-6 rounded-full bg-slate-800 overflow-hidden flex-shrink-0 ring-1 ring-slate-700 self-start mt-1">
                                <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
                            </div>
                            <div className={`flex-1 min-w-0 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-2 mb-0.5 px-1">
                                    <span className={`text-[10px] font-bold ${isMe ? 'text-red-400' : 'text-slate-300'}`}>{comment.userName}</span>
                                    <span className="text-[9px] text-slate-600">{formatTime(comment.timestamp)}</span>
                                </div>
                                
                                <div className={`relative max-w-[90%] rounded-xl p-2 text-xs break-words shadow-sm ${
                                    isMe 
                                        ? 'bg-red-900/20 border border-red-900/30 text-slate-200 rounded-tr-none' 
                                        : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
                                }`}>
                                    {comment.text}
                                    {comment.imageUrl && (
                                        <div className="mt-2 rounded-lg overflow-hidden border border-black/20">
                                            <img src={comment.imageUrl} alt="Análise" className="w-full h-auto hover:opacity-90 transition-opacity cursor-pointer" onClick={() => window.open(comment.imageUrl, '_blank')} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-2 border-t border-slate-800 bg-slate-900/80 backdrop-blur">
                {imagePreview && (
                    <div className="mb-2 relative inline-block animate-fadeIn">
                        <div className="relative rounded-lg overflow-hidden border border-slate-700 group">
                            <img src={imagePreview} alt="Preview" className="h-16 w-auto object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <button 
                                onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                            >
                                <X size={10} />
                            </button>
                        </div>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                    <div className="flex-1 relative bg-black border border-slate-800 rounded-xl focus-within:border-slate-600 focus-within:ring-1 focus-within:ring-slate-600/50 transition-all">
                        <textarea 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Escreva sua análise..."
                            className="w-full bg-transparent border-none rounded-xl py-2 pl-3 pr-8 text-xs text-white focus:ring-0 placeholder-slate-600 resize-none custom-scrollbar"
                            rows={1}
                            style={{ minHeight: '36px', maxHeight: '100px' }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <label className="absolute right-1 bottom-1 text-slate-500 hover:text-blue-400 cursor-pointer p-1 rounded-lg hover:bg-slate-800 transition-colors" title="Adicionar Imagem">
                            <ImageIcon size={16} />
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                        </label>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isSubmitting || (!newComment.trim() && !selectedImage)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-xl disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 transition-all shadow-lg shadow-red-900/20 hover:shadow-red-900/40"
                    >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChartComments;
