import type { Metadata } from 'next';
import './globals.css';
import { Header, Footer } from '@/components/layout';
import ConsentModal from '@/components/legal/ConsentModal';

export const metadata: Metadata = {
  title: 'CyberLens - Análise de Aderência de Currículo',
  description:
    'Analise a aderência do seu currículo a qualquer vaga de emprego com inteligência artificial. Funciona para TI, cibersegurança, dados, DevOps, suporte técnico e qualquer área profissional.',
  keywords: [
    'análise de currículo',
    'aderência de vaga',
    'currículo IA',
    'ATS',
    'raio-x de currículo',
    'plano de estudos',
    'carreira',
    'CyberLens',
  ],
  authors: [{ name: 'Lucas Silva', url: 'https://github.com/eoLucasS' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'CyberLens - Análise de Aderência de Currículo',
    description:
      'Analise a aderência do seu currículo a qualquer vaga de emprego com IA. Privacidade total, processamento local, zero cadastro.',
    siteName: 'CyberLens',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CyberLens - Análise de Aderência de Currículo',
    description:
      'Analise seu currículo contra qualquer vaga com IA. Sem cadastro, sem servidor, 100% client-side.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full" data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col bg-cyber-bg text-cyber-text font-sans antialiased">
        {/*
          Skip-link: invisible until focused via Tab. Lets keyboard and
          screen reader users jump past the sticky header straight to the
          page content on every route.
        */}
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#00ffd5] focus:text-[#0a0a0f] focus:font-semibold focus:shadow-[0_0_24px_rgba(0,255,213,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00ffd5]/60"
        >
          Pular para o conteúdo
        </a>
        <Header />
        <main id="conteudo" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer />
        <ConsentModal />
      </body>
    </html>
  );
}
