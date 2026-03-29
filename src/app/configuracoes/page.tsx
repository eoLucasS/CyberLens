'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SettingsForm } from '@/components/settings';

export default function ConfiguracoesPage() {
  return (
    <div className="py-8 px-4 sm:py-12">
      <div className="mx-auto max-w-[640px]">
        {/* Back link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#9ca3af] hover:text-[#e4e4e7] transition-colors"
        >
          <ArrowLeft size={14} />
          Voltar para análise
        </Link>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white tracking-tight">Configurações</h1>
        <p className="mt-1.5 text-[15px] text-[#9ca3af] leading-relaxed">
          Escolha seu provedor de IA e configure a chave de acesso.
        </p>

        <div className="mt-8">
          <SettingsForm />
        </div>
      </div>
    </div>
  );
}
