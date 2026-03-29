// About page: static Server Component, zero client-side JavaScript.

import { Shield, ExternalLink, Code, ChevronDown, Upload, Search, BarChart3, BookOpen, Lock, Eye, Database, Zap } from 'lucide-react';

export const metadata = {
  title: 'Sobre o CyberLens',
  description:
    'Conheça o CyberLens: ferramenta gratuita que analisa seu currículo e mostra como melhorar para a vaga que você quer.',
};

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-xl border border-white/[0.06] bg-[#141420]">
      <summary className="flex items-center justify-between cursor-pointer px-4 py-3.5 sm:px-5 sm:py-4 text-[13px] sm:text-sm font-medium text-[#e4e4e7] hover:text-white transition-colors list-none [&::-webkit-details-marker]:hidden min-h-[44px]">
        {question}
        <ChevronDown size={16} className="shrink-0 ml-3 text-[#9ca3af] transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-3.5 sm:px-5 sm:pb-4 text-[13px] text-[#9ca3af] leading-relaxed border-t border-white/[0.04] pt-3">
        {answer}
      </div>
    </details>
  );
}

function StepCard({ number, icon, title, description }: { number: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00ffd5]/10 border border-[#00ffd5]/20 text-[#00ffd5]">
          {icon}
        </div>
        <div className="mt-2 w-px flex-1 bg-[#00ffd5]/10" />
      </div>
      <div className="pb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#00ffd5] mb-1">Passo {number}</p>
        <h3 className="text-sm font-semibold text-[#e4e4e7] mb-1.5">{title}</h3>
        <p className="text-[13px] text-[#9ca3af] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#141420] px-4 py-3 sm:px-5 sm:py-4 text-center">
      <p className="text-xl sm:text-2xl font-bold text-[#00ffd5]">{value}</p>
      <p className="text-[11px] sm:text-xs text-[#9ca3af] mt-1">{label}</p>
    </div>
  );
}

