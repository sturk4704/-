import { PlayerPosition, PlayerStats, FieldPlayerStats, GoalkeeperStats, Player } from '../types';
import { syncPlayerBadges } from './dynamicBadgeEngine';

/**
 * دالة إنشاء طاقات مبدئية تبدأ من 50 بالضبط لكل مهارة كما طلب المستخدم
 */
export function createDefaultStats(position: PlayerPosition): PlayerStats {
  if (position === 'GK') {
    return {
      div: 50,
      han: 50,
      kic: 50,
      ref: 50,
      spd: 50,
      pos: 50,
    };
  }
  return {
    pac: 50,
    sho: 50,
    pas: 50,
    dri: 50,
    def: 50,
    phy: 50,
  };
}

/**
 * مصفوفة أوزان المراكز (Position Weightings) لتحديد المعدل العام OVR بدقة فيفا
 */
export function calculateOverall(position: PlayerPosition, stats: PlayerStats): number {
  if (position === 'GK') {
    const s = stats as GoalkeeperStats;
    const weighted =
      s.ref * 0.30 +
      s.div * 0.25 +
      s.pos * 0.20 +
      s.han * 0.15 +
      s.kic * 0.08 +
      s.spd * 0.02;
    return Math.round(Math.min(99, Math.max(40, weighted)));
  }

  const s = stats as FieldPlayerStats;
  let weighted = 50;

  switch (position) {
    case 'ST':
      weighted = s.sho * 0.40 + s.pac * 0.25 + s.dri * 0.15 + s.phy * 0.12 + s.pas * 0.08;
      break;
    case 'LW':
    case 'RW':
      weighted = s.pac * 0.38 + s.dri * 0.27 + s.pas * 0.15 + s.sho * 0.15 + s.phy * 0.05;
      break;
    case 'CAM':
      weighted = s.pas * 0.35 + s.dri * 0.30 + s.sho * 0.18 + s.pac * 0.12 + s.phy * 0.05;
      break;
    case 'CM':
      weighted = s.pas * 0.30 + s.dri * 0.20 + s.phy * 0.20 + s.def * 0.15 + s.sho * 0.10 + s.pac * 0.05;
      break;
    case 'CDM':
      weighted = s.def * 0.38 + s.phy * 0.32 + s.pas * 0.18 + s.pac * 0.08 + s.dri * 0.04;
      break;
    case 'CB':
      weighted = s.def * 0.45 + s.phy * 0.32 + s.pac * 0.15 + s.pas * 0.08;
      break;
    case 'LB':
    case 'RB':
      weighted = s.pac * 0.32 + s.def * 0.30 + s.phy * 0.18 + s.pas * 0.15 + s.dri * 0.05;
      break;
    default:
      weighted = (s.pac + s.sho + s.pas + s.dri + s.def + s.phy) / 6;
  }

  return Math.round(Math.min(99, Math.max(40, weighted)));
}

/**
 * نظام مكافحة التقييم الكيدي (Anti-Toxicity Engine):
 * يستبعد التقييمات الشاذة أو الانتقامية إذا كانت بعيدة جداً عن متوسط تقييمات باقي الزملاء
 */
export function filterToxicRatings(ratings: number[]): { cleanRatings: number[]; hadToxicRating: boolean } {
  if (ratings.length < 3) {
    return { cleanRatings: ratings, hadToxicRating: false };
  }

  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  // التقييمات التي تنحرف بأكثر من 3.5 درجات عن المتوسط تعتبر شاذة وتلغى حماية للاعب
  const clean = ratings.filter((r) => Math.abs(r - avg) <= 3.5);
  return {
    cleanRatings: clean.length > 0 ? clean : ratings,
    hadToxicRating: clean.length !== ratings.length,
  };
}

/**
 * تحديد مظهر ولون بطاقة فيفا
 */
export function getCardTier(overall: number, isTOTW = false): 'bronze' | 'silver' | 'gold' | 'totw' {
  if (isTOTW) return 'totw';
  if (overall >= 75) return 'gold';
  if (overall >= 65) return 'silver';
  return 'bronze';
}

/**
 * معادلة التقييم الأعمى الذكية في كابتن جدة:
 * - نقطة التعادل الطبيعي = 6.0
 * - إذا كان التقييم R > 6.0 : الزيادة = (R - 6.0) * 3 (إيجابي مضاعف)
 * - إذا كان التقييم R < 6.0 : الخصم = (6.0 - R) * -1.5 (سلبي)
 */
