import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  PageBreak,
} from 'docx';
import * as fs from 'fs';
import * as path from 'path';

// ─── Shared Constants ────────────────────────────────────────────────────────
const TEAL = '0D9488';
const DARK = '1F2937';
const GRAY = '6B7280';
const LIGHT_GRAY = 'F3F4F6';
const WHITE = 'FFFFFF';
const FONT = 'Calibri';
const DATE = '24 de março de 2026';
const VERSION = '1.0.0';

// ─── Helper: heading1 ────────────────────────────────────────────────────────
function heading1(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { after: 200 },
    children: [
      new TextRun({
        text,
        color: TEAL,
        font: FONT,
        size: 32,
        bold: true,
      }),
    ],
  });
}

// ─── Helper: heading2 ────────────────────────────────────────────────────────
function heading2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { after: 150 },
    children: [
      new TextRun({
        text,
        color: DARK,
        font: FONT,
        size: 26,
        bold: true,
      }),
    ],
  });
}

// ─── Helper: heading3 ────────────────────────────────────────────────────────
function heading3(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { after: 100 },
    children: [
      new TextRun({
        text,
        color: DARK,
        font: FONT,
        size: 22,
        bold: true,
      }),
    ],
  });
}

// ─── Helper: bodyText ────────────────────────────────────────────────────────
function bodyText(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 120, line: 360 },
    children: [
      new TextRun({
        text,
        color: DARK,
        font: FONT,
        size: 22,
      }),
    ],
  });
}

// ─── Helper: bulletItem ──────────────────────────────────────────────────────
function bulletItem(text: string, bold?: string): Paragraph {
  const children: TextRun[] = [];
  if (bold) {
    children.push(
      new TextRun({ text: bold + ': ', font: FONT, size: 22, bold: true, color: DARK }),
      new TextRun({ text, font: FONT, size: 22, color: DARK }),
    );
  } else {
    children.push(new TextRun({ text, font: FONT, size: 22, color: DARK }));
  }
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children,
  });
}

// ─── Helper: numberedItem ────────────────────────────────────────────────────
function numberedItem(text: string): Paragraph {
  return new Paragraph({
    numbering: { reference: 'default-numbering', level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: FONT, size: 22, color: DARK })],
  });
}

// ─── Helper: spacer ──────────────────────────────────────────────────────────
function spacer(): Paragraph {
  return new Paragraph({ spacing: { after: 120 }, children: [] });
}

// ─── Helper: coverPage ───────────────────────────────────────────────────────
function coverPage(title: string, subtitle: string): Paragraph[] {
  return [
    new Paragraph({ spacing: { after: 2000 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: 'CyberLens',
          font: FONT,
          size: 36,
          bold: true,
          color: TEAL,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [
        new TextRun({
          text: title,
          font: FONT,
          size: 56,
          bold: true,
          color: TEAL,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: subtitle,
          font: FONT,
          size: 32,
          color: GRAY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `CyberLens v${VERSION}`,
          font: FONT,
          size: 28,
          color: GRAY,
          italics: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: '─────────────────────────────────────',
          font: FONT,
          size: 22,
          color: TEAL,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({ text: DATE, font: FONT, size: 22, color: GRAY }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 2000 },
      children: [
        new TextRun({ text: 'Autor: Lucas Silva', font: FONT, size: 22, color: GRAY }),
      ],
    }),
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
}

// ─── Helper: createDocument ──────────────────────────────────────────────────
function createDocument(
  title: string,
  coverTitle: string,
  coverSubtitle: string,
  content: (Paragraph | Table)[],
): Document {
  const cover = coverPage(coverTitle, coverSubtitle);

  return new Document({
    numbering: {
      config: [
        {
          reference: 'default-numbering',
          levels: [
            {
              level: 0,
              format: NumberFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: { indent: { left: 720, hanging: 360 } },
              },
            },
          ],
        },
      ],
    },
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 22, color: DARK },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: title, font: FONT, size: 18, color: GRAY }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `CyberLens v${VERSION}`, font: FONT, size: 18, color: GRAY }),
                  new TextRun({ text: '\t\t', font: FONT, size: 18 }),
                  new TextRun({ text: 'Página ', font: FONT, size: 18, color: GRAY }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT,
                    size: 18,
                    color: GRAY,
                  }),
                  new TextRun({ text: ' de ', font: FONT, size: 18, color: GRAY }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: FONT,
                    size: 18,
                    color: GRAY,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [...cover, ...content],
      },
    ],
  });
}

// ─── Helper: saveDocument ────────────────────────────────────────────────────
async function saveDocument(doc: Document, filename: string): Promise<void> {
  const docsDir = path.join(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(docsDir, filename), buffer);
  console.log(`  ✔ docs/${filename}`);
}

// ─── Helper: tableHeader ─────────────────────────────────────────────────────
function tableHeader(texts: string[]): TableRow {
  return new TableRow({
    tableHeader: true,
    children: texts.map(
      (text) =>
        new TableCell({
          shading: { type: ShadingType.SOLID, color: TEAL, fill: TEAL },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text, font: FONT, size: 20, bold: true, color: WHITE }),
              ],
            }),
          ],
        }),
    ),
  });
}

function tableRow(cells: string[], shade?: boolean): TableRow {
  return new TableRow({
    children: cells.map(
      (text) =>
        new TableCell({
          shading: shade ? { type: ShadingType.SOLID, color: LIGHT_GRAY, fill: LIGHT_GRAY } : undefined,
          children: [
            new Paragraph({
              children: [new TextRun({ text, font: FONT, size: 20, color: DARK })],
            }),
          ],
        }),
    ),
  });
}

function createTable(headers: string[], rows: string[][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideH: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideV: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    },
    rows: [
      tableHeader(headers),
      ...rows.map((row, i) => tableRow(row, i % 2 === 0)),
    ],
  });
}

// ════════════════════════════════════════════════════════════════════════════
// DOCUMENT 1: Visão Geral do Projeto
// ════════════════════════════════════════════════════════════════════════════
async function generateDoc1(): Promise<void> {
  console.log('\n[1/6] Gerando 01-visao-geral.docx...');

  const stackTable = createTable(
    ['Tecnologia', 'Versão', 'Justificativa'],
    [
      ['Next.js', '16', 'Framework React com suporte a rotas API para proxy CORS; deploy zero-config na Vercel'],
      ['React', '19', 'Biblioteca de UI com suporte a Server Components e melhor performance'],
      ['TypeScript', '5', 'Type safety, manutenibilidade e zero any policy'],
      ['Tailwind CSS', '4', 'Utility-first CSS; produtividade máxima sem CSS customizado'],
      ['pdfjs-dist', '5', 'Parsing de PDF client-side sem enviar arquivo para servidor'],
      ['@react-pdf/renderer', '4', 'Geração de PDF no browser com componentes React'],
      ['Lucide React', 'latest', 'Ícones consistentes e acessíveis como componentes React'],
      ['docx', 'latest', 'Geração de documentos .docx para esta documentação'],
    ],
  );

  const glossaryTable = createTable(
    ['Termo', 'Definição'],
    [
      ['LGPD', 'Lei Geral de Proteção de Dados, Lei 13.709/2018, que regula o tratamento de dados pessoais no Brasil'],
      ['CORS', 'Cross-Origin Resource Sharing: mecanismo HTTP que permite requisições entre origens diferentes'],
      ['API Key', 'Chave de autenticação secreta fornecida por provedores de IA para autorizar chamadas à API'],
      ['Provider', 'Fornecedor de modelo de IA: OpenAI, Anthropic (Claude), Google (Gemini) ou HuggingFace'],
      ['Score de Aderência', 'Pontuação de 0 a 100% indicando o grau de compatibilidade do currículo com a vaga'],
      ['Gap', 'Habilidade, certificação ou experiência presente na descrição da vaga e ausente no currículo'],
      ['Parsing', 'Processo de extração e interpretação de texto estruturado de um documento PDF'],
      ['Client-side', 'Processamento executado no navegador do usuário, sem envio de dados ao servidor'],
      ['localStorage', 'Mecanismo de armazenamento persistente do navegador, com escopo por domínio, sem expiração'],
    ],
  );

  const content: (Paragraph | Table)[] = [
    heading1('1. Introdução e Contexto'),
    bodyText(
      'O mercado de cybersecurity é altamente especializado e competitivo. Profissionais da área frequentemente precisam avaliar a aderência de seus currículos a descrições de vagas específicas, identificar lacunas de conhecimento e planejar seu desenvolvimento profissional de forma direcionada.',
    ),
    bodyText(
      'O processo manual de comparar um currículo com uma descrição de vaga é demorado, subjetivo e propenso a erros. Palavras-chave específicas de tecnologias, certificações e ferramentas podem passar despercebidas, resultando em candidaturas mal direcionadas ou planos de estudo ineficazes.',
    ),
    bodyText(
      'O CyberLens resolve esse problema utilizando Inteligência Artificial para automatizar a análise de aderência entre currículo e vaga. A aplicação extrai o texto do PDF do currículo diretamente no navegador do usuário, combina com a descrição da vaga fornecida, e envia ambos para um modelo de IA configurado pelo próprio usuário, mantendo total controle sobre seus dados.',
    ),
    spacer(),

    heading1('2. Objetivo'),
    bodyText('O CyberLens tem como objetivos principais:'),
    bulletItem('Analisar a aderência do currículo a uma descrição de vaga de cybersecurity, gerando um score percentual objetivo'),
    bulletItem('Identificar gaps de habilidades, certificações e experiências com classificação por prioridade (Crítico, Importante, Desejável)'),
    bulletItem('Gerar planos de estudo personalizados com recursos específicos para suprir os gaps identificados'),
    bulletItem('Garantir a privacidade do usuário através de processamento client-side, sem armazenamento de dados pessoais em servidores'),
    spacer(),

    heading1('3. Público-Alvo'),
    bulletItem('Profissionais de cybersecurity que estão buscando novas posições e desejam avaliar seu fit com vagas específicas'),
    bulletItem('Estudantes da área de segurança da informação que querem entender o que o mercado exige e planejar seus estudos'),
    bulletItem('Recrutadores e gestores que precisam avaliar rapidamente a compatibilidade de candidatos com requisitos técnicos'),
    bulletItem('Profissionais de TI em transição de carreira para a área de cybersecurity que precisam identificar lacunas de conhecimento'),
    spacer(),

    heading1('4. Escopo'),
    heading2('4.1 O que o CyberLens FAZ'),
    bulletItem('Parsing de PDF de currículo diretamente no navegador (client-side, sem upload para servidor)'),
    bulletItem('Análise com IA multi-provider (OpenAI, Anthropic, Google Gemini, HuggingFace)'),
    bulletItem('Geração de score de aderência de 0 a 100%'),
    bulletItem('Identificação de skills encontradas e gaps de habilidades'),
    bulletItem('Listagem de palavras-chave ausentes'),
    bulletItem('Análise de experiência e certificações'),
    bulletItem('Geração de plano de estudos personalizado com recursos'),
    bulletItem('Exportação do relatório completo em PDF'),
    spacer(),

    heading2('4.2 O que o CyberLens NÃO FAZ'),
    bulletItem('Não mantém banco de dados de currículos ou vagas'),
    bulletItem('Não cria contas de usuário nem autentica usuários'),
    bulletItem('Não armazena dados pessoais em servidores'),
    bulletItem('Não substitui aconselhamento profissional de carreira ou recrutamento humano'),
    bulletItem('Não realiza parsing de formatos além de PDF (DOC, DOCX, TXT não são suportados diretamente)'),
    spacer(),

    heading1('5. Requisitos Funcionais'),
    createTable(
      ['ID', 'Requisito', 'Descrição'],
      [
        ['RF-01', 'Upload de Currículo', 'Permitir upload de arquivo PDF com parsing client-side usando pdfjs-dist'],
        ['RF-02', 'Input de Vaga', 'Campo de texto para descrição da vaga com validação de 100 a 10.000 caracteres'],
        ['RF-03', 'Análise com IA', 'Integração com múltiplos provedores de IA com retry automático e timeout configurável'],
        ['RF-04', 'Score de Aderência', 'Calcular e exibir score de 0 a 100% com classificação visual por faixas'],
        ['RF-05', 'Skills Encontradas', 'Listar as habilidades do currículo que correspondem à descrição da vaga'],
        ['RF-06', 'Gaps Classificados', 'Identificar e classificar gaps por prioridade: Crítico, Importante, Desejável'],
        ['RF-07', 'Palavras-chave Ausentes', 'Listar keywords presentes na vaga e ausentes no currículo'],
        ['RF-08', 'Análise de Experiência', 'Avaliar anos de experiência e certificações relevantes'],
        ['RF-09', 'Plano de Estudos', 'Gerar plano personalizado com recursos (cursos, certificações, documentações)'],
        ['RF-10', 'Exportação PDF', 'Exportar relatório completo em PDF para download via @react-pdf/renderer'],
        ['RF-11', 'Configurações', 'Permitir configurar provider, modelo e API key com teste de conexão'],
        ['RF-12', 'Consentimento LGPD', 'Modal bloqueante de aceite obrigatório com checkbox e link para política de privacidade'],
      ],
    ),
    spacer(),

    heading1('6. Requisitos Não-Funcionais'),
    createTable(
      ['ID', 'Requisito', 'Descrição'],
      [
        ['RNF-01', 'Performance', 'Análise completa deve ser concluída em menos de 60 segundos em conexão normal'],
        ['RNF-02', 'Responsividade', 'Interface mobile-first com suporte a telas de 320px a 4K'],
        ['RNF-03', 'Acessibilidade', 'Conformidade com WCAG 2.1 nível AA: contraste, navegação por teclado, ARIA'],
        ['RNF-04', 'Segurança', 'Headers HTTP de segurança, sanitização de inputs, ausência de eval()'],
        ['RNF-05', 'Privacidade', 'Zero server storage de dados pessoais; conformidade LGPD'],
        ['RNF-06', 'Compatibilidade', 'Suporte aos últimas versões de Chrome, Firefox, Safari e Edge'],
        ['RNF-07', 'Deploy', 'Deploy zero-config na Vercel sem variáveis de ambiente obrigatórias'],
        ['RNF-08', 'Manutenibilidade', 'TypeScript strict mode, zero uso de any, um componente por arquivo'],
      ],
    ),
    spacer(),

    heading1('7. Stack Tecnológica'),
    stackTable,
    spacer(),

    heading1('8. Arquitetura de Alto Nível'),
    bodyText(
      'O CyberLens é uma aplicação Next.js com foco em processamento client-side. A arquitetura foi projetada para minimizar o tráfego de dados pessoais por servidores, seguindo o princípio de privacy-by-design.',
    ),
    bodyText(
      'O navegador do usuário é o centro de processamento: o PDF é parseado diretamente via pdfjs-dist em um Web Worker, o estado da aplicação é mantido em memória React e configurações/resultados são persistidos no localStorage com chaves específicas do CyberLens.',
    ),
    bodyText(
      'As chamadas à API dos provedores de IA são feitas diretamente do navegador para OpenAI, Google Gemini e HuggingFace. Para a Anthropic, que não permite chamadas cross-origin diretas, existe uma rota API Next.js (/api/analyze) que funciona como proxy CORS, apenas retransmitindo a requisição sem armazenar dados.',
    ),
    bodyText(
      'O deploy na Vercel gera páginas estáticas para todas as rotas de conteúdo e uma função serverless para /api/analyze. Não há banco de dados, não há sessão de servidor, e não há autenticação.',
    ),
    spacer(),

    heading1('9. Glossário'),
    glossaryTable,
  ];

  const doc = createDocument(
    'CyberLens: Visão Geral do Projeto',
    'Visão Geral do Projeto',
    'Documento de Especificação Técnica',
    content,
  );

  await saveDocument(doc, '01-visao-geral.docx');
}

