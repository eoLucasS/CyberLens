// Privacy Policy page: static Server Component, zero client-side JavaScript.
// Fully LGPD-compliant (Lei 13.709/2018) text in Brazilian Portuguese.

export const metadata = {
  title: 'Política de Privacidade | CyberLens',
  description:
    'Política de Privacidade do CyberLens em conformidade com a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).',
};

// Helper component for numbered section headings
function Section({ number, title }: { number: string; title: string }) {
  return (
    <h2 className="text-lg font-semibold text-[#e4e4e7] mt-10 mb-3">
      {number}. {title}
    </h2>
  );
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 sm:py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Page header */}
        <div className="mb-6 sm:mb-8 pb-6 border-b border-white/10">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#e4e4e7]">Política de Privacidade</h1>
          <p className="mt-2 text-sm text-[#9ca3af]">
            Última atualização: 24 de março de 2026
          </p>
          <p className="mt-3 text-sm text-[#9ca3af]">
            Esta Política de Privacidade descreve como o CyberLens trata (ou, na maioria dos
            casos, <em>não trata</em>) dados pessoais, em conformidade com a{' '}
            <strong className="text-[#e4e4e7]">
              Lei Geral de Proteção de Dados Pessoais (LGPD, Lei n.º 13.709/2018)
            </strong>
            .
          </p>
        </div>

        {/* Body text */}
        <div className="text-[#9ca3af] text-sm leading-relaxed space-y-2">

          <Section number="1" title="Identificação do Controlador" />
          <p>
            O CyberLens é um projeto de software de código aberto, desenvolvido e mantido de forma
            independente. Para questões relacionadas à privacidade e proteção de dados, o
            Encarregado pelo Tratamento de Dados (DPO) pode ser contatado por meio do
            perfil do desenvolvedor no GitHub:{' '}
            <a
              href="https://github.com/eoLucasS"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00ffd5] hover:underline"
            >
              github.com/eoLucasS
            </a>
            .
          </p>

          <Section number="2" title="Dados Coletados" />
          <p>
            O CyberLens <strong className="text-[#e4e4e7]">não coleta nem armazena dados pessoais
            em qualquer servidor</strong>. Todo o processamento ocorre exclusivamente no dispositivo
            do próprio usuário, por meio do{' '}
            <strong className="text-[#e4e4e7]">localStorage</strong> do navegador.
          </p>
          <p>
            Os únicos dados mantidos localmente no navegador são:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Chave de API do provedor de IA escolhido pelo usuário;</li>
            <li>Preferências de configuração (provedor e modelo de IA selecionados);</li>
            <li>Registro de consentimento com esta Política e os Termos de Uso;</li>
            <li>Resultado da última análise realizada (texto gerado pela IA);</li>
            <li>
              Texto do último currículo enviado (apenas o texto extraído do PDF, nunca o arquivo
              binário), mantido em cache para evitar novo upload em análises subsequentes.
            </li>
          </ul>
          <p>
            Esses dados <strong className="text-[#e4e4e7]">não são transmitidos ao CyberLens</strong>{' '}
            e podem ser removidos a qualquer momento pelo próprio usuário por meio da página de
            Configurações ou das ferramentas nativas do navegador.
          </p>

          <Section number="3" title="Finalidade do Tratamento" />
          <p>
            Os dados armazenados localmente têm as seguintes finalidades:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              <strong className="text-[#e4e4e7]">Chave de API:</strong> autenticar as requisições
              enviadas ao provedor de IA escolhido pelo usuário;
            </li>
            <li>
              <strong className="text-[#e4e4e7]">Preferências:</strong> manter as configurações
              entre sessões, evitando que o usuário precise reconfigurar o aplicativo a cada
              acesso;
            </li>
            <li>
              <strong className="text-[#e4e4e7]">Consentimento:</strong> registrar que o usuário
              leu e concordou com esta Política e os Termos de Uso, conforme exigido pela LGPD;
            </li>
            <li>
              <strong className="text-[#e4e4e7]">Última análise:</strong> permitir que o usuário
              consulte o resultado mais recente sem precisar reprocessar o documento;
            </li>
            <li>
              <strong className="text-[#e4e4e7]">Cache de currículo:</strong> armazenar
              localmente o texto extraído do PDF para que o usuário possa comparar o mesmo
              currículo contra múltiplas vagas sem precisar realizar novo upload a cada análise.
              O texto permanece exclusivamente no dispositivo do usuário e pode ser removido a
              qualquer momento.
            </li>
          </ul>

          <Section number="4" title="Base Legal para o Tratamento" />
          <p>
            O tratamento dos dados pessoais pelo CyberLens fundamenta-se nas seguintes bases
            legais previstas no art. 7.º da LGPD:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              <strong className="text-[#e4e4e7]">Consentimento (art. 7.º, I):</strong> o registro
              de consentimento e o armazenamento da chave de API são realizados somente após o
              usuário concordar expressamente com esta Política;
            </li>
            <li>
              <strong className="text-[#e4e4e7]">Legítimo interesse (art. 7.º, IX):</strong> o
              armazenamento das preferências de configuração é necessário para garantir a
              funcionalidade básica da aplicação e proporcionar boa experiência ao usuário.
            </li>
          </ul>

          <Section number="5" title="Compartilhamento de Dados com Terceiros" />
          <p>
            O CyberLens <strong className="text-[#e4e4e7]">não vende, aluga nem comercializa</strong>{' '}
            quaisquer dados dos usuários.
          </p>
          <p>
            Ao solicitar uma análise, o aplicativo envia diretamente do navegador do usuário, sem
            intermediação de servidores do CyberLens, as seguintes informações ao provedor de IA
            selecionado:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>A chave de API, para fins de autenticação;</li>
            <li>
              O conteúdo textual do currículo ou documento enviado para análise e a descrição da
              vaga, ambos necessários para a geração do relatório.
            </li>
          </ul>
          <p>
            Esses dados são transmitidos diretamente ao provedor escolhido (Anthropic, OpenAI,
            Google ou Hugging Face) e estão sujeitos às políticas de privacidade e termos de serviço
            de cada provedor. O usuário é responsável por revisar as políticas do provedor antes de
            utilizar o serviço.
          </p>

          <Section number="6" title="Armazenamento Local (localStorage)" />
          <p>
            O CyberLens utiliza exclusivamente o mecanismo de{' '}
            <strong className="text-[#e4e4e7]">localStorage</strong> do navegador para persistir
            dados entre sessões. Esse armazenamento é local, vinculado ao domínio da aplicação e
            acessível apenas pelo próprio navegador no dispositivo do usuário.
          </p>
          <p>
            O CyberLens <strong className="text-[#e4e4e7]">não utiliza cookies</strong> de nenhum
            tipo: nem de sessão, nem de rastreamento, nem de publicidade.
          </p>

          <Section number="7" title="Cookies" />
          <p>
            Esta aplicação <strong className="text-[#e4e4e7]">não utiliza cookies</strong>. Nenhum
            cookie é criado, lido ou transmitido pelo CyberLens. O armazenamento de preferências
            é realizado integralmente via localStorage.
          </p>

          <Section number="8" title="Direitos do Titular dos Dados" />
          <p>
            Em conformidade com o <strong className="text-[#e4e4e7]">art. 18 da LGPD</strong>,
            o titular dos dados possui os seguintes direitos, exercíveis a qualquer momento:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-2">
            <li>
              <strong className="text-[#e4e4e7]">Confirmação da existência de tratamento:</strong>{' '}
              o usuário pode verificar quais dados o CyberLens trata por meio desta Política de
              Privacidade ou consultando o localStorage do navegador via DevTools (Application →
              Local Storage).
            </li>
            <li>
              <strong className="text-[#e4e4e7]">Acesso aos dados:</strong> o usuário pode
              consultar todos os dados armazenados localmente pelo CyberLens por meio das
              ferramentas de desenvolvedor do navegador (DevTools → Application → Local Storage),
              onde os registros ficam visíveis em formato JSON.
            </li>
            <li>
              <strong className="text-[#e4e4e7]">Correção de dados incompletos, inexatos ou desatualizados:</strong>{' '}
              o usuário pode corrigir ou atualizar a chave de API e as preferências de configuração
              diretamente na página de Configurações do CyberLens a qualquer momento.
            </li>
            <li>
              <strong className="text-[#e4e4e7]">Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos:</strong>{' '}
              como o CyberLens não opera servidores próprios, esse direito é exercido pelo próprio
              usuário por meio do botão "Limpar Todos os Dados" na página de Configurações, ou
              limpando o localStorage pelo navegador.
            </li>
            <li>
              <strong className="text-[#e4e4e7]">Portabilidade dos dados:</strong> os dados
              armazenados são texto simples em formato JSON, podendo ser copiados, exportados e
              transferidos livremente pelo usuário por meio das ferramentas nativas do navegador.
            </li>
            <li>
              <strong className="text-[#e4e4e7]">Eliminação dos dados tratados com consentimento:</strong>{' '}
              o usuário pode eliminar todos os dados locais a qualquer momento por meio do botão
              "Limpar Todos os Dados" na página de Configurações. Após a limpeza, o consentimento
              será solicitado novamente na próxima visita.
            </li>
            <li>
              <strong className="text-[#e4e4e7]">Informação sobre entidades com as quais houve compartilhamento:</strong>{' '}
              conforme descrito na Seção 5, os dados são enviados exclusivamente ao provedor de IA
              escolhido pelo próprio usuário (Anthropic, OpenAI, Google ou Hugging Face). O
              CyberLens não compartilha dados com nenhuma outra entidade.
            </li>
            <li>
              <strong className="text-[#e4e4e7]">Informação sobre a possibilidade de não fornecer consentimento e suas consequências:</strong>{' '}
              o usuário pode optar por não fornecer consentimento ao fechar o modal de aceite sem
              concordar. Nesse caso, o CyberLens não funcionará, pois o consentimento é necessário
              para o armazenamento da chave de API e das preferências de configuração.
            </li>
            <li>
              <strong className="text-[#e4e4e7]">Revogação do consentimento:</strong> o usuário
              pode revogar seu consentimento a qualquer momento por meio do botão "Limpar Todos os
              Dados" na página de Configurações. A revogação apagará todos os dados locais e o
              modal de consentimento será exibido novamente na próxima visita à aplicação.
            </li>
          </ul>
          <p>
            Para exercer quaisquer direitos que não possam ser atendidos pelas ferramentas da
            própria aplicação, entre em contato com o DPO pelo perfil no GitHub:{' '}
            <a href="https://github.com/eoLucasS" target="_blank" rel="noopener noreferrer" className="text-[#00ffd5] hover:underline">
              github.com/eoLucasS
            </a>
            .
          </p>

          <Section number="9" title="Segurança dos Dados" />
          <p>
            Como o CyberLens não opera servidores próprios para armazenamento de dados, as
            medidas de segurança relevantes são:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              Todas as requisições à API do provedor de IA são realizadas via HTTPS, garantindo
              criptografia em trânsito;
            </li>
            <li>
              A chave de API é armazenada em localStorage e não é exibida em texto claro na
              interface; o campo utiliza mascaramento do tipo "password";
            </li>
            <li>
              O usuário é responsável pela segurança do seu dispositivo e do acesso ao navegador.
            </li>
          </ul>

          <Section number="10" title="Transferência Internacional de Dados" />
          <p>
            Em conformidade com o{' '}
            <strong className="text-[#e4e4e7]">art. 33 da LGPD</strong>, o CyberLens informa que
            o processamento de dados pode envolver a transferência internacional para os países
            indicados abaixo, de acordo com o provedor de IA escolhido pelo próprio usuário:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              <strong className="text-[#e4e4e7]">OpenAI (GPT):</strong> servidores localizados
              nos <strong className="text-[#e4e4e7]">Estados Unidos</strong>.
            </li>
            <li>
              <strong className="text-[#e4e4e7]">Anthropic (Claude):</strong> servidores
              localizados nos <strong className="text-[#e4e4e7]">Estados Unidos</strong>.
            </li>
            <li>
              <strong className="text-[#e4e4e7]">Hugging Face:</strong> servidores localizados
              nos <strong className="text-[#e4e4e7]">Estados Unidos e/ou França</strong>.
            </li>
            <li>
              <strong className="text-[#e4e4e7]">Google (Gemini):</strong> servidores localizados
              nos <strong className="text-[#e4e4e7]">Estados Unidos</strong>.
            </li>
          </ul>
          <p>
            A base legal para essa transferência internacional é o{' '}
            <strong className="text-[#e4e4e7]">
              consentimento explícito do titular (art. 33, VIII, da LGPD)
            </strong>
            . Ao escolher um provedor de IA nas configurações do CyberLens e ao iniciar uma
            análise, o usuário consente expressamente com o envio do conteúdo textual do seu
            currículo e da descrição da vaga ao provedor selecionado, cujos servidores podem
            estar localizados fora do território brasileiro.
          </p>
          <p>
            Os dados transferidos são exclusivamente:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>O conteúdo textual do currículo submetido para análise;</li>
            <li>O conteúdo textual da descrição da vaga informada pelo usuário.</li>
          </ul>
          <p>
            Recomendamos que o usuário revise a política de privacidade do provedor escolhido
            antes de realizar uma análise:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              <a
                href="https://openai.com/policies/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00ffd5] hover:underline"
              >
                Política de Privacidade da OpenAI
              </a>
            </li>
            <li>
              <a
                href="https://www.anthropic.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00ffd5] hover:underline"
              >
                Política de Privacidade da Anthropic
              </a>
            </li>
            <li>
              <a
                href="https://huggingface.co/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00ffd5] hover:underline"
              >
                Política de Privacidade do Hugging Face
              </a>
            </li>
            <li>
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00ffd5] hover:underline"
              >
                Política de Privacidade do Google
              </a>
            </li>
          </ul>

          <Section number="11" title="Vigência e Atualizações desta Política" />
          <p>
            Esta Política entra em vigor na data indicada no cabeçalho e permanece válida até ser
            substituída por uma versão mais recente. Reservamo-nos o direito de atualizar este
            documento a qualquer momento para refletir mudanças na aplicação ou na legislação
            aplicável.
          </p>
          <p>
            A versão mais recente estará sempre disponível em{' '}
            <strong className="text-[#e4e4e7]">/privacidade</strong>. Em caso de alterações
            relevantes que impactem o tratamento de dados, o usuário será notificado por meio do
            modal de consentimento na próxima visita à aplicação.
          </p>

          <Section number="12" title="Lei Aplicável e Foro" />
          <p>
            Esta Política é regida pelas leis da República Federativa do Brasil, em especial pela{' '}
            <strong className="text-[#e4e4e7]">
              Lei Geral de Proteção de Dados Pessoais (LGPD, Lei n.º 13.709/2018)
            </strong>{' '}
            e pela Lei n.º 12.965/2014 (Marco Civil da Internet). Fica eleito o foro da comarca
            do domicílio do controlador para dirimir eventuais controvérsias.
          </p>

          <Section number="13" title="Contato" />
          <p>
            Para exercer seus direitos, esclarecer dúvidas ou realizar reclamações relacionadas ao
            tratamento de dados pessoais, entre em contato com o Encarregado pelo Tratamento de
            Dados (DPO):
          </p>
          <p className="mt-2">
            <strong className="text-[#e4e4e7]">GitHub:</strong>{' '}
            <a href="https://github.com/eoLucasS" target="_blank" rel="noopener noreferrer" className="text-[#00ffd5] hover:underline">
              github.com/eoLucasS
            </a>
          </p>
          <p>
            Você também pode registrar reclamações perante a{' '}
            <strong className="text-[#e4e4e7]">
              Autoridade Nacional de Proteção de Dados (ANPD)
            </strong>
            , disponível em{' '}
            <a
              href="https://www.gov.br/anpd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00ffd5] hover:underline"
            >
              www.gov.br/anpd
            </a>
            .
          </p>
        </div>

        {/* Footer note */}
        <div className="mt-12 pt-6 border-t border-white/10 text-xs text-[#9ca3af]">
          <p>
            CyberLens: Código aberto sob Licença MIT. Esta Política de Privacidade está em
            conformidade com a Lei n.º 13.709/2018 (LGPD).
          </p>
        </div>
      </div>
    </div>
  );
}
