import type { Category, Match } from '../types';

import { detectEmail } from './email';
import { detectPhone } from './phone';
import { detectCpf } from './cpf';
import { detectCep } from './cep';
import { detectBirthdate } from './birthdate';
import { detectLinkedin } from './linkedin';
import { detectGithub } from './github';

/**
 * Registry of detectors keyed by category. Iterating this map drives the
 * main `anonymize` entry point and keeps the detector set authoritative in
 * a single place.
 */
export const DETECTORS: Record<Category, (text: string) => Match[]> = {
  email: detectEmail,
  phone: detectPhone,
  cpf: detectCpf,
  cep: detectCep,
  birthdate: detectBirthdate,
  linkedin: detectLinkedin,
  github: detectGithub,
};
