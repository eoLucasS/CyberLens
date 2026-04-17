'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Font,
} from '@react-pdf/renderer';

import type { AnalysisResult, Gap, StudyPlanItem } from '@/types';

// Use Helvetica (built-in PDF font) to avoid woff2 subsetting crashes entirely
Font.registerHyphenationCallback((word) => [word]);

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------
const C = {
  teal: '#0d9488',
  tealLight: '#ccfbf1',
  dark: '#1f2937',
  gray: '#6b7280',
  grayLight: '#f3f4f6',
  red: '#dc2626',
  orange: '#ea580c',
  green: '#16a34a',
  white: '#ffffff',
  border: '#e5e7eb',
  amber: '#d97706',
} as const;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.dark,
    backgroundColor: C.white,
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
  },

  // --- header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerBrand: {
    fontWeight: 700,
    fontSize: 14,
    color: C.teal,
    letterSpacing: 0.5,
  },
  headerDate: {
    fontSize: 8,
    color: C.gray,
  },
  headerLine: {
    borderBottomWidth: 1,
    borderBottomColor: C.teal,
    marginBottom: 20,
  },

  // --- footer ---
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  footerLeft: {
    flexDirection: 'column',
    gap: 2,
  },
  footerLabel: {
    fontSize: 7.5,
    color: C.gray,
  },
  footerDisclaimer: {
    fontSize: 6.5,
    color: C.gray,
  },
  footerPage: {
    fontSize: 7.5,
    color: C.gray,
  },

  // --- section ---
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: C.teal,
    marginBottom: 10,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.tealLight,
    paddingBottom: 4,
  },

  // --- score block ---
  reportTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: C.dark,
    marginBottom: 20,
  },
  scoreBlock: {
    backgroundColor: C.grayLight,
    borderRadius: 8,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 24,
  },
  scoreNumber: {
    fontSize: 56,
    fontWeight: 700,
    lineHeight: 1,
  },
  scorePercent: {
    fontSize: 24,
    fontWeight: 600,
    marginTop: 6,
  },
  scoreClassification: {
    fontSize: 14,
    fontWeight: 600,
    marginTop: 4,
  },

  // --- executive summary block ---
  summaryBlock: {
    backgroundColor: C.tealLight,
    borderLeftWidth: 3,
    borderLeftColor: C.teal,
    borderRadius: 4,
    padding: 14,
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: C.teal,
    letterSpacing: 1.2,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  summaryText: {
    fontSize: 11,
    lineHeight: 1.5,
    color: C.dark,
  },

  // --- skill rows ---
  skillRow: {
    flexDirection: 'row',
    marginBottom: 6,
    gap: 6,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 10,
    color: C.green,
    marginTop: 0,
    width: 14,
    flexShrink: 0,
  },
  skillName: {
    fontWeight: 600,
    fontSize: 10,
    color: C.dark,
  },
  skillContext: {
    fontSize: 9,
    color: C.gray,
    marginTop: 1,
  },

  // --- gap rows ---
  gapPriorityTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 10,
    marginBottom: 6,
  },
  gapRow: {
    flexDirection: 'row',
    marginBottom: 5,
    gap: 6,
    alignItems: 'flex-start',
  },
  gapDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
    flexShrink: 0,
  },
  gapSkill: {
    fontWeight: 600,
    fontSize: 10,
  },
  gapReason: {
    fontSize: 9,
    color: C.gray,
    marginTop: 1,
  },
  gapSuggestion: {
    fontSize: 8,
    color: C.teal,
    marginTop: 3,
    fontStyle: 'italic',
  },

  // --- missing keywords ---
  kwRow: {
    flexDirection: 'row',
    marginBottom: 5,
    gap: 6,
    alignItems: 'flex-start',
  },
  kwTag: {
    backgroundColor: C.grayLight,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 9,
    fontWeight: 600,
    color: C.dark,
  },
  kwSuggestion: {
    fontSize: 9,
    color: C.gray,
    marginTop: 2,
    flex: 1,
  },

  // --- experience analysis ---
  expGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  expCol: {
    flex: 1,
    backgroundColor: C.grayLight,
    borderRadius: 6,
    padding: 10,
  },
  expColTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: C.gray,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  expColValue: {
    fontSize: 10,
    color: C.dark,
  },
  expGapBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: C.amber,
  },
  expGapLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: C.amber,
    marginBottom: 3,
  },
  expGapValue: {
    fontSize: 10,
    color: C.dark,
  },
  certSection: {
    marginTop: 6,
  },
  certTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: C.dark,
    marginBottom: 6,
  },
  certGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  certCol: {
    flex: 1,
  },
  certColHeader: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  certItem: {
    fontSize: 9,
    color: C.dark,
    marginBottom: 3,
  },

  // --- study plan ---
  studyItem: {
    marginBottom: 14,
    borderLeftWidth: 2,
    borderLeftColor: C.teal,
    paddingLeft: 10,
  },
  studyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  studyOrder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.teal,
    color: C.white,
    fontSize: 9,
    fontWeight: 700,
    textAlign: 'center',
    paddingTop: 4,
    flexShrink: 0,
  },
  studyTopic: {
    fontSize: 11,
    fontWeight: 700,
    color: C.dark,
  },
  studyMeta: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  studyMetaItem: {
    fontSize: 8,
    color: C.gray,
  },
  studyMetaValue: {
    fontWeight: 600,
    color: C.dark,
  },
  studyDescription: {
    fontSize: 9,
    color: C.gray,
    marginBottom: 6,
    lineHeight: 1.5,
  },
  studyResourcesTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: C.dark,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  studyResource: {
    fontSize: 8,
    color: C.teal,
    marginBottom: 2,
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function scoreColor(score: number): string {
  if (score >= 75) return C.teal;
  if (score >= 50) return C.orange;
  return C.red;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function priorityColor(priority: Gap['priority']): string {
  if (priority === 'Crítico') return C.red;
  if (priority === 'Importante') return C.orange;
  return C.amber;
}

function studyPriorityLabel(priority: StudyPlanItem['priority']): string {
  if (priority === 'Alta') return '🔴';
  if (priority === 'Média') return '🟡';
  return '🟢';
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------
interface HeaderProps {
  date: string;
}

function PageHeader({ date }: HeaderProps) {
  return (
    <>
      <View style={styles.header} fixed>
        <Text style={styles.headerBrand}>CyberLens</Text>
        <Text style={styles.headerDate}>{date}</Text>
      </View>
      <View style={styles.headerLine} fixed />
    </>
  );
}

interface FooterProps {
  pageNumber?: number;
}

function PageFooter(_props: FooterProps) {
  return (
    <View style={styles.footer} fixed>
      <View style={styles.footerLeft}>
        <Text style={styles.footerLabel}>
          Gerado por CyberLens. Dados processados localmente
        </Text>
        <Text style={styles.footerDisclaimer}>
          Esta análise foi gerada por IA e tem caráter informativo.
        </Text>
      </View>
      <Text
        style={styles.footerPage}
        render={({ pageNumber, totalPages }) =>
          `Página ${pageNumber} / ${totalPages}`
        }
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Section: Score + Summary
// ---------------------------------------------------------------------------
interface ScoreSectionProps {
  result: AnalysisResult;
}

function ScoreSection({ result }: ScoreSectionProps) {
  const color = scoreColor(result.score);
  const hasSummary =
    typeof result.executiveSummary === 'string' &&
    result.executiveSummary.trim().length > 0;
  return (
    <>
      <Text style={styles.reportTitle}>
        Relatório de Aderência: CyberLens
      </Text>
      {hasSummary && (
        <View style={styles.summaryBlock} wrap={false}>
          <Text style={styles.summaryLabel}>Resumo Executivo</Text>
          <Text style={styles.summaryText}>{result.executiveSummary}</Text>
        </View>
      )}
      <View style={styles.scoreBlock}>
        <View>
          <Text style={[styles.scoreNumber, { color }]}>{result.score}</Text>
          <Text style={[styles.scorePercent, { color }]}>%</Text>
        </View>
        <View>
          <Text style={[styles.scoreClassification, { color }]}>
            {result.classification}
          </Text>
        </View>
      </View>
    </>
  );
}

// ---------------------------------------------------------------------------
// Section: Skills Encontradas
// ---------------------------------------------------------------------------
interface SkillsSectionProps {
  result: AnalysisResult;
}

function SkillsSection({ result }: SkillsSectionProps) {
  return (
    <>
      <Text style={styles.sectionTitle}>Skills Encontradas</Text>
      {result.matchedSkills.map((skill, i) => (
        <View key={i} style={styles.skillRow} wrap={false}>
          <Text style={styles.bullet}>✓</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.skillName}>{skill.skill}</Text>
            <Text style={styles.skillContext}>{skill.context}</Text>
          </View>
        </View>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Section: Lacunas Identificadas
// ---------------------------------------------------------------------------
interface GapsSectionProps {
  result: AnalysisResult;
}

const GAP_PRIORITIES: Gap['priority'][] = ['Crítico', 'Importante', 'Desejável'];

function GapsSection({ result }: GapsSectionProps) {
  return (
    <>
      <Text style={styles.sectionTitle}>Lacunas Identificadas</Text>
      {GAP_PRIORITIES.map((priority) => {
        const items = result.gaps.filter((g) => g.priority === priority);
        if (items.length === 0) return null;
        const color = priorityColor(priority);
        return (
          <View key={priority}>
            <Text style={[styles.gapPriorityTitle, { color }]}>{priority}</Text>
            {items.map((gap, i) => (
              <View key={i} style={styles.gapRow} wrap={false}>
                <View style={[styles.gapDot, { backgroundColor: color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.gapSkill, { color }]}>{gap.skill}</Text>
                  <Text style={styles.gapReason}>{gap.reason}</Text>
                  {gap.rewriteSuggestion?.type === 'rewrite' && gap.rewriteSuggestion.after && (
                    <Text style={styles.gapSuggestion}>
                      Sugestão: {gap.rewriteSuggestion.after}
                    </Text>
                  )}
                  {gap.rewriteSuggestion?.type === 'study' && gap.rewriteSuggestion.resource && (
                    <Text style={styles.gapSuggestion}>
                      Recurso: {gap.rewriteSuggestion.resource}
                      {gap.rewriteSuggestion.estimatedTime ? ` (${gap.rewriteSuggestion.estimatedTime})` : ''}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Section: Palavras-chave Ausentes
// ---------------------------------------------------------------------------
interface KeywordsSectionProps {
  result: AnalysisResult;
}

function KeywordsSection({ result }: KeywordsSectionProps) {
  if (result.missingKeywords.length === 0) return null;
  return (
    <>
      <Text style={styles.sectionTitle}>Palavras-chave Ausentes</Text>
      {result.missingKeywords.map((kw, i) => (
        <View key={i} style={styles.kwRow} wrap={false}>
          <Text style={styles.kwTag}>{kw.keyword}</Text>
          <Text style={styles.kwSuggestion}>{kw.suggestion}</Text>
        </View>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Section: Análise de Experiência
// ---------------------------------------------------------------------------
interface ExperienceSectionProps {
  result: AnalysisResult;
}

function ExperienceSection({ result }: ExperienceSectionProps) {
  const { experienceAnalysis } = result;
  const { certifications } = experienceAnalysis;
  return (
    <>
      <Text style={styles.sectionTitle}>Análise de Experiência</Text>

      <View style={styles.expGrid}>
        <View style={styles.expCol}>
          <Text style={styles.expColTitle}>Exigido</Text>
          <Text style={styles.expColValue}>{experienceAnalysis.required}</Text>
        </View>
        <View style={styles.expCol}>
          <Text style={styles.expColTitle}>Encontrado</Text>
          <Text style={styles.expColValue}>{experienceAnalysis.found}</Text>
        </View>
      </View>

      {experienceAnalysis.gap ? (
        <View style={styles.expGapBox} wrap={false}>
          <Text style={styles.expGapLabel}>Gap Identificado</Text>
          <Text style={styles.expGapValue}>{experienceAnalysis.gap}</Text>
        </View>
      ) : null}

      <View style={styles.certSection}>
        <Text style={styles.certTitle}>Certificações</Text>
        <View style={styles.certGrid}>
          <View style={styles.certCol}>
            <Text style={[styles.certColHeader, { color: C.gray }]}>
              Exigidas
            </Text>
            {certifications.required.length > 0 ? (
              certifications.required.map((cert, i) => (
                <Text key={i} style={styles.certItem}>
                  • {cert}
                </Text>
              ))
            ) : (
              <Text style={[styles.certItem, { color: C.gray }]}>Nenhuma</Text>
            )}
          </View>
          <View style={styles.certCol}>
            <Text style={[styles.certColHeader, { color: C.green }]}>
              Encontradas
            </Text>
            {certifications.found.length > 0 ? (
              certifications.found.map((cert, i) => (
                <Text key={i} style={[styles.certItem, { color: C.green }]}>
                  ✓ {cert}
                </Text>
              ))
            ) : (
              <Text style={[styles.certItem, { color: C.gray }]}>Nenhuma</Text>
            )}
          </View>
          <View style={styles.certCol}>
            <Text style={[styles.certColHeader, { color: C.red }]}>
              Ausentes
            </Text>
            {certifications.missing.length > 0 ? (
              certifications.missing.map((cert, i) => (
                <Text key={i} style={[styles.certItem, { color: C.red }]}>
                  ✗ {cert}
                </Text>
              ))
            ) : (
              <Text style={[styles.certItem, { color: C.gray }]}>Nenhuma</Text>
            )}
          </View>
        </View>
      </View>
    </>
  );
}

// ---------------------------------------------------------------------------
// Section: Plano de Estudos
// ---------------------------------------------------------------------------
interface StudyPlanSectionProps {
  result: AnalysisResult;
}

function StudyPlanSection({ result }: StudyPlanSectionProps) {
  if (result.studyPlan.length === 0) return null;
  return (
    <>
      <Text style={styles.sectionTitle}>Plano de Estudos</Text>
      {result.studyPlan.map((item, i) => (
        <View key={i} style={styles.studyItem} wrap={false}>
          <View style={styles.studyHeader}>
            <Text style={styles.studyOrder}>{item.order}</Text>
            <Text style={styles.studyTopic}>{item.topic}</Text>
          </View>

          <View style={styles.studyMeta}>
            <Text style={styles.studyMetaItem}>
              Tipo:{' '}
              <Text style={styles.studyMetaValue}>{item.resourceType}</Text>
            </Text>
            <Text style={styles.studyMetaItem}>
              Tempo:{' '}
              <Text style={styles.studyMetaValue}>{item.estimatedTime}</Text>
            </Text>
            <Text style={styles.studyMetaItem}>
              Prioridade:{' '}
              <Text style={styles.studyMetaValue}>
                {studyPriorityLabel(item.priority)} {item.priority}
              </Text>
            </Text>
          </View>

          <Text style={styles.studyDescription}>{item.description}</Text>

          {item.resources.length > 0 ? (
            <>
              <Text style={styles.studyResourcesTitle}>Recursos</Text>
              {item.resources.map((res, j) => (
                <Text key={j} style={styles.studyResource}>
                  • {res.name} ({res.platform}): {res.url}
                </Text>
              ))}
            </>
          ) : null}
        </View>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Full PDF Document
// ---------------------------------------------------------------------------
interface ReportDocumentProps {
  result: AnalysisResult;
  date: string;
  providerLabel?: string;
}

function ReportDocument({ result, date, providerLabel }: ReportDocumentProps) {
  void providerLabel; // reserved for future use
  return (
    <Document
      title="CyberLens: Relatório de Aderência"
      author="CyberLens"
      subject="Análise de aderência de currículo a vaga"
      creator="CyberLens"
      producer="@react-pdf/renderer"
    >
      <Page size="A4" style={styles.page}>
        <PageHeader date={date} />

        {/* Page 1: Score */}
        <ScoreSection result={result} />

        {/* Skills */}
        <SkillsSection result={result} />

        {/* Gaps */}
        <GapsSection result={result} />

        {/* Missing Keywords */}
        <KeywordsSection result={result} />

        {/* Experience */}
        <ExperienceSection result={result} />

        {/* Study Plan */}
        <StudyPlanSection result={result} />

        <PageFooter />
      </Page>
    </Document>
  );
}

// ---------------------------------------------------------------------------
// Download icon (inline SVG encoded as data-URI to avoid next/image issues)
// ---------------------------------------------------------------------------
function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------
interface PdfExportButtonProps {
  result: AnalysisResult;
  providerLabel?: string;
}

export function PdfExportButton({ result, providerLabel }: PdfExportButtonProps) {
  const now = new Date();
  const dateLabel = formatDate(now);
  const fileDate = now.toISOString().slice(0, 10);
  const fileName = `cyberlens-analise-${fileDate}.pdf`;

  return (
    <PDFDownloadLink
      document={
        <ReportDocument
          result={result}
          date={dateLabel}
          providerLabel={providerLabel}
        />
      }
      fileName={fileName}
      style={{ textDecoration: 'none' }}
    >
      {({ loading }) => (
        <button
          type="button"
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: loading ? '#134e4a' : '#0d9488',
            color: '#ffffff',
            border: '1px solid #0d9488',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s ease',
            letterSpacing: '0.02em',
            opacity: loading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading)
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                '#0f766e';
          }}
          onMouseLeave={(e) => {
            if (!loading)
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                '#0d9488';
          }}
        >
          {loading ? (
            'Preparando PDF...'
          ) : (
            <>
              <DownloadIcon />
              Exportar como PDF
            </>
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
}
