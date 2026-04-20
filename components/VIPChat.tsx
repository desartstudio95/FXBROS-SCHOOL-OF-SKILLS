import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Trash2, 
  User as UserIcon, 
  Shield, 
  Clock, 
  MessageSquare,
  AlertCircle,
  Loader2,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  deleteDoc, 
  doc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useApp } from '../context/AppContext';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: string;
  content: string;
  timestamp: any;
  type: 'text' | 'system';
  isEdited?: boolean;
  editTimestamp?: any;
}

const VIPChat: React.FC = () => {
  const { user } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  useEffect(() => {
    const q = query(
      collection(db, 'chat_messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(msgs);
      setIsLoading(false);
      
      // Scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }, (error) => {
      console.error("Chat Error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, 'chat_messages'), {
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}`,
        userRole: user.role,
        content: newMessage.trim(),
        timestamp: serverTimestamp(),
        type: 'text'
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string, messageUserId: string) => {
    const isOwner = messageUserId === user?.id;
    if (!isAdmin && !isOwner) return;
    
    if (window.confirm("Deseja excluir esta mensagem?")) {
      try {
        await deleteDoc(doc(db, 'chat_messages', messageId));
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    }
  };

  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMessageId(msg.id);
    setEditingContent(msg.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const handleSaveEdit = async (messageId: string) => {
    if (!editingContent.trim()) return;
    try {
      await updateDoc(doc(db, 'chat_messages', messageId), {
        content: editingContent.trim(),
        isEdited: true,
        editTimestamp: serverTimestamp()
      });
      setEditingMessageId(null);
      setEditingContent('');
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-slate-900/20 rounded-2xl border border-slate-800">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
        <p className="text-slate-500 text-sm">Carregando Chat VIP...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[700px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center border border-red-500/20">
            <Shield className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Grupo VIP FXBROS
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-[10px] uppercase font-black">Live</span>
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Comunidade Exclusiva</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          {messages.length} mensagens
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-repeat"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageSquare className="w-12 h-12 text-slate-800 mb-4" />
            <p className="text-slate-500 text-sm">Nenhuma mensagem ainda. Seja o primeiro a falar!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.userId === user?.id;
            const isMsgAdmin = msg.userRole === 'admin' || msg.userRole === 'super_admin';

            return (
              <div 
                key={msg.id} 
                className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full overflow-hidden border ${isMsgAdmin ? 'border-red-500 ring-1 ring-red-500/50' : 'border-slate-800'}`}>
                    <img src={msg.userAvatar} alt={msg.userName} className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : ''}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className={`text-[10px] font-bold ${isMsgAdmin ? 'text-red-500' : 'text-slate-400'}`}>
                      {msg.userName}
                    </span>
                    {isMsgAdmin && <Shield size={10} className="text-red-500" />}
                    <span className="text-[9px] text-slate-600">{formatTime(msg.timestamp)}</span>
                  </div>
                  
                  <div className={`relative group p-3 rounded-2xl text-sm ${
                    isMe 
                      ? 'bg-red-600 text-white rounded-tr-none' 
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}>
                    {editingMessageId === msg.id ? (
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="w-full bg-black/20 border border-white/20 rounded-lg p-2 text-white text-xs focus:outline-none"
                          rows={2}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={handleCancelEdit} className="p-1 hover:text-red-200"><X size={14}/></button>
                          <button onClick={() => handleSaveEdit(msg.id)} className="p-1 hover:text-green-200"><Check size={14}/></button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {msg.content}
                        {msg.isEdited && <span className="text-[8px] opacity-50 ml-1">(editada)</span>}
                      </>
                    )}
                    
                    {/* Actions */}
                    <div className={`absolute -top-2 ${isMe ? '-left-2' : '-right-2'} flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                      {isMe && editingMessageId !== msg.id && (
                        <button 
                          onClick={() => handleStartEdit(msg)}
                          className="p-1.5 bg-slate-800 text-slate-400 hover:text-blue-500 rounded-full border border-slate-700 shadow-xl"
                          title="Editar mensagem"
                        >
                          <Edit2 size={10} />
                        </button>
                      )}
                      {(isAdmin || isMe) && (
                        <button 
                          onClick={() => handleDeleteMessage(msg.id, msg.userId)}
                          className="p-1.5 bg-slate-800 text-slate-400 hover:text-red-500 rounded-full border border-slate-700 shadow-xl"
                          title="Excluir mensagem"
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900/30 border-t border-slate-800">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-black border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-900/50 transition-all"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-red-600 shadow-lg shadow-red-900/20"
          >
            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
        <p className="text-[9px] text-slate-600 mt-2 text-center uppercase tracking-widest font-bold">
          Respeite as regras da comunidade. Linguagem ofensiva resultará em banimento.
        </p>
      </div>
    </div>
  );
};

export default VIPChat;