// ════════════════════════════════════════════════════════════════════════════
// DOCUMENT 2: Funcionalidades
// ════════════════════════════════════════════════════════════════════════════
async function generateDoc2(): Promise<void> {
  console.log('\n[2/6] Gerando 02-funcionalidades.docx...');

  const content: (Paragraph | Table)[] = [
    heading1('1. Mapeamento de Funcionalidades'),
    createTable(
      ['ID', 'Funcionalidade', 'Descrição', 'Prioridade'],
      [
        ['F-01', 'Upload de PDF', 'Seleção e parsing de PDF de currículo via input file', 'Alta'],
        ['F-02', 'Preview do currículo', 'Exibição do texto extraído em área colapsável', 'Média'],
        ['F-03', 'Input de descrição de vaga', 'Textarea com contagem de caracteres e validação', 'Alta'],
        ['F-04', 'Seleção de provider', 'Dropdown para escolher OpenAI, Anthropic, Google, HuggingFace', 'Alta'],
        ['F-05', 'Configuração de modelo', 'Seleção do modelo específico por provider', 'Alta'],
        ['F-06', 'Inserção de API key', 'Campo mascarado com botão de mostrar/ocultar', 'Alta'],
        ['F-07', 'Teste de conexão', 'Botão que valida a API key enviando requisição de teste', 'Alta'],
        ['F-08', 'Análise com IA', 'Envio do prompt e recebimento da resposta estruturada', 'Alta'],
        ['F-09', 'Score de aderência', 'Exibição do percentual com gauge visual colorido', 'Alta'],
        ['F-10', 'Skills encontradas', 'Lista de habilidades confirmadas no currículo', 'Alta'],
        ['F-11', 'Gaps de habilidades', 'Lista priorizada de gaps identificados pela IA', 'Alta'],
        ['F-12', 'Palavras-chave ausentes', 'Lista de keywords da vaga não encontradas no currículo', 'Média'],
        ['F-13', 'Análise de experiência', 'Avaliação de tempo de experiência e certificações', 'Alta'],
        ['F-14', 'Plano de estudos', 'Recursos de estudo personalizados para suprir gaps', 'Alta'],
        ['F-15', 'Exportação PDF', 'Download do relatório completo em formato PDF', 'Alta'],
        ['F-16', 'Modal de consentimento', 'Modal LGPD bloqueante na primeira visita', 'Alta'],
        ['F-17', 'Limpar dados', 'Botão para remover todos os dados do localStorage', 'Alta'],
      ],
    ),
    spacer(),

    heading1('2. User Stories'),
    heading3('US-01: Upload de Currículo'),
    bodyText(
      'Como profissional de cybersecurity, quero fazer upload do meu currículo em PDF para que a ferramenta possa analisar minha aderência a uma vaga específica.',
    ),
    bulletItem('Dado que estou na página principal', 'Critério 1'),
    bulletItem('Quando clico na área de upload e seleciono um PDF válido de até 10MB', 'Critério 2'),
    bulletItem('Então o texto do currículo é extraído e exibido em uma área colapsável abaixo do input', 'Critério 3'),
    spacer(),

    heading3('US-02: Score Visual'),
    bodyText(
      'Como usuário, quero ver meu score de aderência de forma visual e clara para entender rapidamente meu nível de compatibilidade com a vaga.',
    ),
    bulletItem('Dado que a análise foi concluída com sucesso', 'Critério 1'),
    bulletItem('Quando visualizo o resultado, vejo um gauge circular com o percentual em destaque', 'Critério 2'),
    bulletItem('Então a cor do gauge reflete a classificação: vermelho (Baixa), amarelo (Parcial), azul (Alta), verde (Excelente)', 'Critério 3'),
    spacer(),

    heading3('US-03: Gaps de Habilidades'),
    bodyText(
      'Como usuário, quero saber quais skills me faltam para a vaga para poder direcionar meus estudos e desenvolvimento profissional.',
    ),
    bulletItem('Dado que a análise foi concluída', 'Critério 1'),
    bulletItem('Quando vejo a seção de gaps, cada item tem badge de prioridade (Crítico, Importante, Desejável)', 'Critério 2'),
    bulletItem('Então posso ordenar mentalmente quais habilidades devo desenvolver primeiro', 'Critério 3'),
    spacer(),

    heading3('US-04: Plano de Estudos'),
    bodyText(
      'Como usuário, quero um plano de estudos personalizado para saber exatamente como suprir os gaps identificados.',
    ),
    bulletItem('Dado que gaps foram identificados na análise', 'Critério 1'),
    bulletItem('Quando vejo o plano de estudos, cada item tem nome, descrição, duração estimada e recursos específicos', 'Critério 2'),
    bulletItem('Então consigo iniciar meu desenvolvimento imediatamente com direcionamento claro', 'Critério 3'),
    spacer(),

    heading3('US-05: Exportação PDF'),
    bodyText(
      'Como usuário, quero exportar o resultado em PDF para compartilhar com mentores ou guardar como referência pessoal.',
    ),
    bulletItem('Dado que tenho um resultado de análise na tela', 'Critério 1'),
    bulletItem('Quando clico em "Exportar PDF", um arquivo PDF é gerado no navegador', 'Critério 2'),
    bulletItem('Então o arquivo é baixado automaticamente com nome descritivo incluindo data', 'Critério 3'),
    spacer(),

    heading3('US-06: Escolha de Provider de IA'),
    bodyText(
      'Como usuário técnico, quero escolher qual provedor de IA usar para ter controle sobre custos e qualidade da análise.',
    ),
    bulletItem('Dado que estou na página de configurações', 'Critério 1'),
    bulletItem('Quando seleciono um provider, a lista de modelos disponíveis atualiza automaticamente', 'Critério 2'),
    bulletItem('Então posso inserir minha API key e testar a conexão antes de analisar', 'Critério 3'),
    spacer(),

    heading3('US-07: Privacidade de Dados'),
    bodyText(
      'Como usuário preocupado com privacidade, quero que meus dados sejam processados localmente para não depender de servidores de terceiros além do provider de IA escolhido.',
    ),
    bulletItem('Dado que faço upload de meu currículo', 'Critério 1'),
    bulletItem('Quando o arquivo é processado, o PDF nunca sai do meu navegador', 'Critério 2'),
    bulletItem('Então apenas o texto extraído é enviado ao provider de IA configurado, junto com a descrição da vaga', 'Critério 3'),
    spacer(),

    heading1('3. Fluxo do Usuário'),
    createTable(
      ['Passo', 'Tela/Componente', 'Ação do Usuário', 'Resultado'],
      [
        ['1', 'Modal de Consentimento', 'Primeira visita ao site', 'Modal bloqueante aparece com política de privacidade'],
        ['2', 'Modal de Consentimento', 'Lê a política e marca o checkbox', 'Botão "Aceitar e Continuar" é habilitado'],
        ['3', 'Modal de Consentimento', 'Clica em "Aceitar e Continuar"', 'Consentimento salvo no localStorage; modal fecha'],
        ['4', 'Página Principal', 'Clica no ícone de configurações (engrenagem)', 'Navega para /configuracoes'],
        ['5', 'Configurações', 'Seleciona provider, modelo e insere API key', 'Configurações salvas no localStorage'],
        ['6', 'Configurações', 'Clica em "Testar Conexão"', 'Feedback de sucesso ou erro da API key'],
        ['7', 'Página Principal', 'Clica na área de upload de PDF', 'Seletor de arquivo do sistema abre'],
        ['8', 'Página Principal', 'Seleciona o arquivo PDF do currículo', 'Texto extraído; preview exibido'],
        ['9', 'Página Principal', 'Cola a descrição da vaga no textarea', 'Contador de caracteres atualiza em tempo real'],
        ['10', 'Página Principal', 'Clica em "Analisar Currículo"', 'Loading state; chamada à IA iniciada'],
        ['11', 'Página de Resultados', 'Aguarda análise (até 60s)', 'Resultado completo renderizado na tela'],
        ['12', 'Página de Resultados', 'Revisa score, gaps e plano de estudos', 'Usuário planeja próximos passos'],
        ['13', 'Página de Resultados', 'Clica em "Exportar PDF"', 'PDF baixado automaticamente'],
      ],
    ),
    spacer(),

    heading1('4. Especificação por Feature'),
    heading2('4.1 Upload de Currículo'),
    bulletItem('Formatos aceitos: somente PDF (application/pdf)'),
    bulletItem('Tamanho máximo: 10MB'),
    bulletItem('Parsing via pdfjs-dist em Web Worker (não bloqueia a UI)'),
    bulletItem('Preview do texto extraído em área colapsável com scroll'),
    bulletItem('Mensagem de erro específica para PDFs com proteção de senha'),
    bulletItem('Estado de loading com spinner durante o parsing'),
    spacer(),

    heading2('4.2 Input de Vaga'),
    bulletItem('Textarea com altura mínima de 200px e expansão automática'),
    bulletItem('Validação em tempo real: mínimo 100 caracteres, máximo 10.000'),
    bulletItem('Contador de caracteres visível com feedback de cor (verde/amarelo/vermelho)'),
    bulletItem('Placeholder com exemplo de como estruturar a descrição da vaga'),
    spacer(),

    heading2('4.3 Análise com IA'),
    bulletItem('Multi-provider: OpenAI GPT, Anthropic Claude, Google Gemini, HuggingFace'),
    bulletItem('Retry automático: até 2 tentativas em caso de erro temporário'),
    bulletItem('Timeout: 60 segundos por tentativa'),
    bulletItem('Loading state com mensagens de progresso rotativas'),
    bulletItem('Parse do JSON de resposta com fallback para extrair dados parciais'),
    spacer(),

    heading2('4.4 Resultado da Análise'),
    bodyText('O resultado é composto por 7 seções principais:'),
    bulletItem('Score de Aderência: gauge circular com percentual e classificação'),
    bulletItem('Skills Encontradas: lista de habilidades confirmadas com badges'),
    bulletItem('Gaps de Habilidades: lista priorizada com descrição e badge de prioridade'),
    bulletItem('Palavras-chave Ausentes: grid de tags com keywords da vaga não encontradas'),
    bulletItem('Análise de Experiência: texto descritivo sobre adequação da experiência'),
    bulletItem('Plano de Estudos: cards com nome, descrição, duração e recursos de estudo'),
    bulletItem('Exportação: botão para gerar PDF do relatório completo'),
    spacer(),

    heading2('4.5 Exportação PDF'),
    bulletItem('Geração via @react-pdf/renderer (100% client-side)'),
    bulletItem('Layout em duas colunas otimizado para impressão'),
    bulletItem('Inclui todas as 7 seções do resultado'),
    bulletItem('Nome do arquivo: cyberlens-analise-YYYY-MM-DD.pdf'),
    bulletItem('Download automático via blob URL'),
    spacer(),

    heading2('4.6 Configurações'),
    bulletItem('Seleção de provider com dropdown (OpenAI, Anthropic, Google, HuggingFace)'),
    bulletItem('Seleção de modelo atualiza dinamicamente conforme o provider'),
    bulletItem('Campo de API key com máscara e botão mostrar/ocultar'),
    bulletItem('Botão "Testar Conexão" com feedback visual'),
    bulletItem('Botão "Limpar Todos os Dados" com confirmação'),
    spacer(),

    heading2('4.7 Aceite Legal'),
    bulletItem('Modal bloqueante na primeira visita (sem fechar com ESC ou clique fora)'),
    bulletItem('Checkbox obrigatório para habilitar o botão de aceite'),
    bulletItem('Links para /privacidade e /termos que abrem em nova aba'),
    bulletItem('Consentimento salvo em localStorage com chave cyberlens_consent'),
    bulletItem('Se consentimento revogado (via Limpar Dados), modal reapare na próxima visita'),
    spacer(),

    heading1('5. Regras de Negócio'),
    createTable(
      ['ID', 'Regra', 'Descrição'],
      [
        ['RN-01', 'Classificação de Score', '0–40% = Baixa Aderência; 41–70% = Aderência Parcial; 71–90% = Alta Aderência; 91–100% = Excelente Aderência'],
        ['RN-02', 'Prioridade de Gaps', 'Crítico: habilidade essencial ausente; Importante: fortemente desejável; Desejável: diferencial competitivo'],
        ['RN-03', 'API Key no Browser', 'A chave de API jamais sai do navegador exceto para o provider escolhido pelo usuário'],
        ['RN-04', 'Proxy CORS Anthropic', 'A Anthropic não permite chamadas CORS diretas; é obrigatório o uso da rota /api/analyze como proxy'],
        ['RN-05', 'Mínimo de Conteúdo', 'A análise só é iniciada se o PDF tiver texto extraído E a vaga tiver ao menos 100 caracteres'],
        ['RN-06', 'Validação de PDF', 'PDFs com proteção de senha ou sem camada de texto (PDFs de imagem) geram mensagem de erro específica'],
      ],
    ),
    spacer(),

    heading1('6. Tratamento de Erros'),
    createTable(
      ['Cenário', 'Mensagem ao Usuário', 'Ação Recomendada'],
      [
        ['Arquivo não é PDF', '"Somente arquivos PDF são aceitos."', 'Usuário deve selecionar um arquivo .pdf'],
        ['PDF maior que 10MB', '"O arquivo excede o tamanho máximo de 10MB."', 'Comprimir ou usar versão reduzida do currículo'],
        ['PDF protegido por senha', '"Este PDF está protegido. Por favor, remova a senha antes de fazer upload."', 'Remover proteção do PDF'],
        ['PDF sem texto (imagem)', '"Não foi possível extrair texto deste PDF. Certifique-se de que não é um PDF digitalizado."', 'Usar PDF com camada de texto'],
        ['API Key inválida', '"Chave de API inválida ou sem permissão para o modelo selecionado."', 'Verificar chave nas configurações'],
        ['Rate limit atingido', '"Limite de requisições atingido. Aguarde alguns minutos e tente novamente."', 'Aguardar e tentar novamente'],
        ['Timeout (>60s)', '"A análise demorou mais que o esperado. Verifique sua conexão e tente novamente."', 'Tentar novamente ou usar provider diferente'],
        ['Sem conexão', '"Sem conexão com a internet. Verifique sua rede e tente novamente."', 'Restaurar conexão'],
        ['JSON inválido na resposta', '"A IA retornou uma resposta inesperada. Tente novamente."', 'Retry automático; se persistir, trocar modelo'],
        ['Vaga muito curta (<100 chars)', '"A descrição da vaga deve ter pelo menos 100 caracteres."', 'Adicionar mais detalhes à descrição'],
      ],
    ),
  ];

  const doc = createDocument(
    'CyberLens: Funcionalidades',
    'Documento de Funcionalidades',
    'Especificação Funcional Detalhada',
    content,
  );

  await saveDocument(doc, '02-funcionalidades.docx');
}

