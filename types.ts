
export type InferenceMode = 'FORWARD' | 'BACKWARD';

export interface Predicate {
  name: string;
  args: string[]; // e.g., ["Patient", "fever"]
}

export interface Rule {
  id: string;
  name: string;
  antecedents: Predicate[]; // If these are true...
  consequent: Predicate;    // ...then this is true
  description: string;
}

export interface Fact extends Predicate {
  source: 'user' | 'inference';
  ruleId?: string; // If inferred, which rule led to this?
}

export interface ReasoningStep {
  type: 'MATCH' | 'INFER' | 'GOAL' | 'FAIL' | 'SUCCESS';
  message: string;
  predicate?: Predicate;
  ruleId?: string;
  depth: number;
}

export interface Diagnosis {
  disease: string;
  confidence: number;
  reasoning: ReasoningStep[];
  mode: InferenceMode;
}

export interface DiseaseKnowledge {
  id: string;
  name: string;
  requiredSymptoms: string[];
  optionalSymptoms: string[];
  exclusions: string[];
}
