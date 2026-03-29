'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, CheckCircle, ChevronDown, ChevronUp, ScanSearch, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { validatePdfFile } from '@/lib/utils';
import { extractTextFromPdf, extractTextWithOcr } from '@/lib/pdf/parse';
import type { PdfExtractionResult } from '@/lib/pdf/parse';

interface ResumeUploadProps {
  onFileAccepted: (file: File, text: string) => void;
  isComplete: boolean;
  /** When true, the dropzone is visually muted and interaction is blocked. */
  disabled?: boolean;
}

type UploadState = 'idle' | 'processing' | 'complete' | 'error' | 'ocr-prompt' | 'ocr-processing';

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

      try {
        const result: PdfExtractionResult = await extractTextFromPdf(file);

        if (result.isImageBased) {
          // PDF appears to be image-based, offer OCR
          setExtractedText(result.text);
          setUploadState('ocr-prompt');
          return;
        }

        setExtractedText(result.text);
        setUploadState('complete');
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
      const text = await extractTextWithOcr(acceptedFile, (page, total) => {
        setOcrProgress(`Processando página ${page} de ${total}...`);
      });

      if (text.trim().length < 30) {
        setErrorMessage(
          'O OCR não conseguiu extrair texto suficiente. O PDF pode estar com qualidade muito baixa ou conter apenas elementos gráficos.',
        );
        setUploadState('error');
        return;
      }

      setExtractedText(text);
      setUploadState('complete');
      onFileAccepted(acceptedFile, text);
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
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled: disabled || uploadState === 'processing' || uploadState === 'ocr-processing',
  });

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

    if (uploadState === 'complete' && acceptedFile) {
      return (
        <div className="flex flex-col gap-4 w-full text-left">
          <div className="flex items-center gap-3">
            <CheckCircle className="shrink-0 text-[#00ff88]" size={22} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#e4e4e7] truncate">
                {acceptedFile.name}
              </p>
              <p className="text-xs text-[#9ca3af]">
                {formatFileSize(acceptedFile.size)}
              </p>
            </div>
          </div>

          <div>
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

            {isTextOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-[#0d1117] border border-white/10 p-3"
              >
                <pre className="font-mono text-xs text-[#9ca3af] whitespace-pre-wrap break-words leading-relaxed">
                  {extractedText || '(Nenhum texto encontrado no PDF)'}
                </pre>
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
            isDragActive
              ? 'bg-[#00ffd5]/20 text-[#00ffd5]'
              : 'bg-white/5 text-[#9ca3af]',
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
          <p className="mt-1 text-xs text-[#9ca3af]">
            Somente PDF, máximo 10 MB
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#00ffd5]">
        Passo 1: Currículo
      </p>

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
                Podemos tentar ler o texto usando <strong className="text-[#e4e4e7]">OCR
                (reconhecimento óptico de caracteres)</strong>. O processamento acontece
                inteiramente no seu navegador, nenhum dado é enviado a servidores externos.
              </p>
              <p className="mt-2 text-xs text-[#ffd32a]/80">
                O OCR pode não ser 100% preciso, especialmente em documentos com baixa qualidade
                de imagem, layouts complexos ou fontes incomuns. Recomendamos revisar o texto
                extraído antes de iniciar a análise.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOcr}
                >
                  <ScanSearch size={14} />
                  Tentar OCR
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkipOcr}
                >
                  Enviar outro arquivo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dropzone */}
      {uploadState !== 'ocr-prompt' && (
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

      {uploadState === 'complete' && (
        <p className="mt-2 text-xs text-[#9ca3af]">
          Clique na área acima para enviar um arquivo diferente.
        </p>
      )}
    </Card>
  );
}
