export interface MatchedSkill {
  skill: string;
  context: string;
}

export interface Gap {
  skill: string;
  priority: 'Crítico' | 'Importante' | 'Desejável';
  reason: string;
}

export interface MissingKeyword {
  keyword: string;
  suggestion: string;
}

export interface CertificationAnalysis {
  required: string[];
  found: string[];
  missing: string[];
}

export interface ExperienceAnalysis {
  required: string;
  found: string;
  gap: string;
  certifications: CertificationAnalysis;
}

export interface StudyResource {
  name: string;
  url: string;
  platform: string;
}

export interface StudyPlanItem {
  order: number;
  topic: string;
  description: string;
  resourceType: 'Curso' | 'Certificação' | 'Projeto Prático' | 'Leitura' | 'Laboratório';
  resources: StudyResource[];
  estimatedTime: string;
  priority: 'Alta' | 'Média' | 'Baixa';
}

export interface AnalysisResult {
  score: number;
  classification: 'Baixa Aderência' | 'Aderência Parcial' | 'Alta Aderência' | 'Aderência Excelente';
  matchedSkills: MatchedSkill[];
  gaps: Gap[];
  missingKeywords: MissingKeyword[];
  experienceAnalysis: ExperienceAnalysis;
  studyPlan: StudyPlanItem[];
}
