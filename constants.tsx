
import { Rule, DiseaseKnowledge } from './types';

export const DISEASES_KB: DiseaseKnowledge[] = [
  {
    id: 'common_cold',
    name: 'Common Cold',
    requiredSymptoms: ['runny_nose', 'sneezing'],
    optionalSymptoms: ['mild_fever', 'sore_throat'],
    exclusions: ['high_fever']
  },
  {
    id: 'influenza',
    name: 'Influenza (Flu)',
    requiredSymptoms: ['high_fever', 'body_aches', 'fatigue'],
    optionalSymptoms: ['cough', 'headache'],
    exclusions: []
  },
  {
    id: 'covid_19',
    name: 'COVID-19',
    requiredSymptoms: ['cough', 'fever', 'loss_of_taste'],
    optionalSymptoms: ['shortness_of_breath', 'fatigue'],
    exclusions: []
  },
  {
    id: 'allergic_rhinitis',
    name: 'Allergic Rhinitis',
    requiredSymptoms: ['sneezing', 'itchy_eyes'],
    optionalSymptoms: ['runny_nose'],
    exclusions: ['fever']
  },
  {
    id: 'migraine',
    name: 'Migraine',
    requiredSymptoms: ['severe_headache', 'nausea'],
    optionalSymptoms: ['sensitivity_to_light', 'throbbing_pain'],
    exclusions: ['fever']
  }
];

export const RULES: Rule[] = [
  {
    id: 'r1',
    name: 'Cold Diagnosis',
    antecedents: [
      { name: 'HasSymptom', args: ['P', 'runny_nose'] },
      { name: 'HasSymptom', args: ['P', 'sneezing'] }
    ],
    consequent: { name: 'HasDisease', args: ['P', 'Common Cold'] },
    description: 'If patient has runny nose and sneezing, they may have a cold.'
  },
  {
    id: 'r2',
    name: 'Flu Diagnosis',
    antecedents: [
      { name: 'HasSymptom', args: ['P', 'high_fever'] },
      { name: 'HasSymptom', args: ['P', 'body_aches'] },
      { name: 'HasSymptom', args: ['P', 'fatigue'] }
    ],
    consequent: { name: 'HasDisease', args: ['P', 'Influenza'] },
    description: 'If patient has high fever, body aches, and fatigue, they likely have flu.'
  },
  {
    id: 'r3',
    name: 'COVID Diagnosis',
    antecedents: [
      { name: 'HasSymptom', args: ['P', 'cough'] },
      { name: 'HasSymptom', args: ['P', 'fever'] },
      { name: 'HasSymptom', args: ['P', 'loss_of_taste'] }
    ],
    consequent: { name: 'HasDisease', args: ['P', 'COVID-19'] },
    description: 'If patient has cough, fever, and loss of taste, consider COVID-19.'
  },
  {
    id: 'r4',
    name: 'Allergy Diagnosis',
    antecedents: [
      { name: 'HasSymptom', args: ['P', 'sneezing'] },
      { name: 'HasSymptom', args: ['P', 'itchy_eyes'] }
    ],
    consequent: { name: 'HasDisease', args: ['P', 'Allergic Rhinitis'] },
    description: 'If patient has sneezing and itchy eyes, they may have allergies.'
  },
  {
    id: 'r5',
    name: 'Migraine Diagnosis',
    antecedents: [
      { name: 'HasSymptom', args: ['P', 'severe_headache'] },
      { name: 'HasSymptom', args: ['P', 'nausea'] }
    ],
    consequent: { name: 'HasDisease', args: ['P', 'Migraine'] },
    description: 'If patient has severe headache and nausea, they may have a migraine.'
  }
];

export const SYMPTOMS_LIST = [
  { id: 'fever', label: 'Fever (Mild)' },
  { id: 'high_fever', label: 'High Fever' },
  { id: 'runny_nose', label: 'Runny Nose' },
  { id: 'sneezing', label: 'Sneezing' },
  { id: 'cough', label: 'Cough' },
  { id: 'body_aches', label: 'Body Aches' },
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'sore_throat', label: 'Sore Throat' },
  { id: 'loss_of_taste', label: 'Loss of Taste/Smell' },
  { id: 'shortness_of_breath', label: 'Shortness of Breath' },
  { id: 'itchy_eyes', label: 'Itchy Eyes' },
  { id: 'severe_headache', label: 'Severe Headache' },
  { id: 'nausea', label: 'Nausea' },
  { id: 'sensitivity_to_light', label: 'Sensitivity to Light' }
];
