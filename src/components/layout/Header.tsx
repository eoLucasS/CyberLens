"use client";

import Link from "next/link";
import { Shield, Settings, ExternalLink, BookOpen } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-cyber-bg/80 backdrop-blur-md border-b border-white/5">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-cyber-accent hover:text-cyber-accent/80 transition-colors"
          >
            <Shield className="w-6 h-6" />
            <span className="text-lg font-semibold tracking-tight text-cyber-text">
              CyberLens
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-0.5 sm:gap-1">
            <Link
              href="/configuracoes"
              className="flex items-center gap-1.5 px-2 py-2 sm:px-3 rounded-md text-sm text-cyber-text-secondary hover:text-cyber-text hover:bg-white/5 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configurações</span>
            </Link>

            <Link
              href="/documentacao"
              className="flex items-center gap-1.5 px-2 py-2 sm:px-3 rounded-md text-sm text-cyber-text-secondary hover:text-cyber-text hover:bg-white/5 transition-colors"
              aria-label="Documentação"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Docs</span>
            </Link>

            <a
              href="https://github.com/eoLucasS/CyberLens"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2 py-2 sm:px-3 rounded-md text-sm text-cyber-text-secondary hover:text-cyber-text hover:bg-white/5 transition-colors"
              aria-label="Ver código no GitHub"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