// ════════════════════════════════════════════════════════════════════════════
// DOCUMENT 3: Usabilidade e UX
// ════════════════════════════════════════════════════════════════════════════
async function generateDoc3(): Promise<void> {
  console.log('\n[3/6] Gerando 03-usabilidade-ux.docx...');

  const content: (Paragraph | Table)[] = [
    heading1('1. Princípios de Design'),
    heading2('1.1 Privacy-First'),
    bodyText(
      'Todas as decisões de design partem do princípio de que o usuário é dono de seus dados. A interface reforça isso visualmente: o modal de consentimento é a primeira coisa que o usuário vê, a política de privacidade é acessível de múltiplos pontos, e o botão "Limpar Dados" é proeminente nas configurações.',
    ),
    heading2('1.2 Simplicidade'),
    bodyText(
      'A jornada principal é linear e direta: upload → descrição da vaga → análise → resultado. Não há menus complexos, cadastros ou configurações obrigatórias além da API key. Um usuário nunca deve se perguntar "o que devo fazer agora?".',
    ),
    heading2('1.3 Feedback Imediato'),
    bodyText(
      'Cada ação do usuário tem resposta visual imediata: parsers com loading states, contadores de caracteres em tempo real, indicadores de sucesso/erro em todas as operações, e mensagens de progresso durante a análise.',
    ),
    heading2('1.4 Progressividade'),
    bodyText(
      'A interface guia o usuário pelos passos em sequência lógica. Componentes são ativados apenas quando os pré-requisitos são atendidos (ex: botão de análise só fica ativo quando PDF e vaga estão preenchidos corretamente).',
    ),
    spacer(),

    heading1('2. Paleta de Cores'),
    createTable(
      ['Nome', 'Hex', 'Uso Principal'],
      [
        ['Background Principal', '#0a0a0f', 'Fundo da aplicação: dark profundo quase preto com tom azul'],
        ['Surface / Card', '#1a1a2e', 'Cards, modais, painéis: superfície elevada sobre o background'],
        ['Accent / Teal', '#00ffd5', 'CTAs principais, destaques, score alto: cor de marca do CyberLens'],
        ['Purple', '#7c3aed', 'Elementos secundários, badges de prioridade Crítico'],
        ['Success / Green', '#00ff88', 'Confirmações, itens encontrados, score excelente'],
        ['Error / Red', '#ff4757', 'Erros, validações falhas, gaps críticos'],
        ['Warning / Yellow', '#ffd32a', 'Avisos, score baixo, gaps importantes'],
        ['Text Principal', '#e4e4e7', 'Texto principal: quase branco para contraste em dark'],
        ['Text Secundário', '#9ca3af', 'Labels, metadados, texto de menor hierarquia'],
        ['Border / Divider', '#2d2d44', 'Bordas de cards e separadores'],
      ],
    ),
    spacer(),

    heading1('3. Tipografia'),
    heading2('3.1 Inter: Texto Principal'),
    bodyText(
      'A fonte Inter é utilizada para todos os textos de interface: títulos, parágrafos, labels, botões e navegação. É uma tipografia humanista sans-serif otimizada para interfaces digitais, com excelente legibilidade em tamanhos pequenos e boa variação de pesos.',
    ),
    heading2('3.2 JetBrains Mono: Dados Técnicos'),
    bodyText(
      'A fonte JetBrains Mono é utilizada para dados técnicos onde a distinção de caracteres é essencial: texto extraído do currículo (preview), keywords técnicas, nomes de ferramentas e tecnologias, e qualquer dado que se beneficie de espaçamento monoespaçado.',
    ),
    spacer(),

    heading1('4. Hierarquia Visual'),
    createTable(
      ['Elemento', 'Tamanho', 'Peso', 'Cor', 'Uso'],
      [
        ['H1: Título Principal', '2.25rem (36px)', 'Bold 700', '#e4e4e7', 'Título de página (ex: "CyberLens")'],
        ['H2: Seção', '1.5rem (24px)', 'SemiBold 600', '#e4e4e7', 'Títulos de seções do resultado'],
        ['H3: Subseção', '1.125rem (18px)', 'Medium 500', '#e4e4e7', 'Subtítulos e labels de grupos'],
        ['Body: Corpo', '1rem (16px)', 'Regular 400', '#e4e4e7', 'Texto descritivo e conteúdo principal'],
        ['Small: Auxiliar', '0.875rem (14px)', 'Regular 400', '#9ca3af', 'Metadados, labels, contadores'],
        ['Tiny: Mínimo', '0.75rem (12px)', 'Regular 400', '#9ca3af', 'Rodapés, notices legais, versão'],
        ['Code: Técnico', '0.9rem (14.4px)', 'Regular 400', '#00ffd5', 'Texto extraído, keywords técnicas'],
      ],
    ),
    spacer(),

    heading1('5. Layout e Responsividade'),
    heading2('5.1 Grid Principal'),
    bulletItem('Largura máxima: 1200px centralizado com padding lateral'),
    bulletItem('Mobile-first: layout em coluna única até 768px'),
    bulletItem('Tablet (md: 768px): início de layouts em duas colunas para configurações'),
    bulletItem('Desktop (lg: 1024px): layout completo em duas colunas para resultado'),
    spacer(),

    heading2('5.2 Breakpoints'),
    createTable(
      ['Breakpoint', 'Largura', 'Layout'],
      [
        ['Base (mobile)', '< 640px', 'Coluna única, texto menor, cards empilhados'],
        ['sm', '≥ 640px', 'Coluna única com mais padding, botões lado a lado'],
        ['md', '≥ 768px', 'Duas colunas em formulários e configurações'],
        ['lg', '≥ 1024px', 'Layout completo: resultado em duas colunas, sidebar'],
        ['xl', '≥ 1280px', 'Espaçamentos maiores, mais conteúdo visível'],
      ],
    ),
    spacer(),

    heading2('5.3 Componentes Fixos'),
    bulletItem('Header: sticky no topo, z-index elevado, blur backdrop'),
    bulletItem('Footer: full-width, links de navegação legal'),
    bulletItem('Modal de consentimento: fixed overlay cobrindo toda a tela'),
    spacer(),

    heading1('6. Componentes do Design System'),
    createTable(
      ['Componente', 'Variantes', 'Uso'],
      [
        ['Button', 'primary, secondary, ghost, danger, sm, lg', 'Todas as ações do usuário'],
        ['Card', 'default, elevated, bordered, glass', 'Containers de conteúdo e seções'],
        ['Input', 'default, error, success, disabled', 'Campos de texto e API key'],
        ['Textarea', 'default, error, with-counter', 'Descrição da vaga'],
        ['Badge', 'teal, purple, green, red, yellow, gray', 'Prioridades, status, classificações'],
        ['Modal', 'blocking, closeable, full-screen', 'Consentimento, confirmações'],
        ['Spinner', 'sm, md, lg, full-page', 'Estados de carregamento'],
        ['ScoreGauge', 'circular, bar, text-only', 'Exibição do score de aderência'],
        ['Collapsible', 'default, with-header', 'Preview do currículo extraído'],
        ['Alert', 'info, success, warning, error', 'Mensagens de feedback ao usuário'],
      ],
    ),
    spacer(),

    heading1('7. Acessibilidade (WCAG 2.1 AA)'),
    heading2('7.1 Contraste de Cores'),
    bulletItem('Texto principal (#e4e4e7) sobre background (#0a0a0f): ratio 16.5:1, aprovado AAA'),
    bulletItem('Accent (#00ffd5) sobre surface (#1a1a2e): ratio 9.2:1, aprovado AAA'),
    bulletItem('Texto secundário (#9ca3af) sobre background (#0a0a0f): ratio 5.1:1, aprovado AA'),
    bulletItem('Texto (#8b8fa3) sobre surface (#1a1a2e): verificado e aprovado AA conforme WCAG 1.4.3'),
    spacer(),

    heading2('7.2 Navegação por Teclado'),
    bulletItem('Todos os elementos interativos são focáveis via Tab'),
    bulletItem('Ordem de foco é lógica e segue o fluxo visual da página'),
    bulletItem('Modal de consentimento captura o foco (focus trap) enquanto está aberto'),
    bulletItem('Esc fecha modais fecháveis (não o de consentimento)'),
    bulletItem('Enter e Space ativam botões e checkboxes'),
    spacer(),

    heading2('7.3 ARIA e Semântica'),
    bulletItem('Botões com ícone têm aria-label descritivo'),
    bulletItem('Loading states usam aria-busy="true" e aria-live="polite"'),
    bulletItem('Mensagens de erro são associadas aos campos via aria-describedby'),
    bulletItem('Modal usa role="dialog", aria-modal="true" e aria-labelledby'),
    bulletItem('Score gauge usa role="img" com aria-label descritivo do valor'),
    spacer(),

    heading1('8. Fluxo de Navegação'),
    createTable(
      ['Rota', 'Título', 'Acesso via', 'Descrição'],
      [
        ['/', 'CyberLens: Análise de Currículo', 'URL direta / logo', 'Página principal com o fluxo completo de análise'],
        ['/configuracoes', 'Configurações', 'Ícone de engrenagem no header', 'Configuração de provider, modelo e API key'],
        ['/privacidade', 'Política de Privacidade', 'Modal + footer', 'Política completa de privacidade (13 seções)'],
        ['/termos', 'Termos de Uso', 'Modal + footer', 'Termos de uso da aplicação'],
        ['/sobre', 'Sobre o CyberLens', 'Footer', 'Informações sobre o projeto, tecnologias e autor'],
      ],
    ),
    spacer(),

    heading1('9. Estados de UI'),
    createTable(
      ['Componente', 'Estado Vazio', 'Estado de Loading', 'Estado de Sucesso', 'Estado de Erro'],
      [
        ['Upload de PDF', 'Área tracejada com ícone de upload e texto instrucional', 'Spinner + "Extraindo texto do PDF..."', 'Nome do arquivo + preview colapsável', 'Borda vermelha + mensagem de erro específica'],
        ['Análise', 'Botão "Analisar" desabilitado cinza', 'Botão substituído por spinner + mensagens rotativas', 'Botão "Nova Análise" + scroll para resultado', 'Toast de erro + botão "Tentar Novamente"'],
        ['Resultado/Score', 'Seção oculta antes da análise', 'Skeleton loading animado', 'Gauge colorido com percentual', 'N/A (erro no estado anterior)'],
        ['Teste de Conexão', 'Botão "Testar Conexão" habilitado', 'Spinner no botão + desabilitado', 'Checkmark verde + "Conexão bem-sucedida"', 'X vermelho + mensagem de erro da API'],
        ['Exportação PDF', 'Botão "Exportar PDF" disponível', 'Spinner + "Gerando PDF..."', 'Download iniciado automaticamente', 'Toast de erro de geração'],
      ],
    ),
    spacer(),

    heading1('10. Heurísticas de Nielsen'),
    createTable(
      ['Heurística', 'Implementação no CyberLens'],
      [
        ['1. Visibilidade do status do sistema', 'Loading spinners, mensagens de progresso na análise, contadores de caracteres em tempo real'],
        ['2. Correspondência com o mundo real', 'Linguagem em português brasileiro, termos familiares ao profissional de TI, ícones universais'],
        ['3. Controle e liberdade do usuário', 'Botão "Nova Análise", botão "Limpar Dados", possibilidade de trocar provider a qualquer momento'],
        ['4. Consistência e padrões', 'Design system unificado, mesmo padrão de cards em toda a aplicação, cores semânticas consistentes'],
        ['5. Prevenção de erros', 'Validação em tempo real, botão de análise desabilitado até pré-requisitos atendidos, confirmação ao limpar dados'],
        ['6. Reconhecimento em vez de lembrança', 'Labels em todos os campos, placeholder com exemplos, provider e modelo visíveis nas configurações'],
        ['7. Flexibilidade e eficiência', 'Usuários avançados podem trocar provider/modelo; fluxo padrão simples para novatos'],
        ['8. Estética e design minimalista', 'Interface dark focada no conteúdo, sem elementos decorativos desnecessários, hierarquia clara'],
        ['9. Ajudar usuários a reconhecer e recuperar erros', 'Mensagens de erro específicas e acionáveis, sugestões de correção em cada cenário de erro'],
        ['10. Ajuda e documentação', 'Página /sobre com FAQ, links para documentação dos providers, tooltips em campos técnicos'],
      ],
    ),
  ];

  const doc = createDocument(
    'CyberLens: Usabilidade e UX',
    'Usabilidade e UX',
    'Documento de Design e Experiência do Usuário',
    content,
  );

  await saveDocument(doc, '03-usabilidade-ux.docx');
}

