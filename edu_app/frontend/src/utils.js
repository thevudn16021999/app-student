/**
 * Hàm tiện ích - Rank, màu sắc, format
 */

// Thông tin hạng theo điểm
export const RANKS = {
  bronze: { name: 'Đồng', icon: '🥉', color: '#CD7F32', min: 0, max: 49 },
  silver: { name: 'Bạc', icon: '🥈', color: '#C0C0C0', min: 50, max: 99 },
  gold: { name: 'Vàng', icon: '🥇', color: '#FFD700', min: 100, max: 199 },
  diamond: { name: 'Kim Cương', icon: '💎', color: '#B9F2FF', min: 200, max: Infinity },
};

// Tính rank từ điểm
export function getRank(points) {
  if (points >= 200) return 'diamond';
  if (points >= 100) return 'gold';
  if (points >= 50) return 'silver';
  return 'bronze';
}

// Tính progress bar (phần trăm tiến tới hạng tiếp theo)
export function getRankProgress(points) {
  const rank = getRank(points);
  const info = RANKS[rank];
  const nextRanks = { bronze: 'silver', silver: 'gold', gold: 'diamond' };
  const nextRank = nextRanks[rank];

  if (!nextRank) {
    // Đã đạt Kim Cương
    return { percent: 100, remaining: 0, nextRankName: null };
  }

  const nextInfo = RANKS[nextRank];
  const range = nextInfo.min - info.min;
  const progress = points - info.min;
  const percent = Math.round((progress / range) * 100);
  const remaining = nextInfo.min - points;

  return { percent, remaining, nextRankName: nextInfo.name };
}

// Tạo avatar mặc định (SVG với chữ cái đầu)
export function generateDefaultAvatar(name) {
  const initial = name.charAt(0).toUpperCase();
  const colors = ['#6750A4', '#FF6D00', '#2E7D32', '#1565C0', '#C62828', '#6A1B9A', '#00838F'];
  const color = colors[name.length % colors.length];
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${color}"/>
          <stop offset="100%" stop-color="${color}88"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="16" fill="url(#g)"/>
      <text x="50" y="62" font-family="Roboto,sans-serif" font-size="42" font-weight="700"
        fill="white" text-anchor="middle">${initial}</text>
    </svg>`
  )}`;
}

// Format thời gian
export function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export function formatTimeShort(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}
