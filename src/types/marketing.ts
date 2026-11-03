export type BudgetLevel = 'low' | 'medium' | 'high';

export interface CampaignInput {
  industry: string;
  productName: string;
  budgetLevel: BudgetLevel;
  objective: string;
  additionalNotes?: string;
}

export interface WeeklyPlan {
  week: 1 | 2 | 3 | 4;
  title: string;
  activities: string[]; // 2-4 hoạt động ngắn, khả thi
}

export interface RefinementHistoryEntry {
  version: number;
  refinedAt: string;
  instruction: string;
  changeReason: string;
  changesSummary: string[];
  previousIdea: {
    title: string;
    tagline: string;
    channels: string[];
    mainContent: string;
    estimatedBudget: string;
    targetAudience: string;
    timeline: WeeklyPlan[];
  };
}

export interface MarketingIdea {
  id: string; // Server sinh UUID
  title: string; // Tên chiến dịch
  tagline: string; // Slogan / Thông điệp then chốt
  channels: string[]; // 1-5 kênh triển khai phù hợp ngân sách
  mainContent: string; // Nội dung chiến lược cốt lõi
  estimatedBudget: string; // Số tiền ước tính nằm trong khoảng
  targetAudience: string; // Đối tượng khách hàng mục tiêu
  timeline: WeeklyPlan[]; // Đúng 4 tuần tuần tự
  version?: number; // Phiên bản (1, 2, 3...)
  refinementHistory?: RefinementHistoryEntry[]; // Lịch sử các lần tinh chỉnh
}

export interface RefineIdeaRequest {
  campaignId: string;
  currentIdea: MarketingIdea;
  context: Pick<CampaignInput, 'industry' | 'productName' | 'budgetLevel' | 'objective'>;
  instruction: string;
}

export interface RefineIdeaResponse {
  ok: true;
  source: 'ai' | 'mock';
  model?: string;
  refinedIdea: MarketingIdea;
  changeReason: string;
  changesSummary: string[];
}

export interface RefineIdeaError {
  ok: false;
  error: {
    code: 'VALIDATION_ERROR' | 'RATE_LIMITED' | 'CONFIG_ERROR' | 'SAFETY_BLOCKED' | 'INTERNAL_ERROR';
    message: string;
    fieldErrors?: Record<string, string>;
  };
}

export interface GenerateResponse {
  ok: true;
  source: 'ai' | 'mock';
  model?: string;
  ideas: MarketingIdea[];
}

export interface GenerateError {
  ok: false;
  error: {
    code: 'VALIDATION_ERROR' | 'RATE_LIMITED' | 'CONFIG_ERROR' | 'SAFETY_BLOCKED' | 'INTERNAL_ERROR';
    message: string;
    fieldErrors?: Record<string, string>;
  };
}

export interface ShortlistEntry {
  id: string; // = idea.id
  savedAt: string; // ISO timestamp
  context: Pick<CampaignInput, 'industry' | 'productName' | 'budgetLevel' | 'objective'>;
  idea: MarketingIdea;
}