// ════════════════════════════════════════════════════════════════════════════
// DOCUMENT 4: Arquitetura e Diagramas UML
// ════════════════════════════════════════════════════════════════════════════
async function generateDoc4(): Promise<void> {
  console.log('\n[4/6] Gerando 04-arquitetura-uml.docx...');

  const content: (Paragraph | Table)[] = [
    heading1('1. Diagrama de Componentes'),
    bodyText(
      'A hierarquia de componentes do CyberLens segue a estrutura do Next.js App Router, com layout raiz envolvendo todas as páginas e componentes compartilhados.',
    ),
    spacer(),

    createTable(
      ['Nível', 'Componente', 'Tipo', 'Responsabilidade'],
      [
        ['L0: Raiz', 'layout.tsx (App)', 'Server Component', 'HTML root, metadata global, providers de contexto'],
        ['L1: Compartilhado', 'Header', 'Client Component', 'Navegação principal, logo, link para configurações'],
        ['L1: Compartilhado', 'ConsentModal', 'Client Component', 'Modal bloqueante de consentimento LGPD'],
        ['L1: Compartilhado', 'Footer', 'Server Component', 'Links legais, versão, copyright'],
        ['L2: Páginas', 'page.tsx (Home)', 'Client Component', 'Orquestração do fluxo principal de análise'],
        ['L2: Páginas', 'configuracoes/page.tsx', 'Client Component', 'Formulário de configurações de provider e API key'],
        ['L2: Páginas', 'privacidade/page.tsx', 'Server Component', 'Texto completo da política de privacidade'],
        ['L2: Páginas', 'termos/page.tsx', 'Server Component', 'Texto completo dos termos de uso'],
        ['L2: Páginas', 'sobre/page.tsx', 'Server Component', 'Informações sobre o projeto'],
        ['L3: Features', 'ResumeUpload', 'Client Component', 'Upload de PDF, parsing com pdfjs-dist, preview'],
        ['L3: Features', 'JobDescription', 'Client Component', 'Textarea da vaga com validação e contador'],
        ['L3: Features', 'AnalysisButton', 'Client Component', 'Botão de análise com estados de loading'],
        ['L3: Features', 'AnalysisResult', 'Client Component', 'Orquestrador da exibição do resultado completo'],
        ['L3: Features', 'ScoreSection', 'Client Component', 'Gauge de score com classificação e cor'],
        ['L3: Features', 'GapsSection', 'Client Component', 'Lista de gaps com badges de prioridade'],
        ['L3: Features', 'StudyPlanSection', 'Client Component', 'Cards do plano de estudos com recursos'],
        ['L3: Features', 'ExportPDFButton', 'Client Component', 'Geração e download de PDF via react-pdf'],
        ['L4: UI', 'Button', 'Client Component', 'Botão com variantes e estados'],
        ['L4: UI', 'Card', 'Server Component', 'Container com variantes visuais'],
        ['L4: UI', 'Input', 'Client Component', 'Campo de texto com validação'],
        ['L4: UI', 'Badge', 'Server Component', 'Etiqueta colorida de status/prioridade'],
        ['L4: UI', 'Modal', 'Client Component', 'Overlay modal com gestão de foco'],
        ['L4: UI', 'Spinner', 'Server Component', 'Indicador de carregamento animado'],
        ['L4: UI', 'ScoreGauge', 'Client Component', 'Gauge circular SVG para o score'],
        ['L5: API Route', '/api/analyze', 'Serverless Function', 'Proxy CORS para Anthropic Claude'],
      ],
    ),
    spacer(),

    heading1('2. Diagrama de Sequência: Fluxo de Análise'),
    bodyText(
      'O diagrama abaixo detalha o fluxo completo de uma análise, desde o upload do PDF até a exibição do resultado, para cada tipo de provider.',
    ),
    spacer(),

    createTable(
      ['Passo', 'Ator', 'Ação', 'Destino', 'Dados Trafegados'],
      [
        ['1', 'Usuário', 'Seleciona arquivo PDF via input', 'Browser (FileReader API)', 'File object (permanece no browser)'],
        ['2', 'Browser', 'Inicia parsing do PDF', 'pdfjs-dist Web Worker', 'ArrayBuffer do PDF'],
        ['3', 'Web Worker', 'Extrai texto de todas as páginas', 'Browser (main thread)', 'String com texto extraído'],
        ['4', 'Browser', 'Exibe preview do texto', 'UI (ResumeUpload component)', 'Texto extraído (string)'],
        ['5', 'Usuário', 'Cola descrição da vaga no textarea', 'Browser state (React)', 'String da descrição'],
        ['6', 'Usuário', 'Clica em "Analisar Currículo"', 'analyzeResume() function', 'Trigger de evento'],
        ['7', 'Browser', 'Monta o prompt para a IA', 'src/lib/ai/prompt.ts', 'Texto do currículo + descrição da vaga'],
        ['8A', 'Browser (Anthropic)', 'POST /api/analyze (proxy CORS)', 'Next.js API Route (Vercel)', 'JSON: {prompt, apiKey, model}'],
        ['9A', 'Next.js API Route', 'Repassa requisição para Anthropic', 'api.anthropic.com', 'JSON com prompt e configurações'],
        ['10A', 'Anthropic API', 'Retorna análise em JSON', 'Next.js API Route', 'JSON estruturado com análise'],
        ['11A', 'Next.js API Route', 'Retorna resposta ao browser', 'Browser', 'JSON da Anthropic'],
        ['8B', 'Browser (OpenAI)', 'fetch direto para OpenAI', 'api.openai.com', 'JSON: {messages, model}'],
        ['9B', 'OpenAI API', 'Retorna análise em JSON', 'Browser', 'JSON com choices[0].message.content'],
        ['8C', 'Browser (Google)', 'fetch direto para Gemini', 'generativelanguage.googleapis.com', 'JSON: {contents, model}'],
        ['9C', 'Google API', 'Retorna análise em JSON', 'Browser', 'JSON com candidates[0].content'],
        ['12', 'Browser', 'parseAIResponse(): extrai dados', 'src/lib/ai/parser.ts', 'String de resposta bruta'],
        ['13', 'Browser', 'Valida e normaliza AnalysisResult', 'React state', 'Objeto AnalysisResult tipado'],
        ['14', 'Browser', 'Renderiza componentes de resultado', 'AnalysisResult + sub-componentes', 'Props do AnalysisResult'],
        ['15', 'Usuário', 'Clica em "Exportar PDF"', 'ExportPDFButton', 'Trigger de evento'],
        ['16', 'Browser', 'Gera PDF via @react-pdf/renderer', 'Blob (memória do browser)', 'AnalysisResult → PDF bytes'],
        ['17', 'Browser', 'Cria URL temporária e faz download', 'Sistema de arquivos do usuário', 'Blob URL → arquivo .pdf'],
      ],
    ),
    spacer(),

    heading1('3. Interfaces TypeScript: Hierarquia de Tipos'),
    heading2('3.1 Tipo Principal: AnalysisResult'),
    createTable(
      ['Campo', 'Tipo', 'Descrição'],
      [
        ['score', 'number (0–100)', 'Percentual de aderência do currículo à vaga'],
        ['classification', 'string', '"Baixa" | "Parcial" | "Alta" | "Excelente"'],
        ['matchedSkills', 'MatchedSkill[]', 'Lista de habilidades encontradas no currículo'],
        ['gaps', 'Gap[]', 'Lista de gaps identificados com prioridade'],
        ['missingKeywords', 'MissingKeyword[]', 'Keywords da vaga ausentes no currículo'],
        ['experienceAnalysis', 'ExperienceAnalysis', 'Análise de tempo de experiência e certificações'],
        ['studyPlan', 'StudyPlanItem[]', 'Plano de estudos personalizado'],
      ],
    ),
    spacer(),

    heading2('3.2 Tipo: MatchedSkill'),
    createTable(
      ['Campo', 'Tipo', 'Descrição'],
      [
        ['name', 'string', 'Nome da habilidade encontrada'],
        ['category', 'string', 'Categoria: "técnica" | "ferramenta" | "certificação" | "soft skill"'],
        ['relevance', '"high" | "medium" | "low"', 'Relevância da skill para a vaga específica'],
      ],
    ),
    spacer(),

    heading2('3.3 Tipo: Gap'),
    createTable(
      ['Campo', 'Tipo', 'Descrição'],
      [
        ['skill', 'string', 'Nome da habilidade ou conhecimento em falta'],
        ['priority', '"Crítico" | "Importante" | "Desejável"', 'Prioridade para desenvolvimento'],
        ['description', 'string', 'Explicação do porquê esta skill é necessária para a vaga'],
        ['category', 'string', 'Categoria do gap: técnico, certificação, experiência, etc.'],
      ],
    ),
    spacer(),

    heading2('3.4 Tipo: ExperienceAnalysis'),
    createTable(
      ['Campo', 'Tipo', 'Descrição'],
      [
        ['yearsRequired', 'number | null', 'Anos de experiência exigidos na vaga (se mencionado)'],
        ['yearsFound', 'number | null', 'Anos de experiência encontrados no currículo'],
        ['adequacy', 'string', 'Avaliação textual: "adequada" | "insuficiente" | "superior"'],
        ['certifications', 'CertificationAnalysis[]', 'Análise de certificações relevantes'],
        ['summary', 'string', 'Texto descritivo da análise de experiência'],
      ],
    ),
    spacer(),

    heading2('3.5 Tipo: StudyPlanItem'),
    createTable(
      ['Campo', 'Tipo', 'Descrição'],
      [
        ['topic', 'string', 'Tópico ou habilidade a ser desenvolvida'],
        ['description', 'string', 'Descrição do que aprender e por quê'],
        ['estimatedTime', 'string', 'Tempo estimado de estudo (ex: "2-3 semanas")'],
        ['priority', '"Crítico" | "Importante" | "Desejável"', 'Prioridade de desenvolvimento'],
        ['resources', 'StudyResource[]', 'Lista de recursos de estudo recomendados'],
      ],
    ),
    spacer(),

    heading2('3.6 Tipo: UserSettings'),
    createTable(
      ['Campo', 'Tipo', 'Descrição'],
      [
        ['provider', 'AIProviderName', '"openai" | "anthropic" | "google" | "huggingface"'],
        ['model', 'string', 'ID do modelo selecionado para o provider'],
        ['apiKey', 'string', 'Chave de API (armazenada em localStorage, nunca em servidor)'],
        ['lastUpdated', 'string', 'ISO timestamp da última atualização das configurações'],
      ],
    ),
    spacer(),

    heading1('4. Diagrama de Deploy'),
    heading2('4.1 Ambiente de Desenvolvimento Local'),
    createTable(
      ['Etapa', 'Comando / Ferramenta', 'Resultado'],
      [
        ['1. Instalar dependências', 'npm install', 'node_modules populado com todas as dependências'],
        ['2. Iniciar servidor de dev', 'npm run dev', 'Next.js dev server em localhost:3000 com HMR'],
        ['3. Acessar aplicação', 'Browser → http://localhost:3000', 'CyberLens rodando localmente'],
        ['4. API Route local', '/api/analyze', 'Serverless function emulada pelo Next.js dev server'],
        ['5. Build de produção', 'npm run build', 'Artefatos otimizados em .next/'],
        ['6. Testar build', 'npm start', 'Servidor de produção em localhost:3000'],
      ],
    ),
    spacer(),

    heading2('4.2 Deploy na Vercel (Produção)'),
    createTable(
      ['Etapa', 'Ator', 'Resultado'],
      [
        ['git push origin main', 'Desenvolvedor', 'Trigger automático do pipeline Vercel'],
        ['Install (npm ci)', 'Vercel Build', 'Dependências instaladas de forma reprodutível'],
        ['Build (next build)', 'Vercel Build', 'Análise estática, compilação TypeScript, otimizações'],
        ['Export estático', 'Vercel', 'Páginas SSG servidas pela CDN global'],
        ['Serverless function', 'Vercel', '/api/analyze compilado como função serverless AWS Lambda'],
        ['CDN Distribution', 'Vercel Edge Network', 'Assets distribuídos em PoPs globais'],
        ['Deploy ativo', 'Vercel', 'URL de produção atualizada automaticamente'],
      ],
    ),
    spacer(),

    heading1('5. Diagrama de Fluxo de Dados'),
    createTable(
      ['Passo', 'Dado', 'Origem', 'Destino', 'Armazenamento'],
      [
        ['1: Parsing PDF', 'Arquivo PDF do usuário', 'Input file do browser', 'pdfjs-dist Web Worker', 'Apenas memória RAM (não persistido)'],
        ['2: Texto extraído', 'String com conteúdo do currículo', 'Web Worker', 'React state (useState)', 'Memória React (não persistido)'],
        ['3: Descrição da vaga', 'Texto da vaga digitado', 'Textarea (usuário)', 'React state (useState)', 'Memória React (não persistido)'],
        ['4: Chamada à IA', 'Prompt = texto currículo + vaga', 'analyzeResume()', 'Provider de IA via HTTPS', 'Transmitido mas não armazenado pelo CyberLens'],
        ['5: Resposta da IA', 'JSON com análise estruturada', 'Provider de IA', 'parseAIResponse()', 'Memória React (temporário)'],
        ['6: AnalysisResult', 'Objeto tipado com todos os dados', 'parseAIResponse()', 'React state + localStorage', 'localStorage: cyberlens_last_analysis'],
        ['7: Settings', 'Provider, modelo, API key', 'Formulário de configurações', 'localStorage', 'localStorage: cyberlens_settings'],
        ['8: Consentimento', 'Boolean + timestamp do aceite', 'Modal de consentimento', 'localStorage', 'localStorage: cyberlens_consent'],
        ['9: Export PDF', 'AnalysisResult renderizado', 'React state', '@react-pdf/renderer', 'Arquivo .pdf no dispositivo do usuário'],
      ],
    ),
    spacer(),

    heading1('6. Decisões Arquiteturais (ADR)'),
    heading2('ADR-01: Next.js em vez de Vite/SPA puro'),
    createTable(
      ['Aspecto', 'Detalhes'],
      [
        ['Contexto', 'Necessidade de proxy CORS para a API da Anthropic, que não permite requisições cross-origin diretas'],
        ['Decisão', 'Usar Next.js com App Router para ter acesso a rotas API serverless'],
        ['Consequências positivas', 'CORS proxy nativo, deploy zero-config na Vercel, SSG para páginas estáticas, metadata e SEO'],
        ['Consequências negativas', 'Bundle ligeiramente maior que Vite; curva de aprendizado do App Router'],
        ['Alternativas descartadas', 'Vite + proxy externo (complexidade adicional); Express.js (custo de infraestrutura)'],
      ],
    ),
    spacer(),

    heading2('ADR-02: pdfjs-dist para parsing de PDF'),
    createTable(
      ['Aspecto', 'Detalhes'],
      [
        ['Contexto', 'Parsing de PDF deve ocorrer no browser para garantir privacidade do usuário'],
        ['Decisão', 'Usar pdfjs-dist v5 com Web Worker para não bloquear a thread principal da UI'],
        ['Consequências positivas', 'Privacidade total: PDF nunca sai do browser; parsing robusto de múltiplas páginas'],
        ['Consequências negativas', 'Bundle maior (~2.5MB); PDFs de imagem (sem camada de texto) não são suportados'],
        ['Alternativas descartadas', 'pdf-parse (Node.js only); upload para servidor (viola privacidade)'],
      ],
    ),
    spacer(),

    heading2('ADR-03: @react-pdf/renderer para exportação'),
    createTable(
      ['Aspecto', 'Detalhes'],
      [
        ['Contexto', 'Exportação do relatório em PDF deve ser feita client-side, com design consistente com a UI'],
        ['Decisão', 'Usar @react-pdf/renderer para definir o layout do PDF com componentes React'],
        ['Consequências positivas', 'Geração 100% client-side; API familiar para desenvolvedores React; resultado visual profissional'],
        ['Consequências negativas', 'Fontes web não são automaticamente suportadas; curva de aprendizado do sistema de layout'],
        ['Alternativas descartadas', 'jsPDF (API imperativa, difícil de manter); Puppeteer (server-side, custo de infra)'],
      ],
    ),
    spacer(),

    heading2('ADR-04: localStorage em vez de banco de dados'),
    createTable(
      ['Aspecto', 'Detalhes'],
      [
        ['Contexto', 'CyberLens não tem modelo de negócio que justifique infraestrutura de backend com banco de dados'],
        ['Decisão', 'Persistir apenas configurações, consentimento e último resultado no localStorage'],
        ['Consequências positivas', 'Zero custo de infraestrutura; privacidade total; deploy simples; sem autenticação necessária'],
        ['Consequências negativas', 'Dados perdidos se usuário limpar o browser; não há sincronização entre dispositivos'],
        ['Alternativas descartadas', 'Supabase (custo, complexidade, armazenamento de dados pessoais); IndexedDB (overkill para o volume)'],
      ],
    ),
    spacer(),

    heading2('ADR-05: Proxy CORS apenas para Anthropic'),
    createTable(
      ['Aspecto', 'Detalhes'],
      [
        ['Contexto', 'OpenAI, Google e HuggingFace permitem requisições CORS diretas do browser; Anthropic não'],
        ['Decisão', 'Criar rota /api/analyze exclusivamente para proxear requisições ao Anthropic Claude'],
        ['Consequências positivas', 'Minimiza o tráfego pelo servidor; API keys dos outros providers nunca passam pelo servidor'],
        ['Consequências negativas', 'A API key da Anthropic passa pela rota serverless (mas não é logada ou armazenada)'],
        ['Implementação', 'src/app/api/analyze/route.ts com limite de 500KB no body e validação de formato de chave'],
      ],
    ),
  ];

  const doc = createDocument(
    'CyberLens: Arquitetura e UML',
    'Arquitetura e Diagramas UML',
    'Documento Técnico de Arquitetura',
    content,
  );

  await saveDocument(doc, '04-arquitetura-uml.docx');
}

