import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import ConsentModal from "@/components/legal/ConsentModal";

export const metadata: Metadata = {
  title: "CyberLens - Análise de Aderência de Currículo",
  description:
    "Analise a aderência do seu currículo a qualquer vaga de emprego com inteligência artificial. Funciona para TI, cibersegurança, dados, DevOps, suporte técnico e qualquer área profissional.",
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
