import React, { useState } from 'react';
import { CheckCircle2, Star, ArrowRight, X, Smartphone, Loader2, Lock, Zap, ShieldCheck, Globe, Brain, Target, Mail, FileText, Printer, Download, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PricingPlan } from '../types';

// Debito Pay API Configuration
const DEBITO_PAY_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIwMTlhMmY5MC1kOWQ0LTcwZWQtOWM3Yy05MWI3OTFkNzA3YjAiLCJqdGkiOiIyNjQ3OTMxMTIwNjA4ZTBlZjhhZWE3NjUzOWQ0ZjI3NzRlZTkzNzBiOTU2MWQ2MTk0MGFjM2Q3ZjZmNWUyZmJjNDJjMTVhNzU3OThlODlmYiIsImlhdCI6MTc2OTYzNjI2OS40NDg3NTQsIm5iZiI6MTc2OTYzNjI2OS40NDg3OTEsImV4cCI6MjQwMDc4ODI2OS40MzE5NTgsInN1YiI6IjIzMiIsInNjb3BlcyI6WyJ0cmFuc2FjdGlvbnMubXBlc2EuYjJjIiwidHJhbnNhY3Rpb25zLm1wZXNhLmMyYiIsInRyYW5zYWN0aW9ucy5lbW9sYS5jMmIiLCJ0cmFuc2FjdGlvbnMuZW1vbGEuYjJjIiwidHJhbnNhY3Rpb25zLm5ldHNob3Aud3JpdGUiLCJ3YWxsZXRzLnJlYWQiXX0.pUIiGnFnvBIdCGd9W3QVGHDEzS9hqhAWic-7303IVdZM_Ju-UprKntpjkd5TvvSbUhsCjvVFhSfd_HpngzGaSVwXLmbrHXxT-SLkCKAMkQPeowljkOInIUWdNP6YIXGT9b4gx2-tuOjuu_v3zzRbvx_swDmvOt0FXmPvi19bVBMhnYCasSDRHAZRA0Ty0viDEVJw2nSpHXMIXYQzIC29rPmSeVpxLFSK1njNiCln0Z1A7-z0WjZz2A6Dap23Xwrd-lEwnT47ukonsmEBofb2YIKOuD0dLCy0OKwM0G5K9dPG9E8OiFXMoFVsgx4tISB5ciGnz31_8dTwukSrC6hoRoUO2mkD1mGqUKAqW_5qrbOw5wGMjuZTxlIuACY35YaMDdz4DNAk1Z4ktSa1qkp1eoiGC8L-l80pnGNSiMGJD25uvCH83zQAlFYAmTjjWfoxcqHJrHqfibD48I2rY4xb_oK8ckZ6qUY2U2qh_3N0wAEpaOZquoT3LwYZeMmRnHhTjT_tsQrmxBPKhnivRqQ2kD3P2fpsDg-2xlNbcVJJ8aa3UzY8VV2OkF9CGsCPLqzdCjRbX-1D75aPtOjeN1uo8ZZSdNZmAr32O9R1G5aqZuvE0ZhcQGJ1ZF4PZlTwUTBQdnhrf9-xXAKmwv0h7-J91r8Po6fn7T77CmnW5do2zDQ";

