'use client';

import { useState, useCallback } from 'react';
import { Pencil } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { validateJobDescription } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_CHARS = 100;
const MAX_CHARS = 10_000;

// Placeholder shows a realistic job description snippet in pt-BR.
// The tool works for any professional area - not just cybersecurity.
const PLACEHOLDER = `Analista de Dados Pleno
• Experiência com Python, SQL e ferramentas de visualização (Power BI, Tableau)
• Conhecimento em modelagem de dados, ETL e cloud (AWS, GCP ou Azure)
• Desejável: certificações em engenharia de dados ou experiência com dbt e Spark

Cole aqui a descrição da vaga para qualquer área: TI, segurança, dados, DevOps, suporte, desenvolvimento e mais.`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface JobDescriptionInputProps {
  onSubmit: (text: string) => void;
  isComplete: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function JobDescriptionInput({ onSubmit, isComplete }: JobDescriptionInputProps) {
  const [text, setText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  // Whether the user clicked Edit and is back in editing mode after completion
  const [isEditing, setIsEditing] = useState(!isComplete);

  // Run the validator on every keystroke so UI feedback is immediate
  const validation = validateJobDescription(text);
  const isValid = validation.valid;

  // Character counter turns red when below minimum or above maximum
  const isCounterRed = text.length < MIN_CHARS || text.length > MAX_CHARS;

  const handleSubmit = useCallback(() => {
    if (!isValid) return;
    setSubmittedText(text);
    setIsEditing(false);
    onSubmit(text);
  }, [isValid, text, onSubmit]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // ── Completed summary view ───────────────────────────────────────────────

  if (isComplete && !isEditing) {
    const preview =
      submittedText.length > 200
        ? `${submittedText.slice(0, 200)}...`
        : submittedText;

    return (
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-[#00ffd5]">
              Passo 2: Descrição da Vaga
            </p>
            {/* Truncated preview of the confirmed job description */}
            <p className="text-sm text-[#9ca3af] leading-relaxed break-words">
              {preview}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="shrink-0"
            aria-label="Editar descrição da vaga"
          >
            <Pencil size={14} />
            Editar
          </Button>
        </div>
      </Card>
    );
  }

  // ── Input view ──────────────────────────────────────────────────────────

  return (
    <Card className="p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#00ffd5]">
        Passo 2: Descrição da Vaga
      </p>

      <p className="mb-3 text-sm text-[#9ca3af]">
        Cole abaixo a descrição completa da vaga para qual deseja candidatar-se.
      </p>

      {/* Themed textarea: delegates the counter display to the Textarea component */}
      <Textarea
        id="job-description"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={10}
        // Pass raw counts to Textarea so it renders the counter in its footer
        charCount={text.length}
        maxChars={MAX_CHARS}
        // Only surface a validation error message when the user has typed
        // something but it is still below the minimum, to avoid premature errors
        error={
          text.length > 0 && text.length < MIN_CHARS
            ? `Mínimo de ${MIN_CHARS} caracteres. Ainda faltam ${MIN_CHARS - text.length}.`
            : text.length > MAX_CHARS
              ? `Limite de ${MAX_CHARS} caracteres excedido em ${text.length - MAX_CHARS}.`
              : undefined
        }
        // Override the counter colour to red when out of valid range
        className={isCounterRed && text.length > 0 ? '' : ''}
        aria-describedby="job-desc-hint"
      />

      {/* Supplementary hint line */}
      <p id="job-desc-hint" className="mt-2 text-xs text-[#8b8fa3]">
        Inclua requisitos técnicos, responsabilidades e certificações exigidas para
        uma análise mais precisa.
      </p>

      {/* Submit button: disabled until content is valid */}
      <div className="mt-4 flex justify-end">
        <Button
          variant="primary"
          size="md"
          disabled={!isValid}
          onClick={handleSubmit}
          className="w-full sm:w-auto"
        >
          Confirmar Descrição da Vaga
        </Button>
      </div>
    </Card>
  );
}
