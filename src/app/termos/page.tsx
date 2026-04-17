// Terms of Use page: static Server Component, zero client-side JavaScript.
// Complete legal text in Brazilian Portuguese covering all required topics.

export const metadata = {
  title: 'Termos de Uso | CyberLens',
  description:
    'Termos de Uso do CyberLens. Leia antes de utilizar o serviço de análise de aderência de currículo a vagas de emprego.',
};

// Helper component for numbered section headings
function Section({ number, title }: { number: string; title: string }) {
  return (
    <h2 className="text-lg font-semibold text-[#e4e4e7] mt-10 mb-3">
      {number}. {title}
    </h2>
  );
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 sm:py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Page header */}
        <div className="mb-6 sm:mb-8 pb-6 border-b border-white/10">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#e4e4e7]">Termos de Uso</h1>
          <p className="mt-2 text-sm text-[#9ca3af]">
            Última atualização: 24 de março de 2026
          </p>
          <p className="mt-3 text-sm text-[#9ca3af]">
            Ao utilizar o CyberLens, você concorda com os presentes Termos de Uso. Leia-os
            atentamente antes de prosseguir.
          </p>
        </div>

        {/* Body */}
        <div className="text-[#9ca3af] text-sm leading-relaxed space-y-2">

          <Section number="1" title="Descrição do Serviço" />
          <p>
            O CyberLens é uma aplicação web de código aberto que utiliza modelos de linguagem de
            inteligência artificial (IA) de terceiros para analisar a aderência de currículos a
            descrições de vagas de emprego em qualquer área profissional. O serviço processa o
            texto do currículo e da vaga fornecidos pelo próprio usuário e gera relatórios
            automatizados com pontuação de aderência, lacunas identificadas, sugestões de
            reescrita e plano de estudos personalizado.
          </p>
          <p>
            O CyberLens também disponibiliza uma página de demonstração acessível em{' '}
            <strong className="text-[#e4e4e7]">/demo</strong>, com análises pré-geradas a partir
            de dados fictícios, que não consome créditos de API e não coleta nenhum dado do
            visitante.
          </p>
          <p>
            O usuário pode optar por salvar localmente suas análises através da rota /historico,
            ativando o toggle &apos;Salvar histórico&apos; nas Configurações. O histórico é
            armazenado exclusivamente no navegador do usuário (localStorage), com limite de 10
            entradas em rotação FIFO. O usuário tem controle total para desativar, apagar
            individualmente ou limpar todo o histórico a qualquer momento.
          </p>
          <p>
            O CyberLens é disponibilizado gratuitamente, sem garantias de disponibilidade contínua
            ou suporte técnico formal.
          </p>

          <Section number="2" title="Natureza Informativa dos Resultados" />
          <p>
            Os relatórios e análises gerados pelo CyberLens têm{' '}
            <strong className="text-[#e4e4e7]">caráter exclusivamente informativo</strong> e não
            constituem:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Consultoria técnica, jurídica ou de segurança da informação;</li>
            <li>Auditoria formal de conformidade com qualquer framework ou norma;</li>
            <li>Certificação, atestado ou garantia de conformidade regulatória;</li>
            <li>
              Aconselhamento profissional de qualquer natureza sobre riscos de segurança
              cibernética.
            </li>
          </ul>
          <p>
            Os resultados gerados pela IA podem conter imprecisões, omissões ou interpretações
            incorretas. Qualquer decisão de negócio, investimento em segurança ou ação regulatória
            deve ser tomada com base na avaliação de profissionais qualificados.
          </p>

          <Section number="3" title="Custos de API e Responsabilidade Financeira" />
          <p>
            O uso do CyberLens requer que o usuário forneça sua própria chave de API de um
            provedor de IA (Anthropic, OpenAI, Google ou Hugging Face). As requisições são
            realizadas diretamente do navegador do usuário para o provedor escolhido e são{' '}
            <strong className="text-[#e4e4e7]">cobradas pelo provedor</strong> conforme seus
            planos de preços.
          </p>
          <p>
            O CyberLens{' '}
            <strong className="text-[#e4e4e7]">
              não é responsável por quaisquer custos financeiros
            </strong>{' '}
            incorridos pelo usuário decorrentes do uso da API do provedor. O usuário é inteiramente
            responsável pelo monitoramento e controle do seu consumo de API.
          </p>

          <Section number="4" title="Propriedade Intelectual" />
          <p>
            O código-fonte do CyberLens está licenciado sob a{' '}
            <strong className="text-[#e4e4e7]">Licença MIT</strong>, permitindo uso, cópia,
            modificação, fusão, publicação, distribuição, sublicenciamento e venda de cópias, desde
            que mantido o aviso de copyright original.
          </p>
          <p>
            O conteúdo gerado pelos modelos de IA como resultado de análises é produzido pelos
            sistemas de terceiros (provedores de IA) e está sujeito às políticas de uso aceitável
            e termos de propriedade intelectual de cada provedor. O CyberLens não reivindica
            propriedade sobre o conteúdo gerado pela IA.
          </p>
          <p>
            O usuário retém todos os direitos sobre os documentos e textos que enviar para análise.
          </p>

          <Section number="5" title="Uso Aceitável e Restrições" />
          <p>Ao utilizar o CyberLens, o usuário concorda em não:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              Utilizar o serviço para finalidades ilegais, fraudulentas ou que violem direitos de
              terceiros;
            </li>
            <li>
              Enviar conteúdo que contenha dados pessoais sensíveis de terceiros sem o devido
              consentimento;
            </li>
            <li>
              Tentar explorar vulnerabilidades do aplicativo ou interferir em seu funcionamento;
            </li>
            <li>
              Contornar mecanismos de segurança ou usar a aplicação de forma a violar os termos de
              uso dos provedores de IA integrados;
            </li>
            <li>
              Reproduzir, redistribuir ou sublicenciar o software em violação à Licença MIT.
            </li>
          </ul>

          <Section number="6" title="Disponibilidade do Serviço" />
          <p>
            O CyberLens é fornecido{' '}
            <strong className="text-[#e4e4e7]">"no estado em que se encontra" (as is)</strong>,
            sem garantia de disponibilidade, continuidade ou ausência de erros. O serviço pode ser
            descontinuado, modificado ou atualizado a qualquer momento, sem aviso prévio.
          </p>
          <p>
            A disponibilidade das funcionalidades de análise depende também da disponibilidade das
            APIs dos provedores de IA, sobre as quais o CyberLens não tem controle.
          </p>

          <Section number="7" title="Limitação de Responsabilidade" />
          <p>
            Na máxima extensão permitida pela legislação brasileira aplicável, o CyberLens e seus
            mantenedores{' '}
            <strong className="text-[#e4e4e7]">não serão responsáveis</strong> por:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              Danos diretos, indiretos, incidentais, especiais ou consequenciais decorrentes do
              uso ou da impossibilidade de uso do serviço;
            </li>
            <li>
              Imprecisões, erros ou omissões nos relatórios gerados pela IA;
            </li>
            <li>
              Decisões tomadas pelo usuário com base nos resultados das análises;
            </li>
            <li>
              Custos de API ou outros encargos financeiros junto a provedores de IA;
            </li>
            <li>
              Perda, vazamento ou acesso não autorizado à chave de API armazenada no dispositivo
              do usuário.
            </li>
          </ul>

          <Section number="8" title="Isenção de Responsabilidade (Disclaimer)" />
          <p>
            O CyberLens é um projeto independente, sem vínculo com nenhum dos provedores de IA
            integrados (Anthropic, OpenAI, Google, Hugging Face) nem com os organismos
            responsáveis pelos frameworks de segurança referenciados (NIST, ISO, CIS).
          </p>
          <p>
            O SOFTWARE É FORNECIDO "COMO ESTÁ" (AS IS), SEM GARANTIA DE QUALQUER TIPO, EXPRESSA
            OU IMPLÍCITA, INCLUINDO, MAS NÃO SE LIMITANDO ÀS GARANTIAS DE COMERCIALIZAÇÃO,
            ADEQUAÇÃO A UM DETERMINADO FIM E NÃO VIOLAÇÃO. EM NENHUMA CIRCUNSTÂNCIA OS AUTORES OU
            TITULARES DE DIREITOS AUTORAIS SERÃO RESPONSÁVEIS POR QUALQUER RECLAMAÇÃO, DANO OU
            OUTRA RESPONSABILIDADE.
          </p>

          <Section number="9" title="Modificações nos Termos" />
          <p>
            Estes Termos podem ser atualizados periodicamente. A versão mais recente estará sempre
            disponível em <strong className="text-[#e4e4e7]">/termos</strong>. O uso continuado do
            CyberLens após a publicação de alterações implica a aceitação dos novos Termos. Em caso
            de alterações relevantes, o usuário será notificado pelo modal de consentimento na
            próxima visita.
          </p>

          <Section number="10" title="Lei Aplicável e Foro" />
          <p>
            Estes Termos de Uso são regidos pelas leis da{' '}
            <strong className="text-[#e4e4e7]">República Federativa do Brasil</strong>, em
            especial pelo Código de Defesa do Consumidor (Lei n.º 8.078/1990), pelo Marco Civil da
            Internet (Lei n.º 12.965/2014) e pela Lei Geral de Proteção de Dados (Lei n.º
            13.709/2018, a LGPD).
          </p>
          <p>
            Fica eleito o foro do domicílio do mantenedor do projeto para dirimir quaisquer
            controvérsias oriundas destes Termos, com renúncia expressa a qualquer outro, por mais
            privilegiado que seja.
          </p>

          <Section number="11" title="Contato" />
          <p>
            Dúvidas sobre estes Termos podem ser enviadas por meio do perfil do
            desenvolvedor no GitHub:{' '}
            <a href="https://github.com/eoLucasS" target="_blank" rel="noopener noreferrer" className="text-[#00ffd5] hover:underline">
              github.com/eoLucasS
            </a>
            .
          </p>
        </div>

        {/* Footer note */}
        <div className="mt-12 pt-6 border-t border-white/10 text-xs text-[#9ca3af]">
          <p>
            CyberLens: Código aberto sob Licença MIT. Estes Termos de Uso são regidos pela
            legislação brasileira.
          </p>
        </div>
      </div>
    </div>
  );
}