export default function SobrePage() {
  return (
    <div className="min-h-screen py-8 sm:py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Hero */}
        <div className="mb-10 sm:mb-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00ffd5]/10 text-[#00ffd5] text-xs font-medium mb-4">
            <Shield size={14} />
            Gratuito e open source
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Descubra o quanto seu currículo
            <br className="hidden sm:block" />
            {' '}combina com a vaga dos seus sonhos
          </h1>
          <p className="mt-3 text-sm sm:text-[15px] text-[#9ca3af] max-w-xl mx-auto leading-relaxed">
            O CyberLens lê seu currículo, compara com a descrição da vaga e te mostra
            exatamente o que está bom, o que falta, e como se preparar.
          </p>
        </div>

        <div className="space-y-10 sm:space-y-14">

          {/* Numbers */}
          <section>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <StatCard value="4" label="Provedores de IA" />
              <StatCard value="0" label="Dados armazenados" />
              <StatCard value="100%" label="Processamento local" />
            </div>
          </section>

          {/* What it does (user-focused) */}
          <section>
            <h2 className="text-lg font-semibold text-[#e4e4e7] mb-3">O que o CyberLens faz por você</h2>
            <div className="text-sm text-[#9ca3af] leading-relaxed space-y-3">
              <p>
                Você já ficou sem resposta depois de se candidatar a uma vaga? Sem saber se seu
                currículo tem as palavras certas, se sua experiência encaixa, ou o que estudar para
                melhorar suas chances?
              </p>
              <p>
                O CyberLens resolve isso. Ele usa inteligência artificial para comparar seu
                currículo com a vaga e te entregar um diagnóstico completo:
              </p>
              <ul className="space-y-2 ml-1">
                <li className="flex items-start gap-2">
                  <BarChart3 size={16} className="shrink-0 text-[#00ffd5] mt-0.5" />
                  <span><strong className="text-[#e4e4e7]">Nota de compatibilidade</strong> de 0 a 100%, com classificação visual</span>
                </li>
                <li className="flex items-start gap-2">
                  <Search size={16} className="shrink-0 text-[#00ff88] mt-0.5" />
                  <span><strong className="text-[#e4e4e7]">Habilidades encontradas</strong> no seu currículo que combinam com a vaga</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap size={16} className="shrink-0 text-[#ffd32a] mt-0.5" />
                  <span><strong className="text-[#e4e4e7]">Lacunas identificadas</strong>, classificadas por importância (crítica, importante, desejável)</span>
                </li>
                <li className="flex items-start gap-2">
                  <BookOpen size={16} className="shrink-0 text-[#a855f7] mt-0.5" />
                  <span><strong className="text-[#e4e4e7]">Plano de estudos personalizado</strong> com cursos, certificações e recursos reais</span>
                </li>
              </ul>
              <p>
                Funciona para <strong className="text-[#e4e4e7]">qualquer área</strong>: TI,
                dados, cibersegurança, DevOps, suporte, gestão, desenvolvimento, ou qualquer
                outra. Você escolhe a vaga, o CyberLens se adapta.
              </p>
            </div>
          </section>

          {/* How it works (simple steps) */}
          <section>
            <h2 className="text-lg font-semibold text-[#e4e4e7] mb-5">Como funciona</h2>
            <div>
              <StepCard
                number="1"
                icon={<Upload size={18} />}
                title="Envie seu currículo"
                description="Faça upload do PDF. O texto é extraído direto no seu navegador, sem enviar para nenhum servidor. Se for um PDF escaneado (imagem), o sistema detecta automaticamente e oferece leitura por reconhecimento de caracteres."
              />
              <StepCard
                number="2"
                icon={<Search size={18} />}
                title="Cole a descrição da vaga"
                description="Copie e cole o texto da vaga que você quer se candidatar. Pode ser de qualquer site (LinkedIn, Gupy, Catho, Indeed, Glassdoor, ou direto da empresa)."
              />
              <StepCard
                number="3"
                icon={<Zap size={18} />}
                title="O CyberLens analisa"
                description="Antes de consultar a IA, o sistema identifica automaticamente as palavras-chave da vaga e compara com seu currículo. Depois, envia tudo organizado para a inteligência artificial, que faz uma análise de contexto profunda."
              />
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00ffd5]/10 border border-[#00ffd5]/20 text-[#00ffd5]">
                    <BarChart3 size={18} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#00ffd5] mb-1">Passo 4</p>
                  <h3 className="text-sm font-semibold text-[#e4e4e7] mb-1.5">Receba seu diagnóstico</h3>
                  <p className="text-[13px] text-[#9ca3af] leading-relaxed">Visualize sua nota, habilidades encontradas, gaps, palavras-chave ausentes, análise de experiência e um plano de estudos completo. Tudo exportável em PDF.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Trust / Privacy (user-focused) */}
          <section>
            <h2 className="text-lg font-semibold text-[#e4e4e7] mb-4">Seus dados, suas regras</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-xl border border-white/[0.06] bg-[#141420] p-4 text-center">
                <Lock size={20} className="mx-auto text-[#00ffd5] mb-2" />
                <p className="text-xs font-semibold text-[#e4e4e7] mb-1">Sem servidores</p>
                <p className="text-[11px] text-[#9ca3af] leading-relaxed">Seu currículo é processado no seu navegador. Não passa por nenhum servidor nosso.</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-[#141420] p-4 text-center">
                <Eye size={20} className="mx-auto text-[#00ffd5] mb-2" />
                <p className="text-xs font-semibold text-[#e4e4e7] mb-1">Você no controle</p>
                <p className="text-[11px] text-[#9ca3af] leading-relaxed">Você escolhe qual IA usar e sua chave de API fica salva só no seu navegador.</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-[#141420] p-4 text-center">
                <Database size={20} className="mx-auto text-[#00ffd5] mb-2" />
                <p className="text-xs font-semibold text-[#e4e4e7] mb-1">Zero rastreamento</p>
                <p className="text-[11px] text-[#9ca3af] leading-relaxed">Sem cookies, sem analytics, sem coleta de dados. O CyberLens não sabe quem você é.</p>
              </div>
            </div>
          </section>

          {/* FAQ (user questions, not dev questions) */}
          <section>
            <h2 className="text-lg font-semibold text-[#e4e4e7] mb-4">Perguntas frequentes</h2>
            <div className="space-y-2">
              <FaqItem
                question="Preciso pagar para usar?"
                answer="O CyberLens é gratuito. O que pode ter custo é a IA que analisa seu currículo, porque cada provedor (OpenAI, Google, Anthropic) cobra pelo uso da API. Mas o Hugging Face oferece créditos gratuitos todo mês, então dá para começar sem gastar nada. O CyberLens já vem configurado com o Hugging Face como padrão."
              />
              <FaqItem
                question="É seguro enviar meu currículo?"
                answer="Sim. Seu currículo é lido direto no seu navegador, sem passar por nenhum servidor nosso. O único momento em que o texto sai do seu computador é quando vai para a IA que você escolheu (OpenAI, Google, etc.), usando a sua própria chave de API. Nós não armazenamos, não lemos e não temos acesso a nenhum dado seu."
              />
              <FaqItem
                question="Funciona para qualquer tipo de vaga?"
                answer="Sim. Apesar do visual temático do projeto, o CyberLens funciona para qualquer área: tecnologia, dados, cibersegurança, DevOps, suporte, gestão, marketing, design, ou qualquer outra. A inteligência artificial se adapta ao contexto da vaga que você colar."
              />
              <FaqItem
                question="O que é essa 'chave de API' que preciso configurar?"
                answer="É uma senha que você cria no site do provedor de IA (como OpenAI, Google ou Hugging Face). Com ela, você se conecta diretamente ao serviço de IA, sem intermediários. O CyberLens usa essa chave para enviar seu currículo e a vaga para análise. A chave fica salva só no seu navegador."
              />
              <FaqItem
                question="E se meu currículo for um PDF escaneado (imagem)?"
                answer="O CyberLens detecta automaticamente quando o PDF não tem texto selecionável e oferece a opção de ler a imagem usando reconhecimento de caracteres (OCR). Todo o processamento acontece no seu navegador, sem enviar a imagem para nenhum lugar. A precisão depende da qualidade da digitalização."
              />
              <FaqItem
                question="Quais provedores de IA posso usar?"
                answer="OpenAI (GPT-4o), Anthropic (Claude), Google (Gemini) e Hugging Face (modelos open-source como Llama e Qwen). Cada um tem seus pontos fortes. O Hugging Face é a opção gratuita. Você pode trocar de provedor a qualquer momento nas configurações."
              />
              <FaqItem
                question="O resultado da análise é 100% preciso?"
                answer="Não. A análise é feita por inteligência artificial e tem caráter orientativo. Ela pode conter imprecisões e não substitui a avaliação de um recrutador. Use como referência para entender onde melhorar, quais skills desenvolver e como se preparar melhor para a vaga."
              />
              <FaqItem
                question="Posso exportar o resultado?"
                answer="Sim. Depois da análise, você pode exportar o relatório completo em PDF, com todas as seções: nota, skills, lacunas, plano de estudos e mais. O PDF é gerado direto no seu navegador."
              />
              <FaqItem
                question="O projeto é open source?"
                answer="Sim, 100%. O código-fonte está disponível no GitHub sob licença MIT, o que significa que qualquer pessoa pode ver, usar, modificar e contribuir. Se você é desenvolvedor e quer ajudar, o repositório tem guia de contribuição e documentação técnica completa."
              />
            </div>
          </section>

          {/* For devs (collapsed, secondary) */}
          <section>
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[#9ca3af] hover:text-[#e4e4e7] transition-colors list-none [&::-webkit-details-marker]:hidden">
                <Code size={16} />
                Para desenvolvedores: stack técnica
                <ChevronDown size={14} className="transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    'Next.js (App Router)', 'React', 'TypeScript (strict)', 'Tailwind CSS v4',
                    'pdfjs-dist', 'Tesseract.js (OCR)', 'TF-IDF (NLP)', '@react-pdf/renderer',
                    'Lucide React', 'OpenAI API', 'Anthropic API', 'Google Gemini API',
                    'HuggingFace Inference', 'Vercel',
                  ].map((tech) => (
                    <span key={tech} className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#0d0d18] border border-white/[0.06] text-[#9ca3af]">
                      {tech}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  PDF parsing 100% client-side via pdfjs-dist. OCR via Tesseract.js (WASM). NLP local com
                  TF-IDF para extração de keywords e section parser para estruturação do currículo.
                  Proxy CORS via Next.js API Routes apenas para Anthropic e HuggingFace. Zero banco de dados.
                  TypeScript strict, zero any. Conformidade com LGPD (Lei 13.709/2018).
                </p>
              </div>
            </details>
          </section>

          {/* CTA */}
          <section className="text-center space-y-3">
            <a
              href="https://github.com/eoLucasS/CyberLens"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#141420] border border-white/[0.06] text-[#e4e4e7] font-medium text-sm hover:border-[#00ffd5]/20 hover:text-white transition-all duration-200"
            >
              <Code size={18} />
              Ver código no GitHub
              <ExternalLink size={14} className="text-[#9ca3af]" />
            </a>
            <p className="text-xs text-[#9ca3af]">
              Licença MIT. Código aberto, livre para usar e contribuir.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.06] text-center">
          <p className="text-xs text-[#9ca3af]">
            CyberLens. Código aberto sob Licença MIT.
          </p>
        </div>
      </div>
    </div>
  );
}
