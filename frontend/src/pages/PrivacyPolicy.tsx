import React from 'react';

export const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 bg-white my-8 rounded-xl shadow-sm border border-eco-accent/10">
      <h1 className="text-4xl font-bold text-eco-dark mb-8 text-center">Política de Privacidade</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-eco-primary mb-3">1. Introdução</h2>
          <p>
            A Ecotraços ("nós", "nosso", "nossa") respeita a sua privacidade e garante o sigilo total das informações 
            que você nos fornece. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos os seus 
            Dados Pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-eco-primary mb-3">2. Dados que Coletamos</h2>
          <p>Podemos coletar os seguintes dados pessoais quando você utiliza o nosso site:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Formulário de Contato:</strong> Nome, E-mail e o conteúdo da mensagem enviada, para que possamos responder às suas dúvidas ou orçamentos.</li>
            <li><strong>Dados de Navegação (Cookies):</strong> Endereço de IP, tipo de navegador e páginas visitadas, com a finalidade de melhorar a sua experiência em nosso site.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-eco-primary mb-3">3. Como Usamos os seus Dados</h2>
          <p>Os seus dados pessoais são utilizados para:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Responder a solicitações de contato e orçamentos de móveis sob demanda.</li>
            <li>Melhorar continuamente o funcionamento e a segurança do nosso site.</li>
            <li>Cumprir obrigações legais ou regulatórias.</li>
          </ul>
          <p className="mt-2 font-bold text-eco-dark">
            Garantimos que os seus dados não serão vendidos, trocados ou divulgados para terceiros sem o seu consentimento.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-eco-primary mb-3">4. Cookies</h2>
          <p>
            Utilizamos cookies para melhorar a performance do site e personalizar a sua experiência. 
            Você pode optar por desabilitar os cookies não essenciais a qualquer momento diretamente nas configurações do seu navegador, 
            embora isso possa limitar algumas funcionalidades do site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-eco-primary mb-3">5. Os Seus Direitos (LGPD)</h2>
          <p>Você tem o direito de, a qualquer momento e mediante requisição formal:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Confirmar a existência de tratamento dos seus dados.</li>
            <li>Acessar, corrigir ou atualizar os seus dados.</li>
            <li>Solicitar a exclusão dos seus dados pessoais dos nossos sistemas (exceto quando a retenção for obrigatória por lei).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-eco-primary mb-3">6. Contato</h2>
          <p>
            Se você tiver dúvidas sobre esta Política de Privacidade ou sobre o tratamento dos seus dados, 
            entre em contato conosco através do botão do WhatsApp ou pelo e-mail disponibilizado no rodapé do nosso site.
          </p>
        </section>
        
        <p className="text-sm text-gray-400 mt-8 text-center pt-8 border-t border-gray-100">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  );
};
