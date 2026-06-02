/**
 * Anonymizer public types.
 *
 * The anonymizer detects structurally identifiable PII (CPF, e-mail, telefone,
 * CEP, datas de nascimento, URLs do LinkedIn e GitHub) and replaces each
 * occurrence with a stable categorical placeholder so the redacted text can be
 * sent safely to any AI provider.
 *
 * v1 explicitly does NOT cover nome, endereco completo, idade ou foto. Those
 * are deferred to v1.1 due to high false-positive risk and the need for human
 * review before automatic substitution. See project_roadmap memory.
 */

export type Category = 'email' | 'phone' | 'cpf' | 'cep' | 'birthdate' | 'linkedin' | 'github';

/** A single piece of PII detected inside the input text. */
export interface Match {
  /** Inclusive index of the first character of the match. */
  start: number;
  /** Exclusive end index. */
  end: number;
  /** The literal substring that will be redacted. */
  original: string;
  /** Category bucket, used to pick the replacement token. */
  category: Category;
  /**
   * Internal detector identifier (e.g. 'cpf-formatted', 'phone-br-mobile').
   * Useful for analytics and debugging; never shown to the user.
   */
  detector: string;
}

/** Per-category enablement, defaults to true when a category is omitted. */
export type CategoryOptions = Partial<Record<Category, boolean>>;

export interface AnonymizeOptions {
  /**
   * Override the default-on behaviour for specific categories. Passing
   * `{ phone: false }` keeps phones in the output while still redacting the
   * other categories.
   */
  enabledCategories?: CategoryOptions;
}

/** Result returned by `anonymize`. */
export interface AnonymizationResult {
  /** The text with every matched PII replaced by its categorical token. */
  redactedText: string;
  /** Every applied substitution, sorted by start offset. */
  matches: Match[];
  /** Convenience tally per category, useful for UI summary cards. */
  countsByCategory: Record<Category, number>;
}
