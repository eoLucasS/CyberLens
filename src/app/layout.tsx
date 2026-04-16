import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import ConsentModal from "@/components/legal/ConsentModal";

export const metadata: Metadata = {
  title: "CyberLens - Análise de Aderência de Currículo",
  description:
    "Analise a aderência do seu currículo a qualquer vaga de emprego com inteligência artificial. Funciona para TI, cibersegurança, dados, DevOps, suporte técnico e qualquer área profissional.",
  keywords: [
    "análise de currículo",
    "aderência de vaga",
    "currículo IA",
    "ATS",
    "raio-x de currículo",
    "plano de estudos",
    "carreira",
    "CyberLens",
  ],
  authors: [{ name: "Lucas Silva", url: "https://github.com/eoLucasS" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "CyberLens - Análise de Aderência de Currículo",
    description:
      "Analise a aderência do seu currículo a qualquer vaga de emprego com IA. Privacidade total, processamento local, zero cadastro.",
    siteName: "CyberLens",
  },
  twitter: {
    card: "summary_large_image",
    title: "CyberLens - Análise de Aderência de Currículo",
    description:
      "Analise seu currículo contra qualquer vaga com IA. Sem cadastro, sem servidor, 100% client-side.",
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
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ConsentModal />
      </body>
    </html>
  );
}
