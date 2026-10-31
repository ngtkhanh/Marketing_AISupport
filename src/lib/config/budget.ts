import { BudgetLevel } from '@/types/marketing';

export interface BudgetLevelConfig {
  id: BudgetLevel;
  label: string;
  badgeColor: string;
  rangeText: string;
  minAmount: number;
  maxAmount: number;
  description: string;
  recommendedChannels: string[];
  forbiddenChannels: string[]; // Các từ khóa kênh bị cấm khi kiểm tra đầu ra Lớp 3
}

export const BUDGET_CONFIGS: Record<BudgetLevel, BudgetLevelConfig> = {
  low: {
    id: 'low',
    label: 'Thấp',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rangeText: 'Dưới 20.000.000 VNĐ',
    minAmount: 0,
    maxAmount: 20000000,
    description: 'Tối ưu ngân sách siêu tiết kiệm: Tập trung Organic Social, UGC, seeding hội nhóm, micro-influencer đổi quà, mini-contest.',
    recommendedChannels: ['TikTok Organic', 'Facebook Group Seeding', 'Instagram Reels', 'Email Marketing', 'Mini-contest'],
    forbiddenChannels: [
      'tvc',
      'billboard',
      'ooh',
      'đại nhạc hội',
      'kol hạng a',
      'quảng cáo truyền hình',
      'sự kiện quy mô lớn',
      'led ngoài trời'
    ]
  },
  medium: {
    id: 'medium',
    label: 'Trung bình',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    rangeText: '20.000.000 – 100.000.000 VNĐ',
    minAmount: 20000000,
    maxAmount: 100000000,
    description: 'Cân bằng hiệu quả & chi phí: Paid Ads (TikTok/Meta/Google), influencer tầm trung, video ngắn viral, activation nhỏ.',
    recommendedChannels: ['TikTok Ads', 'Meta Ads (Facebook/Instagram)', 'KOL/KOC Tầm trung', 'PR Báo chí online', 'Activation / Workshop'],
    forbiddenChannels: [
      'tvc truyền hình quốc gia',
      'billboard ngã tư lớn',
      'đại nhạc hội toàn quốc'
    ]
  },
  high: {
    id: 'high',
    label: 'Cao',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    rangeText: 'Trên 100.000.000 VNĐ',
    minAmount: 100000000,
    maxAmount: 1000000000,
    description: 'Chiến dịch tổng lực (IMC): Đa kênh tích hợp, KOL lớn/Celeb, PR báo chí hàng đầu, OOH/LED ngoài trời, sự kiện ra mắt hoành tráng.',
    recommendedChannels: ['Chiến dịch IMC Đa kênh', 'KOL/Celeb lớn', 'OOH / Billboard LED', 'Báo chí lớn (VnExpress, Zing, CafeF)', 'Event / Gala Launching'],
    forbiddenChannels: []
  }
};