// ════════════════════════════════════════════════════════════════════════════
// DOCUMENT 5: Conformidade Legal e LGPD
// ════════════════════════════════════════════════════════════════════════════
async function generateDoc5(): Promise<void> {
  console.log('\n[5/6] Gerando 05-conformidade-lgpd.docx...');

  const content: (Paragraph | Table)[] = [
    heading1('1. Introdução'),
    bodyText(
      'O CyberLens foi desenvolvido desde sua concepção com o princípio de privacy-by-design, conforme exigido pelo Art. 46 da Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018). Isso significa que as decisões arquiteturais foram tomadas prioritariamente para minimizar o tratamento de dados pessoais, e não como medidas corretivas posteriores.',
    ),
    bodyText(
      'Este documento analisa a conformidade do CyberLens com a LGPD, mapeando os dados efetivamente tratados, as bases legais aplicáveis, as medidas técnicas implementadas, os direitos do titular e os riscos residuais.',
    ),
    bodyText(
      'Todas as referências a implementações técnicas neste documento correspondem ao código-fonte real da aplicação, auditável no repositório do projeto.',
    ),
    spacer(),

    heading1('2. Mapeamento de Dados Tratados'),
    createTable(
      ['Dado', 'Tipo LGPD', 'Onde Armazenado', 'Finalidade', 'Base Legal (Art. 7º)', 'Retenção'],
      [
        ['Texto do currículo', 'Dado pessoal (pode conter nome, CPF, endereço, etc.)', 'Memória do browser (NÃO persistido)', 'Análise de aderência à vaga', 'Consentimento (I)', 'Duração da sessão: descartado ao fechar a aba'],
        ['Descrição da vaga', 'Dado não pessoal', 'Memória do browser (NÃO persistido)', 'Análise de aderência ao currículo', 'Legítimo interesse (IX)', 'Duração da sessão'],
        ['Chave de API', 'Credencial de autenticação', 'localStorage: cyberlens_settings', 'Autenticação com provider de IA escolhido pelo usuário', 'Consentimento (I)', 'Até remoção manual pelo usuário'],
        ['Provider e modelo', 'Preferência técnica', 'localStorage: cyberlens_settings', 'Configuração do serviço', 'Legítimo interesse (IX)', 'Até remoção manual pelo usuário'],
        ['Registro de consentimento', 'Dado de conformidade', 'localStorage: cyberlens_consent', 'Comprovação de aceite LGPD', 'Obrigação legal (II)', 'Até remoção manual pelo usuário'],
        ['Resultado da análise', 'Dado derivado (não pessoal em si)', 'localStorage: cyberlens_last_analysis', 'Consulta posterior do resultado', 'Legítimo interesse (IX)', 'Até remoção manual pelo usuário'],
      ],
    ),
    spacer(),

    heading1('3. Base Legal para Tratamento (Art. 7º)'),
    heading2('3.1 Consentimento (Art. 7º, Inciso I)'),
    bodyText(
      'O tratamento do texto do currículo (dado pessoal) e o armazenamento da API key são fundamentados no consentimento livre, informado, inequívoco e específico do titular, obtido através do modal de consentimento implementado em src/components/ConsentModal.tsx.',
    ),
    bulletItem('Implementação: Modal bloqueante na primeira visita, sem possibilidade de fechar sem aceitar'),
    bulletItem('Coleta: Checkbox obrigatório que o usuário deve marcar ativamente'),
    bulletItem('Informação: Link direto para Política de Privacidade e Termos de Uso no modal'),
    bulletItem('Registro: Timestamp e versão do consentimento salvos em cyberlens_consent no localStorage'),
    bulletItem('Revogação: Botão "Limpar Todos os Dados" em /configuracoes remove o consentimento; modal reapare na próxima visita'),
    spacer(),

    heading2('3.2 Legítimo Interesse (Art. 7º, Inciso IX)'),
    bodyText(
      'O armazenamento de preferências técnicas (provider, modelo) e do resultado da análise é fundamentado no legítimo interesse do controlador e do titular, pois é necessário para a funcionalidade básica da aplicação.',
    ),
    bulletItem('Necessidade: Sem persistir as configurações, o usuário precisaria reconfigurar a cada visita'),
    bulletItem('Proporcionalidade: Apenas dados estritamente necessários são persistidos'),
    bulletItem('Interesse do titular: O próprio usuário se beneficia desta persistência'),
    spacer(),

    heading1('4. Medidas Técnicas de Proteção (Art. 46)'),
    heading2('4.1 Headers HTTP de Segurança'),
    bodyText(
      'Configurados em next.config.ts e aplicados a todas as respostas do servidor:',
    ),
    createTable(
      ['Header', 'Valor', 'Proteção'],
      [
        ['X-Content-Type-Options', 'nosniff', 'Previne MIME type sniffing: força o browser a respeitar o Content-Type declarado'],
        ['X-Frame-Options', 'DENY', 'Previne clickjacking: bloqueia embedding da aplicação em iframes'],
        ['X-XSS-Protection', '1; mode=block', 'Ativa filtro XSS do browser (compatibilidade com browsers mais antigos)'],
        ['Referrer-Policy', 'strict-origin-when-cross-origin', 'Limita informações de referência enviadas em requisições cross-origin'],
        ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()', 'Desabilita explicitamente acesso a hardware sensível não utilizado pela aplicação'],
      ],
    ),
    spacer(),

    heading2('4.2 Sanitização de Inputs'),
    bodyText(
      'Implementada em src/lib/utils/validators.ts, a função sanitizeText() é aplicada a todos os inputs de texto antes do processamento:',
    ),
    bulletItem('Remove tags <script> e seu conteúdo'),
    bulletItem('Remove handlers de evento HTML (onclick, onload, onerror, etc.)'),
    bulletItem('Remove URIs javascript: em atributos href e src'),
    bulletItem('Trunca texto no limite máximo para evitar ataques de buffer'),
    bulletItem('A validação de API key rejeita patterns de SQL injection e script tags'),
    spacer(),

    heading2('4.3 Proxy CORS para Anthropic'),
    bodyText(
      'A rota src/app/api/analyze/route.ts implementa as seguintes medidas de segurança:',
    ),
    bulletItem('Limite de 500KB no body da requisição (prevenção de DoS)'),
    bulletItem('Validação do formato da chave de API (deve começar com "sk-ant-")'),
    bulletItem('Zero logging: a API key e o conteúdo do currículo não são registrados em logs'),
    bulletItem('Headers CORS restritivos: apenas a origem da própria aplicação é permitida'),
    spacer(),

    heading2('4.4 Processamento Client-Side do PDF'),
    bodyText(
      'O arquivo PDF nunca é transmitido para nenhum servidor. O parsing é realizado inteiramente no navegador do usuário via pdfjs-dist em um Web Worker dedicado. O arquivo é carregado como ArrayBuffer na memória do browser, o texto é extraído página a página, e o ArrayBuffer é descartado ao final do processo.',
    ),
    spacer(),

    heading2('4.5 HTTPS Obrigatório'),
    bodyText(
      'O deploy na Vercel força HTTPS em todas as comunicações. Não há modo HTTP disponível em produção. Isso garante que a API key e o conteúdo do currículo, quando transmitidos ao provider de IA, trafeguem criptografados.',
    ),
    spacer(),

    heading1('5. Direitos do Titular (Art. 18)'),
    createTable(
      ['Direito', 'Art. 18', 'Como Exercer no CyberLens'],
      [
        ['I: Confirmação do tratamento', 'Art. 18, I', 'Acesse DevTools do browser > Application > Local Storage > domínio do CyberLens. A presença das chaves cyberlens_* confirma os dados armazenados.'],
        ['II: Acesso aos dados', 'Art. 18, II', 'Mesmo procedimento acima. Os dados estão visíveis em texto (JSON) no localStorage, sem necessidade de solicitação ao controlador.'],
        ['III: Correção de dados', 'Art. 18, III', 'Acesse /configuracoes para atualizar API key, provider e modelo. Para o currículo, faça um novo upload.'],
        ['IV: Anonimização, bloqueio ou eliminação', 'Art. 18, IV', 'Botão "Limpar Todos os Dados" em /configuracoes remove todas as chaves do localStorage imediatamente.'],
        ['V: Portabilidade', 'Art. 18, V', 'Os dados estão em JSON no localStorage e podem ser copiados manualmente via DevTools ou exportados pelo navegador.'],
        ['VI: Eliminação dos dados tratados', 'Art. 18, VI', '"Limpar Todos os Dados" em /configuracoes executa: remoção de todas as chaves cyberlens_* + window.location.reload() para resetar o estado da aplicação.'],
        ['VII: Informação sobre compartilhamento', 'Art. 18, VII', 'Seção 5 da Política de Privacidade (/privacidade) lista todos os terceiros que podem receber dados: apenas o provider de IA escolhido pelo próprio usuário.'],
        ['VIII: Não consentir', 'Art. 18, VIII', 'O usuário pode fechar o browser ou não aceitar o modal de consentimento. Sem aceite, a funcionalidade principal não está disponível (por design: sem consentimento, não há análise).'],
        ['IX: Revogação do consentimento', 'Art. 18, IX', '"Limpar Dados" remove cyberlens_consent. Na próxima visita, o modal de consentimento reapare, exigindo novo aceite para continuar.'],
      ],
    ),
    spacer(),

    heading1('6. Transferência Internacional de Dados (Art. 33)'),
    bodyText(
      'Ao utilizar qualquer provider de IA, o texto do currículo e a descrição da vaga são transmitidos para servidores localizados fora do Brasil. Esta transferência é necessária para a funcionalidade principal da aplicação.',
    ),
    createTable(
      ['Provider', 'País', 'Empresa', 'Base Legal (Art. 33)', 'Mecanismo de Adequação'],
      [
        ['OpenAI', 'Estados Unidos', 'OpenAI, LLC', 'Consentimento específico do titular (VIII)', 'Usuário escolhe explicitamente o provider'],
        ['Anthropic', 'Estados Unidos', 'Anthropic, PBC', 'Consentimento específico do titular (VIII)', 'Usuário escolhe explicitamente o provider'],
        ['Google Gemini', 'Estados Unidos', 'Google LLC', 'Consentimento específico do titular (VIII)', 'Usuário escolhe explicitamente o provider'],
        ['HuggingFace', 'EUA / França', 'Hugging Face, Inc.', 'Consentimento específico do titular (VIII)', 'Usuário escolhe explicitamente o provider'],
      ],
    ),
    bodyText(
      'O ato de selecionar um provider de IA nas configurações e clicar em "Analisar" constitui consentimento específico e inequívoco para a transferência de dados ao referido provider, conforme Art. 33, inciso VIII da LGPD. Esta informação está detalhada na Política de Privacidade.',
    ),
    spacer(),

    heading1('7. Análise de Riscos e Mitigações'),
    createTable(
      ['Risco', 'Impacto', 'Probabilidade', 'Mitigação Implementada'],
      [
        ['Vazamento da API key por XSS', 'Médio: custo financeiro para o usuário', 'Baixa', 'sanitizeText() remove scripts; CSP headers bloqueiam inline scripts; API key mascarada na UI'],
        ['Dados enviados a servidor incorreto', 'Alto: exposição indevida do currículo', 'Muito Baixa', 'URLs dos providers são hardcoded no código-fonte; usuário não pode configurar endpoints'],
        ['Ataque XSS via conteúdo do PDF', 'Alto: execução de código malicioso', 'Baixa', 'sanitizeText() aplicado ao texto extraído; conteúdo renderizado como texto puro, não HTML'],
        ['Perda de dados pelo usuário', 'Baixo: inconveniência', 'Média', 'Documentação orienta que localStorage pode ser limpo pelo browser; usuário pode exportar via DevTools'],
        ['Acesso não autorizado ao localStorage', 'Médio: exposição da API key', 'Muito Baixa', 'localStorage tem escopo de origem (same-origin); HTTPS previne ataques de rede'],
        ['Uso indevido do proxy CORS', 'Médio: custo de uso da API Anthropic', 'Baixa', 'Limite de 500KB, validação de formato de chave; rate limiting da própria Vercel'],
      ],
    ),
    spacer(),

    heading1('8. Política de Privacidade'),
    bodyText(
      'A Política de Privacidade completa está disponível na rota /privacidade da aplicação. O documento cobre as seguintes 13 seções conforme exigido pela LGPD:',
    ),
    createTable(
      ['Seção', 'Conteúdo'],
      [
        ['1. Quem somos', 'Identificação do controlador de dados e dados de contato'],
        ['2. Dados que coletamos', 'Inventário completo de dados tratados com finalidades'],
        ['3. Como usamos seus dados', 'Finalidades específicas para cada categoria de dado'],
        ['4. Base legal', 'Fundamentação jurídica para cada operação de tratamento'],
        ['5. Compartilhamento', 'Listagem dos terceiros (providers de IA) com quem dados podem ser compartilhados'],
        ['6. Transferência internacional', 'Detalhamento da transferência para providers no exterior'],
        ['7. Armazenamento e retenção', 'Onde os dados são armazenados e por quanto tempo'],
        ['8. Segurança', 'Medidas técnicas e organizacionais de proteção'],
        ['9. Seus direitos', 'Como exercer os 9 direitos do Art. 18 da LGPD'],
        ['10. Cookies', 'CyberLens não utiliza cookies; usa apenas localStorage'],
        ['11. Menores de idade', 'Aplicação não destinada a menores de 18 anos'],
        ['12. Alterações', 'Processo de atualização desta política'],
        ['13. Contato', 'Canal para exercício de direitos e dúvidas'],
      ],
    ),
    spacer(),

    heading1('9. Termos de Uso'),
    bodyText(
      'Os Termos de Uso completos estão disponíveis na rota /termos da aplicação. O documento estabelece as condições de uso do serviço, incluindo:',
    ),
    bulletItem('Aceite dos termos como condição de uso'),
    bulletItem('Descrição do serviço e suas limitações'),
    bulletItem('Responsabilidades do usuário (uso adequado, não compartilhar API key, não usar para fins ilícitos)'),
    bulletItem('Limitações de responsabilidade do CyberLens (ferramenta de apoio, não substitui análise profissional)'),
    bulletItem('Propriedade intelectual do código-fonte e da interface'),
    bulletItem('Condições de encerramento do serviço'),
    bulletItem('Lei aplicável: legislação brasileira, foro de São Paulo/SP'),
  ];

  const doc = createDocument(
    'CyberLens: Conformidade LGPD',
    'Conformidade Legal e LGPD',
    'Análise de Conformidade com a Lei 13.709/2018',
    content,
  );

  await saveDocument(doc, '05-conformidade-lgpd.docx');
}

