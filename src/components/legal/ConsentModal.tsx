'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Eye, Database, ExternalLink } from 'lucide-react';
import { useLocalStorage } from '@/hooks';
import { STORAGE_KEYS } from '@/lib/utils/storage';

const EXEMPT_ROUTES = ['/privacidade', '/termos', '/sobre', '/documentacao'];
const EXEMPT_PREFIXES = ['/demo'];

interface ConsentRecord {
  accepted: boolean;
  acceptedAt: string;
}

const NO_CONSENT: ConsentRecord = { accepted: false, acceptedAt: '' };

function Pillar({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#00ffd5]/10 text-[#00ffd5]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-[#e4e4e7] leading-tight">{title}</p>
        <p className="text-[11px] text-[#9ca3af] mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function ConsentModal() {
  const [consent, setConsent] = useLocalStorage<ConsentRecord>(
    STORAGE_KEYS.CONSENT,
    NO_CONSENT,
  );

  const [hydrated, setHydrated] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  const pathname = usePathname();
  const isExemptRoute =
    EXEMPT_ROUTES.includes(pathname) ||
    EXEMPT_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const isOpen = hydrated && !consent.accepted && !isExemptRoute;

  // Lock ALL scrolling when modal is open (works on iOS Safari too)
  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;

    // Fix the body in place
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  function handleAccept() {
    if (!checked) return;
    setConsent({ accepted: true, acceptedAt: new Date().toISOString() });
  }

  if (!hydrated || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm touch-none">
      <div
        className="relative w-full max-h-[90vh] overflow-y-auto overscroll-contain sm:max-w-[420px] rounded-t-2xl sm:rounded-2xl border-t sm:border border-white/[0.08] bg-[#0f0f1a] shadow-2xl touch-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Consentimento de privacidade e termos de uso"
      >
        {/* Top accent */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-[#00ffd5] to-transparent" />

        {/* Mobile handle */}
        <div className="flex justify-center pt-2 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-white/10" />
        </div>

        <div className="px-5 pb-5 pt-3 sm:p-6">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-5">
            <div className="inline-flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-[#00ffd5]/10 border border-[#00ffd5]/20 mb-3">
              <Shield size={18} className="text-[#00ffd5]" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Privacidade e Termos
            </h2>
            <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
              Veja como o CyberLens protege seus dados.
            </p>
          </div>

          {/* Pillars */}
          <div className="space-y-3 mb-4">
            <Pillar
              icon={<Lock size={14} />}
              title="Dados ficam no navegador"
              desc="API key e configurações armazenados apenas no localStorage. Sem servidores."
            />
            <Pillar
              icon={<Eye size={14} />}
              title="Transparência"
              desc="Currículo enviado apenas ao provedor de IA que você escolher, com sua própria API key."
            />
            <Pillar
              icon={<Database size={14} />}
              title="Zero rastreamento"
              desc="Sem cookies, sem analytics, sem coleta de dados pessoais."
            />
          </div>

          {/* Cost */}
          <div className="rounded-lg bg-[#ffd32a]/[0.05] border border-[#ffd32a]/10 px-3 py-2 mb-4">
            <p className="text-[11px] text-[#ffd32a]/80 leading-relaxed">
              Cada análise consome créditos do seu provedor de IA. O CyberLens não se responsabiliza por custos da API.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <Link
              href="/privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-[#00ffd5] hover:underline"
            >
              Política de Privacidade
              <ExternalLink size={9} />
            </Link>
            <span className="text-[#2e2e3e]">|</span>
            <Link
              href="/termos"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-[#00ffd5] hover:underline"
            >
              Termos de Uso
              <ExternalLink size={9} />
            </Link>
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer group mb-4">
            <div className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="peer sr-only"
              />
              <div className={`h-[18px] w-[18px] rounded border-2 transition-all flex items-center justify-center ${
                checked
                  ? 'bg-[#00ffd5] border-[#00ffd5]'
                  : 'border-[#3a3a4a] group-hover:border-[#5a5a6a]'
              }`}>
                {checked && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-[12px] sm:text-[13px] text-[#9ca3af] group-hover:text-[#e4e4e7] transition-colors leading-relaxed">
              Li e concordo com a{' '}
              <Link href="/privacidade" target="_blank" rel="noopener noreferrer" className="text-[#00ffd5] hover:underline">
                Política de Privacidade
              </Link>{' '}
              e os{' '}
              <Link href="/termos" target="_blank" rel="noopener noreferrer" className="text-[#00ffd5] hover:underline">
                Termos de Uso
              </Link>.
            </span>
          </label>

          {/* CTA */}
          <button
            type="button"
            onClick={handleAccept}
            disabled={!checked}
            className={`w-full rounded-xl py-2.5 sm:py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ffd5]/40 ${
              checked
                ? 'bg-[#00ffd5] text-[#0a0a0f] hover:bg-[#00e6c0] active:scale-[0.99] cursor-pointer'
                : 'bg-[#1e1e2e] text-[#5a5a6a] cursor-not-allowed'
            }`}
          >
            Continuar
          </button>

          <p className="text-center text-[9px] text-[#5a5a6a] mt-3 tracking-wide uppercase">
            Em conformidade com a LGPD (Lei 13.709/2018)
          </p>
        </div>
      </div>
    </div>
  );
}