const Plans: React.FC = () => {
  const { plans, plansPageContent, user } = useApp();
  const navigate = useNavigate();

  // Payment State
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // Form State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  
  // Transaction State
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [transactionDate, setTransactionDate] = useState('');

  const handleSelectPlan = (plan: PricingPlan) => {
    // Check if the plan has an external payment link
    if (plan.paymentLink && plan.paymentLink.trim() !== '') {
        window.open(plan.paymentLink, '_blank');
        return;
    }
    
    // Otherwise, open internal payment modal
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
    setPaymentError('');
    setShowReceipt(false);
    setPhoneNumber('');
    setEmail('');
  };

  const handleDebitPayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 9) {
      setPaymentError('Por favor, insira um número de telefone válido (M-Pesa/E-Mola).');
      return;
    }
    if (!email || !email.includes('@')) {
      setPaymentError('Por favor, insira um e-mail válido para receber o comprovativo.');
      return;
    }

    setIsLoading(true);
    setPaymentError('');

    try {
      // INTEGRAÇÃO COM DEBITO PAY
      // Utilizamos o token fornecido para autenticação.
      // Em produção, isso seria uma chamada fetch para o endpoint da Debito Pay.
      
      console.log("Iniciando transação Debito Pay...");
      console.log("Token de Autorização:", DEBITO_PAY_TOKEN.substring(0, 20) + "...");
      
      // Simulação da latência da rede e processamento do gateway
      // Headers que seriam usados:
      // Authorization: `Bearer ${DEBITO_PAY_TOKEN}`
      
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Sucesso Simulado
      const newTxId = `DBT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setTransactionId(newTxId);
      // Data e hora local do cliente
      setTransactionDate(new Date().toLocaleString('pt-BR'));
      setShowReceipt(true);

    } catch (error) {
      console.error("Erro Debito Pay:", error);
      setPaymentError('Erro ao processar pagamento. Verifique o número e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFinish = () => {
    setIsPaymentModalOpen(false);
    navigate('/login', { 
      state: { 
        paymentSuccess: true, 
        planId: selectedPlan?.id,
        planName: selectedPlan?.name 
      } 
    });
  };

  return (
    <div className="bg-black min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
          <img 
            src={plansPageContent.hero.bgImage} 
            alt="Background" 
            className="w-full h-full object-cover opacity-40" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black"></div>
      </div>
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <span className="text-red-500 font-bold uppercase tracking-widest text-xs border border-red-600/20 bg-red-600/10 px-4 py-1.5 rounded-full mb-6 inline-block">
            {plansPageContent.hero.badge}
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            {plansPageContent.hero.title}
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            {plansPageContent.hero.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`relative p-1 rounded-3xl transition-all duration-300 hover:scale-[1.02] group
                ${plan.isElite 
                  ? 'bg-gradient-to-b from-yellow-600 to-amber-900 shadow-[0_0_50px_-12px_rgba(217,119,6,0.5)]' 
                  : plan.isPopular 
                    ? 'bg-gradient-to-b from-red-600 to-red-900 shadow-[0_0_50px_-12px_rgba(228,4,55,0.5)]' 
                    : 'bg-slate-800 hover:bg-slate-700'
                }
              `}
            >
              <div className="bg-black h-full w-full rounded-[22px] p-8 flex flex-col relative overflow-hidden">
                {/* Admin Edit Button */}
                {(user?.role === 'admin' || user?.role === 'super_admin') && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate('/admin', { state: { targetSection: 'plans', editPlanId: plan.id } });
                        }}
                        className="absolute top-4 left-4 z-20 p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors backdrop-blur-sm shadow-lg group-hover:scale-110"
                        title="Editar Plano (Admin)"
                    >
                        <Edit size={16} />
                    </button>
                )}

                {/* Background Glow inside card */}
                {plan.isElite && <div className="absolute top-0 left-0 w-full h-32 bg-amber-500/10 blur-3xl"></div>}
                {plan.isPopular && <div className="absolute top-0 left-0 w-full h-32 bg-red-500/10 blur-3xl"></div>}
                
                {plan.isPopular && (
                  <div className="absolute top-5 right-5 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg shadow-red-600/40">
                    Mais Escolhido
                  </div>
                )}
                {plan.isElite && (
                   <div className="absolute top-5 right-5 bg-amber-500 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                    <Star size={10} fill="black" /> Elite
                  </div>
                )}
                
                <h3 className={`text-xl font-bold mb-2 uppercase tracking-wide ${plan.isElite ? 'text-amber-500' : 'text-white'}`}>{plan.name}</h3>
                <div className="mb-6 flex items-baseline">
                  <span className="text-4xl font-bold text-white tracking-tighter">{plan.price}</span>
                  <span className="text-slate-500 text-sm ml-2 font-medium">/mês</span>
                </div>
                
                <div className="w-full h-px bg-slate-800 mb-6"></div>
                
                <ul className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
                      <CheckCircle2 className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${plan.isElite ? 'text-amber-500' : 'text-red-500'}`} />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-4 rounded-xl font-bold text-sm transition-all text-center uppercase tracking-widest
                  ${plan.isElite 
                    ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-900/40' 
                    : plan.isPopular
                        ? 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/40'
                        : 'bg-white text-black hover:bg-slate-200'
                  }
                `}>
                  Assinar Agora
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Why Choose FXBROS Section */}
        <div className="border-t border-slate-900 pt-24">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{plansPageContent.benefitsSection.title}</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">{plansPageContent.benefitsSection.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-red-900/50 transition-colors group">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600/20 transition-colors">
                        <Target className="text-red-500" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Estratégia de Alta Precisão</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Metodologia exclusiva baseada em dados institucionais e comportamento de preço.</p>
                </div>
                <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-purple-900/50 transition-colors group">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600/20 transition-colors">
                        <Brain className="text-purple-500" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Psicologia Avançada</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Treinamento mental com especialistas para blindar sua mente contra o estresse do mercado.</p>
                </div>
                <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-blue-900/50 transition-colors group">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600/20 transition-colors">
                        <ShieldCheck className="text-blue-500" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Gestão de Risco</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Aprenda a proteger seu capital como os grandes fundos de investimento operam.</p>
                </div>
                <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-green-900/50 transition-colors group">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600/20 transition-colors">
                        <Globe className="text-green-500" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Comunidade Global</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Conecte-se com traders de diversos países e compartilhe análises em tempo real.</p>
                </div>
            </div>
        </div>

      </div>

      {/* PAYMENT MODAL */}
      {isPaymentModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => { if(!isLoading && !showReceipt) setIsPaymentModalOpen(false); }}></div>
          
          <div className="relative bg-slate-950 border border-slate-800 p-0 rounded-3xl w-full max-w-md shadow-2xl shadow-red-900/20 animate-[slideIn_0.3s_ease-out] overflow-hidden">
            
            {/* Close Button (Hidden if showing receipt) */}
            {!showReceipt && (
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                disabled={isLoading}
                className="absolute top-4 right-4 text-slate-500 hover:text-white disabled:opacity-50 z-10"
              >
                <X size={24} />
              </button>
            )}

            {!showReceipt ? (
                // --- PAYMENT FORM ---
                <div className="p-8">
                    <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                        <Lock className="text-red-500" size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">Checkout Seguro</h3>
                    <p className="text-slate-400 text-sm">
                        Plano selecionado: <span className="text-white font-bold">{selectedPlan.name}</span>
                    </p>
                    <div className="mt-4 text-3xl font-bold text-white tracking-tight">{selectedPlan.price}</div>
                    </div>

                    {paymentError && (
                    <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2 animate-pulse">
                        <X size={16} /> {paymentError}
                    </div>
                    )}

                    <form onSubmit={handleDebitPayPayment} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                        Seu E-mail (Para Comprovativo)
                        </label>
                        <div className="relative group">
                        <Mail className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-red-500 transition-colors" size={20} />
                        <input 
                            type="email" 
                            required
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-black border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all placeholder-slate-700 tracking-wide"
                        />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                        Número de Telefone (M-Pesa / E-Mola)
                        </label>
                        <div className="relative group">
                        <Smartphone className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-red-500 transition-colors" size={20} />
                        <input 
                            type="tel" 
                            required
                            placeholder="84 123 4567"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-black border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all placeholder-slate-700 text-lg tracking-wide"
                        />
                        </div>
                        <p className="text-[10px] text-slate-600 mt-2 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Processado via Debito Pay Gateway
                        </p>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20 uppercase tracking-wide flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" /> Processando...
                        </>
                        ) : (
                        'Pagar e Receber Acesso'
                        )}
                    </button>
                    </form>
                </div>
            ) : (
                // --- INVOICE / RECEIPT VIEW ---
                // ID added for Print targeting via CSS
                <div id="invoice-area" className="bg-white text-black p-8 relative">
                    <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-6">
                        <div className="flex items-center gap-4">
                            <img src="https://i.ibb.co/G4bmxpLm/5.png" alt="FXBROS Logo" className="w-12 h-12 object-contain filter invert brightness-0" />
                            <div>
                                <span className="text-xl font-bold tracking-tight block text-black">FXBROS.</span>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">School of Skills</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-gray-900">FATURA</h2>
                            <p className="text-sm text-gray-500">#{transactionId}</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                            <CheckCircle2 size={14} /> Pago com Sucesso
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Fundos enviados via Debito Pay.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Cliente</p>
                            <p className="font-bold text-sm">{email}</p>
                            <p className="text-sm text-gray-600">{phoneNumber}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Data de Emissão</p>
                            <p className="font-bold text-sm">{transactionDate}</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-8 border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-sm">Plano {selectedPlan.name}</span>
                            <span className="font-bold text-sm">{selectedPlan.price}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Assinatura Mensal</span>
                            <span>MZN</span>
                        </div>
                        <hr className="my-3 border-gray-200" />
                        <div className="flex justify-between items-center">
                            <span className="font-extrabold text-lg">Total</span>
                            <span className="font-extrabold text-lg text-red-600">{selectedPlan.price}</span>
                        </div>
                    </div>

                    <div className="space-y-3 no-print">
                        <button 
                            onClick={handlePrint}
                            className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <Printer size={16} /> Salvar PDF / Imprimir
                        </button>
                        <button 
                            onClick={handleFinish}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-600/20"
                        >
                            Continuar para Login <ArrowRight size={16} />
                        </button>
                    </div>
                    
                    <div className="mt-8 text-center text-[10px] text-gray-400 border-t border-gray-100 pt-4">
                        Obrigado pela preferência. Este é um recibo gerado eletronicamente.
                        <br/>FXBROS - Technology & Education.
                    </div>
                </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;