// ════════════════════════════════════════════════════════════════════════════
// DOCUMENT 6: Guia de Contribuição e Deploy
// ════════════════════════════════════════════════════════════════════════════
async function generateDoc6(): Promise<void> {
  console.log('\n[6/6] Gerando 06-contribuicao-deploy.docx...');

  const content: (Paragraph | Table)[] = [
    heading1('1. Configuração do Ambiente de Desenvolvimento'),
    heading2('1.1 Pré-requisitos'),
    createTable(
      ['Ferramenta', 'Versão Mínima', 'Verificar com', 'Download'],
      [
        ['Node.js', '18.0.0 LTS', 'node --version', 'https://nodejs.org'],
        ['npm', '9.0.0', 'npm --version', 'Incluído com Node.js'],
        ['Git', '2.30.0', 'git --version', 'https://git-scm.com'],
        ['VS Code (recomendado)', 'Qualquer', 'code --version', 'https://code.visualstudio.com'],
      ],
    ),
    spacer(),

    heading2('1.2 Instalação e Execução'),
    bodyText('Execute os seguintes comandos em sequência no terminal:'),
    bulletItem('git clone https://github.com/eoLucasS/CyberLens.git && cd cyberlens', 'Passo 1: Clonar repositório'),
    bulletItem('npm install', 'Passo 2: Instalar dependências'),
    bulletItem('npm run dev', 'Passo 3: Iniciar servidor de desenvolvimento'),
    bodyText(
      'Após o Passo 3, a aplicação estará disponível em http://localhost:3000. O terminal exibirá mensagens de compilação e a mensagem "Ready in Xs" quando estiver pronto.',
    ),
    spacer(),

    heading2('1.3 Scripts Disponíveis'),
    createTable(
      ['Script', 'Comando', 'Descrição'],
      [
        ['Desenvolvimento', 'npm run dev', 'Next.js dev server com HMR em localhost:3000'],
        ['Build', 'npm run build', 'Build de produção com type checking e otimizações'],
        ['Start', 'npm start', 'Servidor de produção (requer npm run build antes)'],
        ['Lint', 'npm run lint', 'ESLint em todos os arquivos TypeScript/TSX'],
        ['Type Check', 'npm run typecheck', 'TypeScript compiler sem emissão de arquivos'],
        ['Gerar Docs', 'npx tsx scripts/generate-docs.ts', 'Gera os 6 documentos .docx na pasta docs/'],
      ],
    ),
    spacer(),

    heading1('2. Padrões de Código'),
    heading2('2.1 TypeScript'),
    bulletItem('TypeScript strict mode ativado no tsconfig.json (strict: true)'),
    bulletItem('Uso de any é proibido; use unknown, genéricos ou types específicos'),
    bulletItem('Todos os props de componentes devem ter interfaces ou types nomeados'),
    bulletItem('Prefer interface para objetos públicos; prefer type para unions e intersections'),
    bulletItem('Comentários de código em inglês; texto da UI em português brasileiro'),
    spacer(),

    heading2('2.2 Componentes React'),
    bulletItem('Apenas componentes funcionais; sem class components'),
    bulletItem('Named exports obrigatórios; sem default export de componentes'),
    bulletItem('Um componente por arquivo; sem múltiplos componentes no mesmo arquivo'),
    bulletItem('Props destructuradas no parâmetro da função, não dentro do corpo'),
    bulletItem('Hooks customizados em src/hooks/ com prefixo "use"'),
    spacer(),

    heading2('2.3 Imports e Organização'),
    bulletItem('Imports absolutos via alias @/ para tudo dentro de src/'),
    bulletItem('Ordem de imports: libs externas → aliases @/ → tipos → assets'),
    bulletItem('Sem imports relativos (../../) exceto dentro do mesmo módulo'),
    spacer(),

    heading2('2.4 Estilo e Formatação'),
    bulletItem('Prettier para formatação automática (configurado no projeto)'),
    bulletItem('ESLint com regras do Next.js + TypeScript strict'),
    bulletItem('Tailwind CSS para todos os estilos; sem CSS customizado exceto globals.css'),
    bulletItem('Classes Tailwind ordenadas com prettier-plugin-tailwindcss'),
    spacer(),

    heading1('3. Estrutura do Projeto'),
    createTable(
      ['Caminho', 'Tipo', 'Descrição'],
      [
        ['src/app/', 'Diretório', 'App Router do Next.js: páginas e layouts'],
        ['src/app/layout.tsx', 'Arquivo', 'Layout raiz com metadata global e providers'],
        ['src/app/page.tsx', 'Arquivo', 'Página principal com o fluxo de análise'],
        ['src/app/configuracoes/page.tsx', 'Arquivo', 'Página de configurações de provider e API key'],
        ['src/app/privacidade/page.tsx', 'Arquivo', 'Política de privacidade (conteúdo estático)'],
        ['src/app/termos/page.tsx', 'Arquivo', 'Termos de uso (conteúdo estático)'],
        ['src/app/sobre/page.tsx', 'Arquivo', 'Sobre o projeto'],
        ['src/app/api/analyze/route.ts', 'Arquivo', 'API Route: proxy CORS para Anthropic'],
        ['src/components/', 'Diretório', 'Todos os componentes React'],
        ['src/components/ui/', 'Diretório', 'Componentes de UI genéricos (Button, Card, etc.)'],
        ['src/components/analysis/', 'Diretório', 'Componentes específicos da análise (Score, Gaps, etc.)'],
        ['src/components/layout/', 'Diretório', 'Header, Footer, ConsentModal'],
        ['src/lib/', 'Diretório', 'Lógica de negócio, utilitários e integrações'],
        ['src/lib/ai/', 'Diretório', 'Integrações com providers de IA'],
        ['src/lib/ai/index.ts', 'Arquivo', 'Ponto de entrada para chamadas de IA'],
        ['src/lib/ai/parser.ts', 'Arquivo', 'Parsing da resposta JSON da IA'],
        ['src/lib/ai/prompt.ts', 'Arquivo', 'Construção do prompt para análise'],
        ['src/lib/pdf/', 'Diretório', 'Utilitários de PDF (parsing e exportação)'],
        ['src/lib/pdf/parser.ts', 'Arquivo', 'Extração de texto de PDF via pdfjs-dist'],
        ['src/lib/pdf/exporter.tsx', 'Arquivo', 'Geração de PDF via @react-pdf/renderer'],
        ['src/lib/utils/', 'Diretório', 'Funções utilitárias gerais'],
        ['src/lib/utils/validators.ts', 'Arquivo', 'Validação e sanitização de inputs'],
        ['src/lib/utils/storage.ts', 'Arquivo', 'Wrappers tipados para localStorage'],
        ['src/hooks/', 'Diretório', 'Custom hooks React'],
        ['src/types/', 'Diretório', 'Definições de tipos TypeScript'],
        ['src/types/analysis.ts', 'Arquivo', 'AnalysisResult e tipos relacionados'],
        ['src/types/settings.ts', 'Arquivo', 'UserSettings, AIProviderName, etc.'],
        ['src/constants/', 'Diretório', 'Constantes da aplicação'],
        ['src/constants/providers.ts', 'Arquivo', 'Configurações de providers de IA'],
        ['public/', 'Diretório', 'Assets estáticos (ícones, fontes)'],
        ['scripts/', 'Diretório', 'Scripts de desenvolvimento e geração de artefatos'],
        ['docs/', 'Diretório', 'Documentação gerada (arquivos .docx)'],
        ['next.config.ts', 'Arquivo', 'Configuração do Next.js (headers, otimizações)'],
        ['tailwind.config.ts', 'Arquivo', 'Configuração do Tailwind CSS (cores, fontes)'],
        ['tsconfig.json', 'Arquivo', 'Configuração do TypeScript (strict mode, aliases)'],
      ],
    ),
    spacer(),

    heading1('4. Como Adicionar um Novo Provider de IA'),
    bodyText(
      'Siga os passos abaixo para integrar um novo provider de IA ao CyberLens. Todos os passos são obrigatórios.',
    ),
    spacer(),

    heading2('Passo 1: Registrar o tipo do provider'),
    bodyText('Arquivo: src/types/settings.ts'),
    bodyText(
      'Adicione o nome do novo provider à union type AIProviderName. Exemplo: export type AIProviderName = "openai" | "anthropic" | "google" | "huggingface" | "novo-provider";',
    ),
    spacer(),

    heading2('Passo 2: Adicionar configuração e modelos'),
    bodyText('Arquivo: src/constants/providers.ts'),
    bodyText(
      'Adicione uma entrada ao objeto AI_PROVIDERS com: name (display name), id (snake_case), models (array de ModelOption com id, name, description), requiresCorsProxy (boolean), baseUrl (URL base da API).',
    ),
    spacer(),

    heading2('Passo 3: Implementar a função de chamada'),
    bodyText('Arquivo: src/lib/ai/index.ts'),
    bodyText(
      'Crie uma função callNovoProvider(prompt: string, model: string, apiKey: string): Promise<string> que faça a requisição HTTP ao provider e retorne a resposta textual da IA. Adicione o case ao switch da função principal analyzeResume().',
    ),
    spacer(),

    heading2('Passo 4: Implementar teste de conexão'),
    bodyText('Arquivo: src/lib/ai/index.ts'),
    bodyText(
      'Adicione um case ao switch da função testConnection() com uma requisição mínima ao provider para validar a API key (preferencialmente usando o modelo mais barato disponível).',
    ),
    spacer(),

    heading2('Passo 5: Criar proxy CORS (se necessário)'),
    bodyText('Arquivo: src/app/api/novo-provider/route.ts (criar novo arquivo)'),
    bodyText(
      'Se o novo provider não permite requisições CORS diretas do browser, copie o arquivo src/app/api/analyze/route.ts como base, adapte para o formato de requisição do novo provider, e atualize callNovoProvider() para usar a rota /api/novo-provider.',
    ),
    spacer(),

    heading2('Passo 6: Testar'),
    bulletItem('npm run dev (verificar se o provider aparece no dropdown de configurações)'),
    bulletItem('Configurar API key e usar "Testar Conexão" na página /configuracoes'),
    bulletItem('Realizar análise completa com um currículo e vaga de teste'),
    bulletItem('npm run build (garantir que não há erros de TypeScript ou lint)'),
    spacer(),

    heading1('5. Deploy na Vercel'),
    heading2('5.1 Deploy Inicial'),
    createTable(
      ['Passo', 'Ação', 'Detalhes'],
      [
        ['1', 'Acessar vercel.com', 'Fazer login com GitHub, GitLab ou Bitbucket'],
        ['2', 'New Project', 'Clicar em "Add New..." > "Project"'],
        ['3', 'Import repositório', 'Selecionar o repositório do CyberLens'],
        ['4', 'Configurar projeto', 'Framework: Next.js (detectado automaticamente)'],
        ['5', 'Build command', 'npm run build (padrão, não precisa alterar)'],
        ['6', 'Output directory', '.next (padrão, não precisa alterar)'],
        ['7', 'Deploy', 'Clicar em "Deploy" e aguardar ~2 minutos'],
        ['8', 'URL de produção', 'Vercel fornece URL: https://cyberlens-xxx.vercel.app'],
      ],
    ),
    spacer(),

    heading2('5.2 Deploys Subsequentes'),
    bodyText(
      'Após o setup inicial, cada push para a branch main dispara um deploy automático. Pushes para outras branches geram Preview Deployments com URLs únicas para revisão.',
    ),
    spacer(),

    heading2('5.3 Domínio Customizado'),
    bulletItem('Acesse Project Settings > Domains na dashboard da Vercel'),
    bulletItem('Adicione seu domínio personalizado'),
    bulletItem('Configure os registros DNS conforme instrução da Vercel (CNAME ou A record)'),
    bulletItem('HTTPS é provisionado automaticamente via Let\'s Encrypt'),
    spacer(),

    heading1('6. Variáveis de Ambiente'),
    bodyText(
      'O CyberLens foi projetado para funcionar sem variáveis de ambiente obrigatórias. Todas as configurações são feitas pelo usuário via interface.',
    ),
    createTable(
      ['Variável', 'Obrigatória', 'Padrão', 'Descrição'],
      [
        ['NEXT_PUBLIC_DEFAULT_PROVIDER', 'Não', 'openai', 'Provider padrão pré-selecionado na primeira visita'],
        ['NEXT_PUBLIC_APP_URL', 'Não', 'http://localhost:3000', 'URL base da aplicação (usada em metadados Open Graph)'],
        ['NEXT_PUBLIC_APP_VERSION', 'Não', '1.0.0', 'Versão exibida no footer e documentos exportados'],
      ],
    ),
    bodyText(
      'Nota: Variáveis com prefixo NEXT_PUBLIC_ são expostas ao browser. Nunca adicione variáveis sem este prefixo que contenham segredos, pois elas ficam visíveis no bundle client-side do Next.js.',
    ),
    spacer(),

    heading1('7. Troubleshooting'),
    heading2('7.1 pdfjs-dist: Worker não carrega'),
    createTable(
      ['Sintoma', 'Causa', 'Solução'],
      [
        ['Erro: "Setting up fake worker failed"', 'Worker path incorreto no Next.js', 'Verificar configuração do workerSrc em src/lib/pdf/parser.ts. Usar GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js" e copiar o arquivo para public/'],
        ['PDF não processa (sem erro)', 'Web Worker bloqueado por CSP', 'Verificar Content-Security-Policy em next.config.ts; adicionar worker-src blob: se necessário'],
        ['Erro de versão de worker', 'Versão do worker diferente da biblioteca', 'Certificar que pdf.worker.min.js na pasta public/ é da mesma versão do pdfjs-dist instalado'],
      ],
    ),
    spacer(),

    heading2('7.2 Erros CORS com Anthropic'),
    createTable(
      ['Sintoma', 'Causa', 'Solução'],
      [
        ['CORS error ao usar Anthropic em dev', 'Chamada direta bloqueada pelo browser', 'Verificar se src/lib/ai/index.ts roteia Anthropic para /api/analyze e não diretamente para a API'],
        ['CORS error em produção', 'API Route não deployada', 'Verificar no painel Vercel se a função /api/analyze foi criada; rebuild se necessário'],
        ['Erro 400 na API Route', 'Formato de body incorreto', 'Verificar estrutura do JSON enviado; Anthropic espera formato específico com messages[]'],
      ],
    ),
    spacer(),

    heading2('7.3 Erros de API Key'),
    createTable(
      ['Sintoma', 'Causa', 'Solução'],
      [
        ['401 Unauthorized', 'API key inválida ou expirada', 'Gerar nova chave no painel do provider; verificar se há espaços no início/fim'],
        ['403 Forbidden', 'Key sem permissão para o modelo', 'Verificar no painel do provider se a chave tem acesso ao modelo selecionado'],
        ['429 Too Many Requests', 'Rate limit atingido', 'Aguardar alguns minutos; considerar upgrade do plano no provider'],
        ['Chave não salva entre sessões', 'localStorage desabilitado', 'Verificar se cookies/storage estão habilitados para o domínio no browser'],
      ],
    ),
    spacer(),

    heading2('7.4 Falhas no Build'),
    createTable(
      ['Sintoma', 'Causa', 'Solução'],
      [
        ['TypeScript error: Type any', 'Uso explícito ou implícito de any', 'Substituir por tipo específico ou unknown; usar satisfies para inferência'],
        ['Module not found @/', 'Alias não configurado', 'Verificar paths em tsconfig.json: "@/*": ["./src/*"]'],
        ['Build out of memory', 'Bundle muito grande (pdfjs-dist)', 'Verificar se pdfjs-dist está em dynamic import com { ssr: false }'],
        ['Lint error no CI', 'Regras ESLint violadas', 'Executar npm run lint localmente e corrigir antes do push'],
      ],
    ),
  ];

  const doc = createDocument(
    'CyberLens: Contribuição e Deploy',
    'Guia de Contribuição e Deploy',
    'Manual Técnico para Desenvolvedores',
    content,
  );

  await saveDocument(doc, '06-contribuicao-deploy.docx');
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN: Gerar todos os documentos
// ════════════════════════════════════════════════════════════════════════════
async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   CyberLens: Gerador de Documentação      ║');
  console.log('║   Versão 1.0.0, 24 de março de 2026       ║');
  console.log('╚════════════════════════════════════════════╝');

  const docsDir = path.join(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
    console.log(`\nPasta docs/ criada em: ${docsDir}`);
  } else {
    console.log(`\nPasta docs/ encontrada em: ${docsDir}`);
  }

  try {
    await generateDoc1();
    await generateDoc2();
    await generateDoc3();
    await generateDoc4();
    await generateDoc5();
    await generateDoc6();

    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   Documentação gerada com sucesso!          ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log('║  docs/01-visao-geral.docx                   ║');
    console.log('║  docs/02-funcionalidades.docx               ║');
    console.log('║  docs/03-usabilidade-ux.docx                ║');
    console.log('║  docs/04-arquitetura-uml.docx               ║');
    console.log('║  docs/05-conformidade-lgpd.docx             ║');
    console.log('║  docs/06-contribuicao-deploy.docx           ║');
    console.log('╚════════════════════════════════════════════╝');
  } catch (error) {
    console.error('\nErro ao gerar documentação:', error);
    process.exit(1);
  }
}

main();
