'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  X,
  ExternalLink,
  Loader2,
  Radio,
  ShieldCheck,
  AlertCircle,
  History,
  ArrowRight,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks';
import { AI_PROVIDERS, DEFAULT_PROVIDER, DEFAULT_MODEL } from '@/constants/providers';
import { validateApiKey } from '@/lib/utils/validators';
import { STORAGE_KEYS, clearAllData } from '@/lib/utils/storage';
import { testConnection } from '@/lib/ai';
import { getHistory, clearHistory } from '@/lib/history/store';
import type { UserSettings, AIProviderName, AIProviderConfig } from '@/types';

const DEFAULT_SETTINGS: UserSettings = {
  provider: DEFAULT_PROVIDER.name,
  model: DEFAULT_MODEL,
  apiKey: '',
  hasAcceptedTerms: false,
  saveHistory: false,
};

type TestStatus = 'idle' | 'success' | 'error';

interface ToastState {
  visible: boolean;
  message: string;
  variant: 'success' | 'error';
}

// ─── Small button ─────────────────────────────────────────────────────────────

function Btn({
  children,
  onClick,
  variant = 'secondary',
  disabled,
  loading,
  className = '',
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-2 text-[13px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ffd5]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] disabled:opacity-40 disabled:pointer-events-none';

  const styles: Record<string, string> = {
    primary: 'bg-[#00ffd5] text-[#0a0a0f] hover:bg-[#00e6c0] active:scale-[0.98]',
    secondary: 'bg-[#1e1e2e] text-[#e4e4e7] border border-[#2e2e3e] hover:bg-[#262638] hover:border-[#3e3e4e] active:scale-[0.98]',
    danger: 'bg-[#1e1e2e] text-[#ff6b7a] border border-[#ff4757]/20 hover:bg-[#ff4757]/10 hover:border-[#ff4757]/30 active:scale-[0.98]',
    ghost: 'text-[#9ca3af] hover:text-[#e4e4e7] hover:bg-white/5',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function SettingsCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl bg-[#141420] border border-[#1e1e30] p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

// ─── Model selector (visual cards) ───────────────────────────────────────────

function ModelCard({
  model,
  selected,
  onSelect,
}: {
  model: { id: string; name: string; description: string };
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-150 w-full ${
        selected
          ? 'border-[#00ffd5]/40 bg-[#00ffd5]/[0.04]'
          : 'border-[#1e1e30] bg-[#0d0d18] hover:border-[#2e2e3e] hover:bg-[#12121e]'
      }`}
    >
      {/* Radio indicator */}
      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          selected ? 'border-[#00ffd5] bg-[#00ffd5]' : 'border-[#3a3a4a] group-hover:border-[#5a5a6a]'
        }`}
      >
        {selected && (
          <div className="h-1.5 w-1.5 rounded-full bg-[#0a0a0f]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${selected ? 'text-white' : 'text-[#e4e4e7]'}`}>
          {model.name}
        </p>
        <p className="text-xs text-[#8b8fa3] mt-0.5 leading-relaxed">
          {model.description}
        </p>
      </div>
    </button>
  );
}

// ─── Provider selector (visual cards) ─────────────────────────────────────────

function ProviderCard({
  provider,
  selected,
  onSelect,
}: {
  provider: AIProviderConfig;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-150 w-full ${
        selected
          ? 'border-[#00ffd5]/40 bg-[#00ffd5]/[0.04]'
          : 'border-[#1e1e30] bg-[#0d0d18] hover:border-[#2e2e3e] hover:bg-[#12121e]'
      }`}
    >
      {/* Radio indicator */}
      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          selected ? 'border-[#00ffd5] bg-[#00ffd5]' : 'border-[#3a3a4a] group-hover:border-[#5a5a6a]'
        }`}
      >
        {selected && (
          <div className="h-1.5 w-1.5 rounded-full bg-[#0a0a0f]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${selected ? 'text-white' : 'text-[#e4e4e7]'}`}>
          {provider.label}
        </p>
        <p className="text-xs text-[#8b8fa3] mt-0.5">
          {provider.models.length} {provider.models.length === 1 ? 'modelo' : 'modelos'} disponíveis
        </p>
      </div>

      {provider.requiresProxy && (
        <span className="shrink-0 rounded-md bg-[#ffd32a]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#ffd32a] uppercase tracking-wider">
          Proxy
        </span>
      )}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SettingsForm() {
  const [settings, setSettings] = useLocalStorage<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  const [apiKeyInput, setApiKeyInput] = useState<string>(settings.apiKey);
  const [showKey, setShowKey] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', variant: 'success' });

  // History toggle state
  const [historyCount, setHistoryCount] = useState<number>(0);
  const [hydrated, setHydrated] = useState(false);
  const [askDeleteHistoryOnDisable, setAskDeleteHistoryOnDisable] = useState(false);

  // Refresh count after mount and whenever we mutate the list
  useEffect(() => {
    setHydrated(true);
    setHistoryCount(getHistory().length);
  }, []);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedProvider = AI_PROVIDERS.find((p) => p.name === settings.provider) ?? DEFAULT_PROVIDER;

  function showToast(message: string, variant: 'success' | 'error') {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ visible: true, message, variant });
    toastTimerRef.current = setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  }

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  function handleProviderChange(name: AIProviderName) {
    const p = AI_PROVIDERS.find((x) => x.name === name) ?? DEFAULT_PROVIDER;
    setSettings((prev) => ({ ...prev, provider: name, model: p.models[0]?.id ?? '' }));
    setTestStatus('idle');
    setTestMessage('');
    setKeyError('');
  }

  function handleSaveKey() {
    const v = validateApiKey(apiKeyInput, selectedProvider.label);
    if (!v.valid) { setKeyError(v.error ?? 'Chave inválida.'); return; }
    setKeyError('');
    setSettings((prev) => ({ ...prev, apiKey: apiKeyInput.trim() }));
    showToast('Chave de API salva com sucesso.', 'success');
  }

  async function handleTestConnection() {
    const key = apiKeyInput.trim();
    const v = validateApiKey(key, selectedProvider.label);
    if (!v.valid) { setKeyError(v.error ?? 'Chave inválida.'); setTestStatus('error'); setTestMessage('Corrija a chave antes de testar.'); return; }
    setKeyError('');
    setTestStatus('idle');
    setTestMessage('');
    setTestLoading(true);
    const res = await testConnection(settings.provider, settings.model, key);
    setTestLoading(false);
    setTestStatus(res.success ? 'success' : 'error');
    setTestMessage(res.message);
  }

  function handleRemoveKey() {
    setApiKeyInput('');
    setKeyError('');
    setTestStatus('idle');
    setTestMessage('');
    setSettings((prev) => ({ ...prev, apiKey: '' }));
    showToast('Chave removida.', 'success');
  }

  function handleClearData() {
    clearAllData();
    setSettings(DEFAULT_SETTINGS);
    setApiKeyInput('');
    setConfirmClear(false);
    setHistoryCount(0);
    showToast('Dados limpos.', 'success');
    setTimeout(() => window.location.reload(), 500);
  }

  function handleToggleSaveHistory(next: boolean) {
    // Enabling: persist the new preference immediately.
    if (next) {
      setSettings((prev) => ({ ...prev, saveHistory: true }));
      showToast('Histórico ativado.', 'success');
      return;
    }

    // Disabling while there are entries: ask the user if they want to delete.
    if (historyCount > 0) {
      setAskDeleteHistoryOnDisable(true);
      return;
    }

    // Disabling with empty history: just flip the flag.
    setSettings((prev) => ({ ...prev, saveHistory: false }));
    showToast('Histórico desativado.', 'success');
  }

  function handleConfirmDisableAndDelete() {
    clearHistory();
    setHistoryCount(0);
    setSettings((prev) => ({ ...prev, saveHistory: false }));
    setAskDeleteHistoryOnDisable(false);
    showToast('Histórico apagado e desativado.', 'success');
  }

  function handleConfirmDisableKeepEntries() {
    setSettings((prev) => ({ ...prev, saveHistory: false }));
    setAskDeleteHistoryOnDisable(false);
    showToast('Histórico desativado. Entradas anteriores mantidas.', 'success');
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── 1. Provider ────────────────────────────────────────────────────── */}
      <SettingsCard>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[15px] font-semibold text-white">Provedor de IA</h2>
            <p className="text-xs text-[#8b8fa3] mt-0.5">
              Selecione o serviço que processará suas análises.
            </p>
          </div>
          <Radio size={18} className="text-[#00ffd5] shrink-0" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {AI_PROVIDERS.map((p) => (
            <ProviderCard
              key={p.name}
              provider={p}
              selected={settings.provider === p.name}
              onSelect={() => handleProviderChange(p.name)}
            />
          ))}
        </div>
      </SettingsCard>

      {/* ── 2. Model ───────────────────────────────────────────────────────── */}
      <SettingsCard>
        <h2 className="text-[15px] font-semibold text-white mb-4">Modelo</h2>

        <div className="flex flex-col gap-2">
          {selectedProvider.models.map((m) => (
            <ModelCard
              key={m.id}
              model={m}
              selected={settings.model === m.id}
              onSelect={() => setSettings((prev) => ({ ...prev, model: m.id }))}
            />
          ))}
        </div>
      </SettingsCard>

      {/* ── 3. API Key ─────────────────────────────────────────────────────── */}
      <SettingsCard>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[15px] font-semibold text-white">Chave de API</h2>
            <p className="text-xs text-[#8b8fa3] mt-0.5">
              Sua chave fica apenas no navegador, nunca sai do seu dispositivo.
            </p>
          </div>
          <ShieldCheck size={18} className="text-[#00ff88] shrink-0" />
        </div>

        {/* Input */}
        <div className="relative mb-3">
          <input
            id="api-key"
            type={showKey ? 'text' : 'password'}
            value={apiKeyInput}
            onChange={(e) => {
              setApiKeyInput(e.target.value);
              if (keyError) setKeyError('');
              if (testStatus !== 'idle') { setTestStatus('idle'); setTestMessage(''); }
            }}
            placeholder={selectedProvider.apiKeyPlaceholder}
            autoComplete="off"
            spellCheck={false}
            className={`w-full rounded-xl bg-[#0d0d18] border px-4 py-2.5 pr-10 text-sm font-mono text-[#e4e4e7] placeholder:text-[#8b8fa3]/30 transition-colors focus:outline-none focus:ring-1 ${
              keyError
                ? 'border-[#ff4757]/40 focus:border-[#ff4757] focus:ring-[#ff4757]/15'
                : 'border-[#1e1e30] hover:border-[#2e2e3e] focus:border-[#00ffd5]/50 focus:ring-[#00ffd5]/15'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowKey((p) => !p)}
            aria-label={showKey ? 'Ocultar' : 'Mostrar'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b8fa3] hover:text-[#e4e4e7] transition-colors"
          >
            {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {keyError && (
          <div className="mb-3 flex items-center gap-2 text-xs text-[#ff4757]" role="alert">
            <AlertCircle size={13} className="shrink-0" />
            {keyError}
          </div>
        )}

        {/* Saved state */}
        {settings.apiKey && !keyError && (
          <div className="mb-3 flex items-center gap-2 text-xs text-[#00ff88]">
            <CheckCircle size={13} className="shrink-0" />
            Chave ativa: <span className="font-mono font-semibold">...{settings.apiKey.slice(-4)}</span>
          </div>
        )}

        {/* Test result */}
        {testStatus !== 'idle' && (
          <div
            className={`mb-4 flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed ${
              testStatus === 'success'
                ? 'bg-[#00ff88]/[0.03] border-[#00ff88]/15 text-[#00ff88]'
                : 'bg-[#ff4757]/[0.03] border-[#ff4757]/15 text-[#ff4757]'
            }`}
          >
            {testStatus === 'success' ? <CheckCircle size={14} className="mt-px shrink-0" /> : <XCircle size={14} className="mt-px shrink-0" />}
            {testMessage}
          </div>
        )}

        {/* Button row */}
        <div className="flex flex-wrap gap-2">
          <Btn variant="primary" onClick={handleSaveKey}>Salvar</Btn>
          <Btn variant="secondary" onClick={handleTestConnection} loading={testLoading}>Testar Conexão</Btn>
          <Btn variant="danger" onClick={handleRemoveKey} disabled={!settings.apiKey && !apiKeyInput}>Remover</Btn>
        </div>

        {/* Get key link */}
        <a
          href={selectedProvider.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#9ca3af] hover:text-[#00ffd5] transition-colors"
        >
          Não tem uma chave? Obtenha em {selectedProvider.label}
          <ExternalLink size={11} />
        </a>
      </SettingsCard>

      {/* ── 4. Info banner ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#1e1e30] bg-[#141420] px-5 py-4">
        <p className="text-xs text-[#8b8fa3] leading-relaxed">
          <span className="text-[#ffd32a] font-medium">Sobre custos</span>: cada análise consome
          créditos no provedor de IA. Consulte a tabela de preços do provedor. O CyberLens é apenas
          uma interface; sua chave é enviada diretamente ao provedor, sem intermediários.
        </p>
      </div>

      {/* ── 5. History (opt-in) ────────────────────────────────────────────── */}
      <SettingsCard>
        <div className="flex items-start justify-between gap-4 mb-1">
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-semibold text-white flex items-center gap-2">
              <History size={16} className="text-[#00ffd5] shrink-0" />
              Histórico de análises
            </h2>
            <p className="text-xs text-[#8b8fa3] mt-1 leading-relaxed">
              Quando ativado, suas análises são salvas localmente no seu navegador (até 10,
              FIFO). Nenhum dado é enviado a servidores. Você pode desativar ou apagar o
              histórico a qualquer momento.
            </p>
          </div>

          {/* Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={settings.saveHistory === true}
            aria-label={settings.saveHistory === true ? 'Desativar histórico' : 'Ativar histórico'}
            onClick={() => handleToggleSaveHistory(!settings.saveHistory)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ffd5]/40 ${
              settings.saveHistory === true ? 'bg-[#00ffd5]/80' : 'bg-[#2a2a3a]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.saveHistory === true ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {hydrated && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-[#6b7280]">
              {historyCount === 0
                ? 'Nenhuma análise salva no momento.'
                : `${historyCount} ${historyCount === 1 ? 'análise salva' : 'análises salvas'} no seu navegador.`}
            </p>
            {historyCount > 0 && (
              <Link
                href="/historico"
                className="inline-flex items-center gap-1 text-[11px] text-[#00ffd5] hover:text-[#00ffd5]/80 transition-colors"
              >
                Ver histórico
                <ArrowRight size={10} />
              </Link>
            )}
          </div>
        )}

        {/* Inline prompt when user disables with entries present */}
        {askDeleteHistoryOnDisable && (
          <div className="mt-4 rounded-xl border border-[#ffd32a]/20 bg-[#ffd32a]/5 px-4 py-3">
            <p className="text-xs text-[#ffd32a]/90 leading-relaxed mb-3">
              Você tem {historyCount} {historyCount === 1 ? 'análise salva' : 'análises salvas'}.
              Deseja apagar essas entradas ao desativar?
            </p>
            <div className="flex flex-wrap gap-2">
              <Btn variant="danger" onClick={handleConfirmDisableAndDelete}>
                Apagar e desativar
              </Btn>
              <Btn variant="secondary" onClick={handleConfirmDisableKeepEntries}>
                Manter e desativar
              </Btn>
              <Btn variant="ghost" onClick={() => setAskDeleteHistoryOnDisable(false)}>
                Cancelar
              </Btn>
            </div>
          </div>
        )}
      </SettingsCard>

      {/* ── 6. Danger zone ─────────────────────────────────────────────────── */}
      <SettingsCard className="!border-[#ff4757]/10">
        <h2 className="text-[15px] font-semibold text-white mb-1">Zona de perigo</h2>
        <p className="text-xs text-[#8b8fa3] mb-4">
          Apaga tudo: configurações, chave de API e aceite dos termos.
        </p>

        {!confirmClear ? (
          <Btn variant="danger" onClick={() => setConfirmClear(true)}>Limpar todos os dados</Btn>
        ) : (
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-[#ff4757]/[0.04] border border-[#ff4757]/15 px-4 py-3">
            <p className="flex-1 text-sm text-[#ff6b7a]">Tem certeza?</p>
            <Btn variant="danger" onClick={handleClearData}>Sim, limpar</Btn>
            <Btn variant="ghost" onClick={() => setConfirmClear(false)}>Não</Btn>
          </div>
        )}
      </SettingsCard>

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-5 left-4 right-4 sm:left-auto sm:right-5 z-50 flex items-center gap-2.5 rounded-xl border border-[#1e1e30] bg-[#141420] px-4 py-3 text-[13px] font-medium shadow-xl shadow-black/40 transition-all duration-200 ${
          toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        {toast.variant === 'success' ? (
          <CheckCircle size={15} className="text-[#00ff88] shrink-0" />
        ) : (
          <XCircle size={15} className="text-[#ff4757] shrink-0" />
        )}
        <span className="text-[#e4e4e7]">{toast.message}</span>
        <button
          type="button"
          onClick={() => setToast((p) => ({ ...p, visible: false }))}
          className="ml-1 text-[#8b8fa3] hover:text-[#e4e4e7] transition-colors"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
