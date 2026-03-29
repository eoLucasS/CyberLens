"use client";

import Link from "next/link";
import { Shield, Lock, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-cyber-bg border-t border-white/5">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* Desktop: 3-column grid | Mobile: stacked compact layout */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-8">
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-cyber-accent">
              <Shield className="w-5 h-5" />
              <span className="text-base font-semibold text-cyber-text">
                CyberLens
              </span>
            </div>
            <p className="text-sm text-cyber-text-secondary leading-relaxed">
              Análise inteligente de aderência de currículo a qualquer vaga de
              emprego, em qualquer área profissional.
            </p>
          </div>

          {/* Column 2: Legal links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-cyber-text uppercase tracking-wider">
              Legal
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/privacidade"
                className="text-sm text-cyber-text-secondary hover:text-cyber-accent transition-colors"
              >
                Política de Privacidade
              </Link>
              <Link
                href="/termos"
                className="text-sm text-cyber-text-secondary hover:text-cyber-accent transition-colors"
              >
                Termos de Uso
              </Link>
              <Link
                href="/sobre"
                className="text-sm text-cyber-text-secondary hover:text-cyber-accent transition-colors"
              >
                Sobre
              </Link>
              <Link
                href="/documentacao"
                className="text-sm text-cyber-text-secondary hover:text-cyber-accent transition-colors"
              >
                Documentação
              </Link>
            </nav>
          </div>

          {/* Column 3: Author */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-cyber-text uppercase tracking-wider">
              Projeto
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-cyber-text-secondary">
              <span>Feito com</span>
              <Lock className="w-3.5 h-3.5 text-cyber-accent" />
              <span>por Lucas Silva</span>
            </div>
            <a
              href="https://github.com/eoLucasS/CyberLens"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-cyber-text-secondary hover:text-cyber-accent transition-colors w-fit"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Ver no GitHub</span>
            </a>
          </div>
        </div>

        {/* Mobile layout: compact and clean */}
        <div className="sm:hidden">
          {/* Brand */}
          <div className="flex items-center justify-center gap-2 text-cyber-accent mb-4">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-semibold text-cyber-text">CyberLens</span>
          </div>

          {/* Nav links in a row */}
          <nav className="flex items-center justify-center gap-4 mb-4">
            <Link href="/privacidade" className="text-xs text-cyber-text-secondary hover:text-cyber-accent transition-colors">
              Privacidade
            </Link>
            <span className="text-white/10">|</span>
            <Link href="/termos" className="text-xs text-cyber-text-secondary hover:text-cyber-accent transition-colors">
              Termos
            </Link>
            <span className="text-white/10">|</span>
            <Link href="/sobre" className="text-xs text-cyber-text-secondary hover:text-cyber-accent transition-colors">
              Sobre
            </Link>
            <span className="text-white/10">|</span>
            <Link href="/documentacao" className="text-xs text-cyber-text-secondary hover:text-cyber-accent transition-colors">
              Docs
            </Link>
          </nav>

          {/* Author + GitHub in a row */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center gap-1 text-xs text-cyber-text-secondary">
              <span>Feito com</span>
              <Lock className="w-3 h-3 text-cyber-accent" />
              <span>por Lucas Silva</span>
            </div>
            <span className="text-white/10">|</span>
            <a
              href="https://github.com/eoLucasS/CyberLens"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-cyber-text-secondary hover:text-cyber-accent transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              GitHub
            </a>
          </div>
        </div>

        {/* Bottom bar (both mobile and desktop) */}
        <div className="mt-4 sm:mt-10 pt-4 sm:pt-6 border-t border-white/5">
          <p className="text-[10px] sm:text-xs text-cyber-text-secondary text-center">
            &copy; 2026 CyberLens. Código aberto sob licença MIT.
          </p>
          <p className="text-[10px] sm:text-xs text-[#9ca3af] text-center mt-1">
            Este site não utiliza cookies de rastreamento e não coleta dados pessoais.
          </p>
        </div>
      </div>
    </footer>
  );
}
