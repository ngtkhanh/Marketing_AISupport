import type { BudgetLevel } from './marketing';

export interface CaseStudySource {
  title: string;
  publisher: string;
  url: string;
  publishDate?: string;
  verificationDate: string;
  supportingExcerpt: string;
}

export interface ApplicabilityScope {
  similarity: string;
  differences: string;
  limitations: string;
}

export interface VerifiedCaseStudy {
  id: string;
  brandOrEntity: string;
  context: string;
  objective: string;
  activities: string;
  publishedResults: string;
  source: CaseStudySource;
  applicabilityScope: ApplicabilityScope;
  applicableBudgetLevels: BudgetLevel[];
  applicableStrategyTypes: string[];
}

export interface DecisionCriteria {
  proceed: string;
  pivot: string;
  stop: string;
}

export interface MiniExperimentPlan {
  hypothesis: string;
  actionToTest: string;
  timeframeAndResources: string;
  measurementMetrics: string;
  decisionCriteria: DecisionCriteria;
}

export interface IdeaVerificationEvidence {
  hasCaseStudy: boolean;
  caseStudy?: VerifiedCaseStudy;
  missingCaseStudyNotice?: string;
  miniExperiment: MiniExperimentPlan;
}

