import React from 'react';

const LegalLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="min-h-screen bg-black pt-32 pb-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 border-b border-slate-800 pb-6">{title}</h1>
      <div className="text-slate-300 space-y-6 leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);

export const Terms: React.FC = () => (
  <LegalLayout title="Termos de Uso">
    <p>Bem-vindo à FXBROS. Ao acessar nossa plataforma, você concorda com os seguintes termos e condições:</p>
    
    <h3 className="text-xl font-bold text-white mt-8">1. Uso da Plataforma</h3>
    <p>O conteúdo disponibilizado na FXBROS é estritamente educacional. Você concorda em usar o material apenas para fins de aprendizado pessoal e não comercial.</p>

    <h3 className="text-xl font-bold text-white mt-8">2. Propriedade Intelectual</h3>
    <p>Todo o conteúdo, incluindo vídeos, textos, logotipos e materiais gráficos, é de propriedade exclusiva da FXBROS. A reprodução não autorizada é estritamente proibida.</p>

    <h3 className="text-xl font-bold text-white mt-8">3. Contas de Usuário</h3>
    <p>Você é responsável por manter a confidencialidade de suas credenciais de acesso. O compartilhamento de contas resultará no bloqueio imediato sem reembolso.</p>

    <h3 className="text-xl font-bold text-white mt-8">4. Cancelamento</h3>
    <p>Você pode cancelar sua assinatura a qualquer momento. O acesso permanecerá ativo até o final do período cobrado.</p>
  </LegalLayout>
);

export const Privacy: React.FC = () => (
  <LegalLayout title="Política de Privacidade">
    <p>Sua privacidade é nossa prioridade. Esta política descreve como coletamos e usamos seus dados.</p>
    
    <h3 className="text-xl font-bold text-white mt-8">1. Coleta de Dados</h3>
    <p>Coletamos informações como nome, e-mail e dados de uso da plataforma para melhorar sua experiência e fornecer suporte adequado.</p>

    <h3 className="text-xl font-bold text-white mt-8">2. Uso das Informações</h3>
    <p>Seus dados são usados exclusivamente para gerenciamento de conta, processamento de pagamentos e comunicação sobre atualizações da plataforma.</p>

    <h3 className="text-xl font-bold text-white mt-8">3. Segurança</h3>
    <p>Empregamos padrões de segurança da indústria para proteger seus dados contra acesso não autorizado.</p>
  </LegalLayout>
);

export const Risk: React.FC = () => (
  <LegalLayout title="Aviso de Risco">
    <div className="bg-red-900/20 border border-red-800 p-6 rounded-xl mb-8">
        <p className="font-bold text-red-400">ATENÇÃO: A negociação de Forex e CFDs envolve um alto nível de risco e pode não ser adequada para todos os investidores.</p>
    </div>

    <p>Antes de decidir negociar câmbio, você deve considerar cuidadosamente seus objetivos de investimento, nível de experiência e apetite ao risco.</p>
    
    <h3 className="text-xl font-bold text-white mt-8">1. Alavancagem</h3>
    <p>A alavancagem pode trabalhar tanto a seu favor quanto contra você. Existe a possibilidade de que você possa sustentar uma perda de parte ou de todo o seu investimento inicial.</p>

    <h3 className="text-xl font-bold text-white mt-8">2. Natureza Educacional</h3>
    <p>A FXBROS é uma plataforma educacional. Nenhuma informação fornecida deve ser interpretada como aconselhamento financeiro ou recomendação de investimento. Resultados passados não garantem desempenho futuro.</p>
  </LegalLayout>
);