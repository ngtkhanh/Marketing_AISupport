export interface DemoScene {
  id: 1 | 2 | 3;
  title: string;
  shortMessage: string;
  durationMs: number;
}

export const DEMO_SCENES: DemoScene[] = [
  {
    id: 1,
    title: '1. Nhập thông tin',
    shortMessage: 'Cho biết sản phẩm, mục tiêu và ngân sách qua 3 bước gọn gàng',
    durationMs: 7000
  },
  {
    id: 2,
    title: '2. Xem kết quả',
    shortMessage: 'Khám phá 5 hướng chiến dịch chi tiết kèm timeline 4 tuần',
    durationMs: 8000
  },
  {
    id: 3,
    title: '3. Lưu ý tưởng',
    shortMessage: 'Giữ lại phương án vào danh sách để so sánh và lập đề xuất',
    durationMs: 7000
  }
];

export const DEMO_DATA = {
  brief: {
    industry: 'F&B (Đồ uống & Trà sữa)',
    productName: 'Trà Sữa Trân Châu Mộc Trà',
    objective: 'Tăng tương tác và độ nhận diện trong giới học sinh, sinh viên',
    budgetLevel: 'low' as const,
    budgetLabel: 'Thấp (Dưới 20 triệu VNĐ)'
  },
  sampleIdeas: [
    {
      id: 'demo-1',
      title: 'Thử Thách UGC: Bật Năng Lượng Cùng Mộc Trà',
      tagline: 'Tự tin khoe chất riêng – Rinh trọn bộ quà Mộc Trà',
      channels: ['TikTok Organic', 'Facebook Group Seeding', 'Instagram Reels'],
      budget: '8.500.000 VNĐ',
      targetAudience: 'Học sinh, sinh viên và nhân viên trẻ 16–25 tuổi',
      timeline: [
        { week: 1, title: 'Khởi động & Teasing thể lệ' },
        { week: 2, title: 'Bùng nổ làn sóng tham gia' },
        { week: 3, title: 'Bình chọn & Khuấy động tương tác' },
        { week: 4, title: 'Trao giải & Kích hoạt mua lại' }
      ]
    },
    {
      id: 'demo-2',
      title: 'Hành Trình 7 Ngày Trải Nghiệm Mộc Trà Chân Thực',
      tagline: '7 ngày sảng khoái – Mỗi ngày một hương vị mới',
      channels: ['Facebook Group', 'Zalo Chăm sóc', 'TikTok Review'],
      budget: '6.200.000 VNĐ'
    },
    {
      id: 'demo-3',
      title: 'Liên Minh Quán Cafe & Tiệm Bánh Local (Cross-Promo)',
      tagline: 'Trọn vị ngọt ngào – Nhân đôi niềm vui',
      channels: ['Standee điểm bán', 'Voucher chéo O2O'],
      budget: '4.500.000 VNĐ'
    },
    {
      id: 'demo-4',
      title: 'Minigame Ghép Chữ: Săn Thẻ Vàng Mộc Trà',
      tagline: 'Uống trà săn chữ – Rinh thẻ vàng may mắn',
      channels: ['Fanpage Minigame', 'POSM Quầy thu ngân'],
      budget: '7.000.000 VNĐ'
    },
    {
      id: 'demo-5',
      title: 'Ngày Hội Đổi Cốc Cũ Lấy Trà Sữa Xanh',
      tagline: 'Chung tay sống xanh – Uống lành sống khỏe',
      channels: ['TikTok Green Trend', 'Check-in tại quán'],
      budget: '5.000.000 VNĐ'
    }
  ]
};

