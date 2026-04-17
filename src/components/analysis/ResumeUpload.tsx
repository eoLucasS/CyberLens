'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  FileUp,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ScanSearch,
  AlertCircle,
  FileText,
  Clock,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { validatePdfFile } from '@/lib/utils';
import { extractTextFromPdf, extractTextWithOcr } from '@/lib/pdf/parse';
import type { PdfExtractionResult } from '@/lib/pdf/parse';
import {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  isValidCachedResume,
  type CachedResume,
} from '@/lib/utils/storage';
import { normalizeExtractedText } from '@/lib/pdf/normalize';

interface ResumeUploadProps {
  onFileAccepted: (file: File | null, text: string) => void;
  isComplete: boolean;
  /** When true, the dropzone is visually muted and interaction is blocked. */
  disabled?: boolean;
}

type UploadState =
  | 'idle'
  | 'processing'
  | 'complete'
  | 'error'
  | 'ocr-prompt'
  | 'ocr-processing';

/** Hard cap on text the user can submit (either via extraction or manual edit). */
const MAX_TEXT_LENGTH = 50_000;

/** Minimum extracted text length that is considered "analyzable". */
const MIN_TEXT_LENGTH = 100;

/** OCR confidence thresholds used to show quality warnings. */
const OCR_CONFIDENCE_GOOD = 80;
const OCR_CONFIDENCE_FAIR = 60;

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatCachedDate(iso: string): string {
  try {
    const date = new Date(iso);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month} às ${hours}:${minutes}`;
  } catch {
    return 'data desconhecida';
  }
}

export function ResumeUpload({ onFileAccepted, isComplete, disabled = false }: ResumeUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>(
    isComplete ? 'complete' : 'idle',
  );
  const [acceptedFile, setAcceptedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isTextOpen, setIsTextOpen] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<string>('');

  // OCR confidence: 0-100, only set when text came from OCR
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);

  // Manual edit flow
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState<string>('');

  // Cached resume detection (runs only on client after mount)
  const [hydrated, setHydrated] = useState(false);
  const [cachedResume, setCachedResume] = useState<CachedResume | null>(null);
  const [usingCache, setUsingCache] = useState(false);

  useEffect(() => {
    setHydrated(true);
    if (!isComplete) {
      // Validate the cache entry before trusting it. Defends against tampered localStorage.
      const cached = getStorageItem<unknown>(STORAGE_KEYS.RESUME_CACHE, null);
      if (isValidCachedResume(cached)) {
        setCachedResume(cached);
      } else if (cached !== null) {
        // Corrupted entry, remove to prevent repeated load attempts.
        removeStorageItem(STORAGE_KEYS.RESUME_CACHE);
      }
    }
  }, [isComplete]);

  const handleUseCached = useCallback(() => {
    if (!cachedResume) return;
    setExtractedText(cachedResume.text);
    setUploadState('complete');
    setUsingCache(true);
    setOcrConfidence(null);
    onFileAccepted(null, cachedResume.text);
  }, [cachedResume, onFileAccepted]);

  const handleDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      setErrorMessage('');

      const validation = validatePdfFile(file);
      if (!validation.valid) {
        setErrorMessage(validation.error ?? 'Arquivo inválido.');
        setUploadState('error');
        return;
      }

      setAcceptedFile(file);
      setUploadState('processing');
      setOcrConfidence(null);

      try {
        const result: PdfExtractionResult = await extractTextFromPdf(file);

        if (result.isImageBased) {
          // PDF appears to be image-based, offer OCR.
          setExtractedText(result.text);
          setUploadState('ocr-prompt');
          return;
        }

        setExtractedText(result.text);
        setUploadState('complete');
        setUsingCache(false);

        // Persist to localStorage for next session. Text is already normalized
        // and the validator enforces size bounds on read.
        const cacheEntry: CachedResume = {
          fileName: file.name,
          fileSize: file.size,
          text: result.text,
          savedAt: new Date().toISOString(),
          isOcr: false,
        };
        setStorageItem(STORAGE_KEYS.RESUME_CACHE, cacheEntry);
        setCachedResume(cacheEntry);

        onFileAccepted(file, result.text);
      } catch {
        setErrorMessage(
          'Não foi possível extrair o texto do PDF. Verifique se o arquivo não está protegido por senha.',
        );
        setUploadState('error');
      }
    },
    [onFileAccepted],
  );

  const handleOcr = useCallback(async () => {
    if (!acceptedFile) return;

    setUploadState('ocr-processing');
    setOcrProgress('Iniciando OCR...');

    try {
      const result = await extractTextWithOcr(acceptedFile, (page, total) => {
        setOcrProgress(`Processando página ${page} de ${total}...`);
      });

      if (result.text.trim().length < 30) {
        setErrorMessage(
          'O OCR não conseguiu extrair texto suficiente. O PDF pode estar com qualidade muito baixa ou conter apenas elementos gráficos.',
        );
        setUploadState('error');
        return;
      }

      setExtractedText(result.text);
      setOcrConfidence(result.averageConfidence);
      setUploadState('complete');
      setUsingCache(false);

      const cacheEntry: CachedResume = {
        fileName: acceptedFile.name,
        fileSize: acceptedFile.size,
        text: result.text,
        savedAt: new Date().toISOString(),
        isOcr: true,
      };
      setStorageItem(STORAGE_KEYS.RESUME_CACHE, cacheEntry);
      setCachedResume(cacheEntry);

      onFileAccepted(acceptedFile, result.text);
    } catch {
      setErrorMessage(
        'Erro durante o OCR. Tente novamente ou use um PDF com texto selecionável.',
      );
      setUploadState('error');
    }
  }, [acceptedFile, onFileAccepted]);

  const handleSkipOcr = useCallback(() => {
    setUploadState('idle');
    setAcceptedFile(null);
    setExtractedText('');
    setOcrConfidence(null);
  }, []);

  const handleClearCachedAndUpload = useCallback(() => {
    removeStorageItem(STORAGE_KEYS.RESUME_CACHE);
    setCachedResume(null);
    setExtractedText('');
    setAcceptedFile(null);
    setUploadState('idle');
    setUsingCache(false);
    setOcrConfidence(null);
    setIsEditing(false);
    setEditedText('');
  }, []);

  // ── Manual edit flow ─────────────────────────────────────────────────────

  const handleStartEdit = useCallback(() => {
    setEditedText(extractedText);
    setIsEditing(true);
    setIsTextOpen(true);
  }, [extractedText]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditedText('');
  }, []);

  const handleEditChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Hard cap defense. The maxLength attribute also enforces in the UI,
    // but a paste action can exceed it in some edge cases.
    if (value.length > MAX_TEXT_LENGTH) {
      setEditedText(value.slice(0, MAX_TEXT_LENGTH));
    } else {
      setEditedText(value);
    }
  }, []);

  const handleSaveEdit = useCallback(() => {
    const cleaned = normalizeExtractedText(editedText);

    if (cleaned.length < MIN_TEXT_LENGTH) {
      setErrorMessage(
        `O texto precisa ter pelo menos ${MIN_TEXT_LENGTH} caracteres para ser analisado.`,
      );
      return;
    }
    if (cleaned.length > MAX_TEXT_LENGTH) {
      setErrorMessage(
        `O texto excede o limite de ${MAX_TEXT_LENGTH.toLocaleString('pt-BR')} caracteres.`,
      );
      return;
    }

    setErrorMessage('');
    setExtractedText(cleaned);
    setIsEditing(false);

    // Update cache with the corrected text.
    if (cachedResume) {
      const updated: CachedResume = {
        ...cachedResume,
        text: cleaned,
        savedAt: new Date().toISOString(),
      };
      setStorageItem(STORAGE_KEYS.RESUME_CACHE, updated);
      setCachedResume(updated);
    }

    onFileAccepted(acceptedFile, cleaned);
  }, [editedText, cachedResume, acceptedFile, onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled: disabled || uploadState === 'processing' || uploadState === 'ocr-processing',
  });

  const showCachedUI =
    hydrated &&
    cachedResume !== null &&
    !disabled &&
    uploadState === 'idle' &&
    !usingCache;

  // ── Renderers ────────────────────────────────────────────────────────────

  const renderDropzoneContent = () => {
    if (uploadState === 'processing') {
      return (
        <div className="flex flex-col items-center gap-3 py-2">
          <Spinner size="lg" />
          <p className="text-sm text-[#9ca3af]">Extraindo texto do PDF...</p>
        </div>
      );
    }

    if (uploadState === 'ocr-processing') {
      return (
        <div className="flex flex-col items-center gap-3 py-4">
          <Spinner size="lg" />
          <div className="text-center">
            <p className="text-sm font-medium text-[#00ffd5]">OCR em andamento</p>
            <p className="mt-1 text-xs text-[#9ca3af]">{ocrProgress}</p>
            <p className="mt-2 text-xs text-[#8b8fa3]">
              Isso pode levar alguns segundos por página. Seus dados permanecem no navegador.
            </p>
          </div>
        </div>
      );
    }

    if (uploadState === 'complete') {
      const displayName = acceptedFile?.name ?? cachedResume?.fileName ?? 'Currículo salvo';
      const displaySize = acceptedFile?.size ?? cachedResume?.fileSize ?? 0;

      return (
        <div className="flex flex-col gap-4 w-full text-left">
          <div className="flex items-center gap-3">
            <CheckCircle className="shrink-0 text-[#00ff88]" size={22} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#e4e4e7] truncate">{displayName}</p>
              <p className="text-xs text-[#9ca3af]">
                {displaySize > 0 ? formatFileSize(displaySize) : 'Currículo em cache'}
                {usingCache && ' · restaurado do seu navegador'}
              </p>
            </div>
          </div>

          {/* OCR confidence notice */}
          {ocrConfidence !== null && ocrConfidence < OCR_CONFIDENCE_GOOD && (
            <div
              className={`rounded-lg border px-3 py-2 ${
                ocrConfidence < OCR_CONFIDENCE_FAIR
                  ? 'border-[#ff4757]/20 bg-[#ff4757]/5'
                  : 'border-[#ffd32a]/20 bg-[#ffd32a]/5'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <p
                className={`text-xs leading-relaxed ${
                  ocrConfidence < OCR_CONFIDENCE_FAIR ? 'text-[#ff4757]/90' : 'text-[#ffd32a]/90'
                }`}
              >
                Qualidade do OCR: <strong>{ocrConfidence}%</strong>.{' '}
                {ocrConfidence < OCR_CONFIDENCE_FAIR
                  ? 'Recomendamos revisar o texto extraído antes de analisar, ou usar um PDF com texto selecionável.'
                  : 'O texto pode conter pequenos erros. Revise se algo importante não aparece como esperado.'}
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTextOpen((prev) => !prev);
                }}
                className="flex items-center gap-1.5 text-xs text-[#00ffd5] hover:text-[#00ffd5]/80 transition-colors"
              >
                {isTextOpen ? (
                  <>
                    <ChevronUp size={14} />
                    Ocultar texto extraído
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    Ver texto extraído
                  </>
                )}
              </button>

              {!isEditing && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEdit();
                  }}
                  className="flex items-center gap-1.5 text-xs text-[#9ca3af] hover:text-[#e4e4e7] transition-colors"
                >
                  <Pencil size={12} />
                  Corrigir texto extraído
                </button>
              )}
            </div>

            {isTextOpen && !isEditing && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-[#0d1117] border border-white/10 p-3"
              >
                <pre className="font-mono text-xs text-[#9ca3af] whitespace-pre-wrap break-words leading-relaxed">
                  {extractedText || '(Nenhum texto encontrado no PDF)'}
                </pre>
              </div>
            )}

            {isEditing && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-3 rounded-lg border border-[#00ffd5]/20 bg-[#0d0d18] p-3"
              >
                <p className="mb-2 text-[11px] text-[#9ca3af] leading-relaxed">
                  Edite para <strong className="text-[#e4e4e7]">corrigir erros de extração</strong>{' '}
                  (palavras quebradas, acentos trocados, linhas embaralhadas). Não invente
                  experiências que não existem no currículo.
                </p>
                <textarea
                  value={editedText}
                  onChange={handleEditChange}
                  maxLength={MAX_TEXT_LENGTH}
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full min-h-[240px] resize-y rounded-md bg-[#0a0a0f] border border-white/10 px-3 py-2 font-mono text-xs text-[#e4e4e7] leading-relaxed focus:outline-none focus:border-[#00ffd5]/40"
                  aria-label="Editar texto extraído do currículo"
                />
                <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
                  <p className="text-[11px] text-[#6b7280]">
                    {editedText.length.toLocaleString('pt-BR')} / {MAX_TEXT_LENGTH.toLocaleString('pt-BR')}{' '}
                    caracteres
                    {editedText.trim().length < MIN_TEXT_LENGTH && (
                      <span className="text-[#ffd32a] ml-2">
                        Mínimo: {MIN_TEXT_LENGTH}
                      </span>
                    )}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      <X size={14} />
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={editedText.trim().length < MIN_TEXT_LENGTH}
                    >
                      <Save size={14} />
                      Salvar alterações
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-3 py-2">
        <div
          className={[
            'rounded-full p-3 transition-colors duration-200',
            isDragActive ? 'bg-[#00ffd5]/20 text-[#00ffd5]' : 'bg-white/5 text-[#9ca3af]',
          ].join(' ')}
        >
          <FileUp size={28} />
        </div>
        <div className="text-center">
          <p
            className={[
              'text-sm font-medium transition-colors duration-200',
              isDragActive ? 'text-[#00ffd5]' : 'text-[#e4e4e7]',
            ].join(' ')}
          >
            {isDragActive
              ? 'Solte o arquivo aqui'
              : 'Arraste seu currículo em PDF ou clique para selecionar'}
          </p>
          <p className="mt-1 text-xs text-[#9ca3af]">Somente PDF, máximo 10 MB</p>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#00ffd5]">
        Passo 1: Currículo
      </p>

      {/* Cached resume restoration banner */}
      {showCachedUI && cachedResume && (
        <div className="mb-4 rounded-xl border border-[#00ffd5]/20 bg-[#00ffd5]/[0.04] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00ffd5]/10 text-[#00ffd5]">
              <FileText size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#e4e4e7]">
                Currículo detectado no seu navegador
              </p>
              <p className="mt-1 text-xs text-[#9ca3af] break-words">
                <span className="font-medium text-[#e4e4e7]">{cachedResume.fileName}</span>{' '}
                ({formatFileSize(cachedResume.fileSize)})
              </p>
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#8b8fa3]">
                <Clock size={11} />
                Salvo em {formatCachedDate(cachedResume.savedAt)}
                {cachedResume.isOcr && ' · via OCR'}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="primary" size="sm" onClick={handleUseCached}>
                  Usar este currículo
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClearCachedAndUpload}>
                  Enviar outro
                </Button>
              </div>
              <p className="mt-3 text-[11px] text-[#6b7280] leading-relaxed">
                O currículo fica salvo apenas no localStorage do seu navegador. Você pode
                removê-lo a qualquer momento em Configurações.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* OCR prompt banner */}
      {uploadState === 'ocr-prompt' && acceptedFile && (
        <div
          className="mb-4 rounded-xl border border-[#ffd32a]/20 bg-[#ffd32a]/5 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 text-[#ffd32a] mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#e4e4e7]">
                PDF baseado em imagem detectado
              </p>
              <p className="mt-1 text-xs text-[#9ca3af] leading-relaxed">
                O arquivo <strong className="text-[#e4e4e7]">{acceptedFile.name}</strong> parece
                ser um PDF escaneado ou gerado a partir de imagens. O texto não pode ser extraído
                diretamente.
              </p>
              <p className="mt-2 text-xs text-[#9ca3af] leading-relaxed">
                Podemos tentar ler o texto usando{' '}
                <strong className="text-[#e4e4e7]">
                  OCR (reconhecimento óptico de caracteres)
                </strong>
                . O processamento acontece inteiramente no seu navegador, nenhum dado é enviado a
                servidores externos.
              </p>
              <p className="mt-2 text-xs text-[#ffd32a]/80">
                O OCR pode não ser 100% preciso, especialmente em documentos com baixa qualidade
                de imagem, layouts complexos ou fontes incomuns. Você poderá revisar e corrigir o
                texto antes de analisar.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="primary" size="sm" onClick={handleOcr}>
                  <ScanSearch size={14} />
                  Tentar OCR
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSkipOcr}>
                  Enviar outro arquivo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dropzone (hidden while cached UI or OCR prompt is active) */}
      {uploadState !== 'ocr-prompt' && !showCachedUI && (
        <div
          {...getRootProps()}
          className={[
            'flex flex-col items-center justify-center rounded-xl border-2 border-dashed',
            'p-4 sm:p-6 text-center',
            'transition-all duration-200',
            disabled
              ? 'border-white/5 bg-white/[0.02] cursor-not-allowed opacity-40 pointer-events-none'
              : isDragActive
                ? 'border-[#00ffd5] bg-[#00ffd5]/5 cursor-pointer'
                : uploadState === 'complete'
                  ? 'border-[#00ff88]/40 bg-[#00ff88]/5 cursor-default'
                  : uploadState === 'error'
                    ? 'border-[#ff4757]/40 bg-[#ff4757]/5 hover:border-[#ff4757]/60 cursor-pointer'
                    : 'border-white/10 hover:border-[#00ffd5]/40 hover:bg-[#00ffd5]/5 cursor-pointer',
          ].join(' ')}
        >
          <input {...getInputProps()} aria-label="Upload de currículo PDF" />
          {renderDropzoneContent()}
        </div>
      )}

      {errorMessage && (
        <p className="mt-3 text-xs text-[#ff4757]" role="alert">
          {errorMessage}
        </p>
      )}

      {uploadState === 'complete' && !usingCache && !isEditing && (
        <p className="mt-2 text-xs text-[#9ca3af]">
          Clique na área acima para enviar um arquivo diferente.
        </p>
      )}

      {uploadState === 'complete' && usingCache && !isEditing && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="text-xs text-[#9ca3af]">Currículo restaurado do cache local.</p>
          <button
            type="button"
            onClick={handleClearCachedAndUpload}
            className="text-xs text-[#00ffd5] hover:text-[#00ffd5]/80 underline underline-offset-2"
          >
            Enviar outro
          </button>
        </div>
      )}
    </Card>
  );
}