export function applyMatchRating(
  player: Player,
  rawRatings: number[],
  highlightedSkillKey?: string
): { updatedPlayer: Player; discardedToxicVotes: boolean } {
  const { cleanRatings, hadToxicRating } = filterToxicRatings(rawRatings);
  const averageRating = cleanRatings.reduce((a, b) => a + b, 0) / cleanRatings.length;

  const baseLine = 6.0;
  const delta = averageRating - baseLine;

  let pointsDelta = 0;
  if (delta > 0) {
    pointsDelta = delta * 3.0; // زيادة مضاعفة ضرب 3
  } else if (delta < 0) {
    pointsDelta = delta * 1.5; // خصم بمعدل 1.5
  }

  const isGK = player.position === 'GK';
  const newStats = { ...player.stats } as any;

  const statKeys = isGK 
    ? ['div', 'han', 'kic', 'ref', 'spd', 'pos']
    : ['pac', 'sho', 'pas', 'dri', 'def', 'phy'];

  if (highlightedSkillKey && statKeys.includes(highlightedSkillKey)) {
    const mainShare = pointsDelta * 0.5;
    const secondaryShare = (pointsDelta * 0.5) / (statKeys.length - 1);

    statKeys.forEach((key) => {
      if (key === highlightedSkillKey) {
        newStats[key] = Math.min(99, Math.max(40, Math.round((newStats[key] + mainShare) * 10) / 10));
      } else {
        newStats[key] = Math.min(99, Math.max(40, Math.round((newStats[key] + secondaryShare) * 10) / 10));
      }
    });
  } else {
    const evenShare = pointsDelta / statKeys.length;
    statKeys.forEach((key) => {
      newStats[key] = Math.min(99, Math.max(40, Math.round((newStats[key] + evenShare) * 10) / 10));
    });
  }

  const newOverall = calculateOverall(player.position, newStats);
  const newTier = getCardTier(newOverall, player.cardTier === 'totw');

  const rawUpdated: Player = {
    ...player,
    overall: newOverall,
    stats: newStats,
    cardTier: newTier,
    matchesPlayed: player.matchesPlayed + 1,
    ratingHistory: [
      {
        matchId: `match-${Date.now()}`,
        date: 'اليوم بجدة',
        rating: Math.round(averageRating * 10) / 10,
        deltaPoints: Math.round(pointsDelta * 10) / 10,
        evaluatedByCount: cleanRatings.length,
      },
      ...player.ratingHistory,
    ],
  };

  const updatedPlayer = syncPlayerBadges(rawUpdated);

  return {
    updatedPlayer,
    discardedToxicVotes: hadToxicRating,
  };
}

export const FIELD_SKILLS_INFO: Record<string, { label: string; code: string; iconBadge: string }> = {
  pac: { label: 'السرعة', code: 'PAC', iconBadge: '⚡ سهم نفاثة' },
  sho: { label: 'التسديد', code: 'SHO', iconBadge: '🎯 قناص أهداف' },
  pas: { label: 'التمرير', code: 'PAS', iconBadge: '🪄 مهندس التمريرات' },
  dri: { label: 'المراوغة', code: 'DRI', iconBadge: '✨ ساحر ومراوغ' },
  def: { label: 'الدفاع', code: 'DEF', iconBadge: '🛡️ صخرة دفاعية' },
  phy: { label: 'اللياقة والبدنية', code: 'PHY', iconBadge: '💪 وحش بدني' },
};

export const GK_SKILLS_INFO: Record<string, { label: string; code: string; iconBadge: string }> = {
  div: { label: 'الارتماء والقفز', code: 'DIV', iconBadge: '🦅 طيران وتصدي' },
  han: { label: 'الإمساك والتثبيت', code: 'HAN', iconBadge: '🧤 قفاز فولاذي' },
  kic: { label: 'الركل والتوزيع', code: 'KIC', iconBadge: '🎯 دقة في التمرير' },
  ref: { label: 'ردة الفعل السريعة', code: 'REF', iconBadge: '⚡ ردة فعل خارقة' },
  spd: { label: 'سرعة الخروج', code: 'SPD', iconBadge: '🏃 خروج حاسم' },
  pos: { label: 'التمركز والقيادة', code: 'POS', iconBadge: '🧠 حارس قائد' },
};

export const JEDDAH_NEIGHBORHOODS = [
  'حي الحمدانية',
  'حي أبحر الشمالية',
  'حي أبحر الجنوبية',
  'حي السامر',
  'حي الصفا',
  'حي المرجان',
  'حي الشاطئ',
  'حي الروضة',
  'حي النعيم',
  'حي البساتين',
  'حي المحمدية',
  'مخططات شرق جدة',
  'حي النسيم',
  'حي السليمانية',
];
