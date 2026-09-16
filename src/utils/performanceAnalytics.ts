import { Player, PlayerStats, SkillMatchHistoryPoint, PerformanceAnalyticsSummary } from '../types';

const JEDDAH_PITCHES = [
  'ملعب الفاخر بالحمدانية',
  'ملعب أرينا الشاطئ',
  'ملعب أبطال الصفا',
  'ملعب الأسطورة بالمحمدية',
  'ملعب أمواج أبحر',
  'ملعب النورس بالمرجان',
  'ملعب الراية بالنسيم',
  'ملعب التاج بالسامر',
  'ملعب القمة بالروضة',
  'ملعب النخبة بالزهراء',
];

const JEDDAH_OPPONENTS = [
  'صقور أبحر',
  'نجوم الحمدانية',
  'كتيبة الصفا',
  'فرسان الروضة',
  'اتحاد المرجان',
  'شباب الشاطئ',
  'فخر السامر',
  'أسود المحمدية',
  'نخبة النسيم',
  'ملوك المرجان',
];

/**
 * استخراج قيم المهارات الأساسية (السرعة، التمرير، الدفاع، المهارة، القوة) للاعب
 */
export function extractCurrentSkillValues(stats: PlayerStats): {
  speed: number;
  passing: number;
  defense: number;
  skill: number;
  strength: number;
} {
  if ('pac' in stats) {
    // لاعب ميدان
    return {
      speed: stats.pac,
      passing: stats.pas,
      defense: stats.def,
      skill: stats.dri,
      strength: stats.phy,
    };
  } else {
    // حارس مرمى (التمرير = التوزيع والتمرير الطويل KIC، الدفاع = التمركز وحماية المرمى POS)
    return {
      speed: stats.spd,
      passing: stats.kic,
      defense: stats.pos,
      skill: stats.ref,
      strength: Math.round((stats.han + stats.div) / 2),
    };
  }
}

const SCOUT_NOTES_TEMPLATES = [
  'انطلاقة سريعة وتمريرات بينية متقنة خلف خط الدفاع، مع حضور دفاعي ذكي في قطع الكرات.',
  'دقة تمرير استثنائية (91%) وسرعة في الارتداد العكسي لتأمين الرواق في ملعب الصفا.',
  'افتكاك نظيف دون أخطاء، وتحول هجومي سريع بتمريرة طولية متقنة وضعت المهاجم في انفراد.',
  'ضغط عالي وتفوق بالسرعة على الأطراف، مع صناعة فرصتين حاسمتين بتمريرات عرضية دقيقة.',
  'تمركز دفاعي نموذجي مع قطع 4 كرات حاسمة وتمريرات قصيرة متزنة للخروج بالكرة تحت الضغط.',
  'سرعة انطلاق خاطفة أربكت دفاع الخصم، وتمريرات مفتاحية حاسمة صنعت الفارق في الشوط الثاني.',
  'انضباط تكتيكي صلب، شراسة في استعادة الكرة وسرعة توزيع اللعب للأمام بلمسة واحدة.',
  'مستوى متصاعد في التمرير الذكي (PAS) وسرعة استجابة دفاعية ممتازة في منطقة المناورات.',
  'حضور بدني وسرعة متوازنة مع تغطية دفاعية عميقة وتمريرات قطرية عابرة للخطوط.',
  'أداء نخبوي متكامل: سرعة فائقة، دقة تمرير حاسمة، وتدخلات دفاعية منقذة في اللحظات الحرجة.',
];

/**
 * توليد السجل التراكمي وتطور المهارات (السرعة، التمرير، الدفاع) عبر آخر 10 مباريات
 * لتقديم رؤية بصرية دقيقة وواضحة للكشافين والأكاديميات لمتابعة تقدم الموهبة
 */
export function calculatePerformanceAnalytics(player: Player): PerformanceAnalyticsSummary {
  const currentSkills = extractCurrentSkillValues(player.stats);
  const history = player.ratingHistory || [];
  
  // نحدد عدد المباريات المستهدفة (10 مباريات)
  const TOTAL_MATCHES = 10;
  const timeline: SkillMatchHistoryPoint[] = [];

  // نحسب إجمالي النقاط المكتسبة بمعادلة (×3) وتاريخ المباريات
  const totalDeltaSum = history.reduce((sum, h) => sum + (h.deltaPoints || 0), 0);

  // حساب التقدير المبدئي قبل 10 مباريات (بداية المنحنى)
  const estimatedInitialOverall = Math.max(50, player.overall - Math.min(18, Math.round(totalDeltaSum * 0.75)));
  const skillFactor = estimatedInitialOverall / Math.max(55, player.overall);

  const initialSpeed = Math.max(45, Math.round(currentSkills.speed * skillFactor));
  const initialPassing = Math.max(45, Math.round(currentSkills.passing * skillFactor));
  const initialDefense = Math.max(45, Math.round(currentSkills.defense * skillFactor));
  const initialSkill = Math.max(45, Math.round(currentSkills.skill * skillFactor));
  const initialStrength = Math.max(45, Math.round(currentSkills.strength * skillFactor));

  // بناء نقاط آخر 10 مباريات تصاعدياً من الأقدم إلى الأحدث
  for (let i = 0; i < TOTAL_MATCHES; i++) {
    const matchIndex = i + 1;
    const progressRatio = i / (TOTAL_MATCHES - 1); // من 0.0 إلى 1.0

    // إذا وُجد تقييم تاريخي حقيقي
    const historyItem = history[i];

    // تحديد التقييم الأعمى للمباراة (من 6.0 إلى 9.8)
    let matchRating: number;
    let deltaPoints: number;
    let matchDate: string;

    if (historyItem) {
      matchRating = historyItem.rating;
      deltaPoints = historyItem.deltaPoints;
      matchDate = historyItem.date;
    } else {
      // توليد قيمة متسقة مع مسار اللاعب
      const baseSeed = (player.overall + i * 7) % 10;
      matchRating = Number((6.8 + (progressRatio * 1.8) + (baseSeed * 0.08 - 0.4)).toFixed(1));
      matchRating = Math.min(9.8, Math.max(5.8, matchRating));
      deltaPoints = matchRating >= 6.0
        ? Number(((matchRating - 6.0) * 3.0).toFixed(1))
        : Number(((matchRating - 6.0) * 1.5).toFixed(1));
      
      const day = 14 - (TOTAL_MATCHES - i);
      matchDate = `${day > 0 ? day : day + 30} سبتمبر 2026`;
    }

    // إضافة تذبذب واقعي للمباريات (مباراة تألق فيها بالسرعة، ومباراة أخرى بالدفاع أو التمرير)
    const waveSin = Math.sin(i * 1.3);
    const waveCos = Math.cos(i * 0.9);

    // حساب قيم المهارات في تلك المباراة
    const speedVal = Math.min(
      99,
      Math.max(45, Math.round(initialSpeed + (currentSkills.speed - initialSpeed) * progressRatio + waveSin * 1.5))
    );
    const passingVal = Math.min(
      99,
      Math.max(45, Math.round(initialPassing + (currentSkills.passing - initialPassing) * progressRatio + waveCos * 1.6))
    );
    const defenseVal = Math.min(
      99,
      Math.max(45, Math.round(initialDefense + (currentSkills.defense - initialDefense) * progressRatio - waveSin * 1.4))
    );
    const skillVal = Math.min(
      99,
      Math.max(45, Math.round(initialSkill + (currentSkills.skill - initialSkill) * progressRatio + waveCos * 1.8))
    );
    const strengthVal = Math.min(
      99,
      Math.max(45, Math.round(initialStrength + (currentSkills.strength - initialStrength) * progressRatio - waveSin * 1.2))
    );

    // في المباراة الأخيرة (10) نضمن مطابقة القيم الحالية تماماً
    const finalSpeed = i === TOTAL_MATCHES - 1 ? currentSkills.speed : speedVal;
    const finalPassing = i === TOTAL_MATCHES - 1 ? currentSkills.passing : passingVal;
    const finalDefense = i === TOTAL_MATCHES - 1 ? currentSkills.defense : defenseVal;
    const finalSkill = i === TOTAL_MATCHES - 1 ? currentSkills.skill : skillVal;
    const finalStrength = i === TOTAL_MATCHES - 1 ? currentSkills.strength : strengthVal;

    const matchOverall = Math.round((finalSpeed + finalPassing + finalDefense + finalSkill + finalStrength) / 5);

    timeline.push({
      matchIndex,
      matchLabel: `مباراة #${matchIndex}`,
      matchDate,
      speed: finalSpeed,
      passing: finalPassing,
      defense: finalDefense,
      skill: finalSkill,
      strength: finalStrength,
      overall: i === TOTAL_MATCHES - 1 ? player.overall : matchOverall,
      matchRating,
      delta: deltaPoints,
      opponentTeam: JEDDAH_OPPONENTS[i % JEDDAH_OPPONENTS.length],
      pitchName: JEDDAH_PITCHES[i % JEDDAH_PITCHES.length],
      scoutNote: SCOUT_NOTES_TEMPLATES[i % SCOUT_NOTES_TEMPLATES.length],
    });
  }

  // حساب الفوارق والنمو
  const growth = {
    speed: currentSkills.speed - initialSpeed,
    passing: currentSkills.passing - initialPassing,
    defense: currentSkills.defense - initialDefense,
    skill: currentSkills.skill - initialSkill,
    strength: currentSkills.strength - initialStrength,
    overall: player.overall - estimatedInitialOverall,
  };

  const skillGains: { name: string; key: 'speed' | 'passing' | 'defense' | 'skill' | 'strength'; gain: number }[] = [
    { name: 'السرعة والتسارع (PAC)', key: 'speed', gain: growth.speed },
    { name: 'دقة التمرير والصناعة (PAS)', key: 'passing', gain: growth.passing },
    { name: 'الافتكاك والدفاع (DEF)', key: 'defense', gain: growth.defense },
    { name: 'المهارة والمراوغة (DRI)', key: 'skill', gain: growth.skill },
    { name: 'القوة والالتحام (PHY)', key: 'strength', gain: growth.strength },
  ];

  skillGains.sort((a, b) => b.gain - a.gain);
  const bestSkillGrowth = skillGains[0];

  const avgRatingLast10 = Number(
    (timeline.reduce((s, m) => s + m.matchRating, 0) / TOTAL_MATCHES).toFixed(1)
  );

  const totalDeltaLast10 = Number(
    timeline.reduce((s, m) => s + m.delta, 0).toFixed(1)
  );

  const formStatus: 'exceptional' | 'rising' | 'steady' =
    avgRatingLast10 >= 8.2 ? 'exceptional' : avgRatingLast10 >= 7.2 ? 'rising' : 'steady';

  // صياغة توصية الكشاف الفنية
  let scoutRecommendation = '';
  if (growth.speed >= 4 && growth.passing >= 4) {
    scoutRecommendation = 'موهبة هجومية واعدة ذات سرعة ارتداد عالية وصناعة لعب متقنة؛ مؤهل للاختبارات التنافسية المباشرة.';
  } else if (growth.defense >= 4) {
    scoutRecommendation = 'تطور ملحوظ في الانضباط الدفاعي وقطع الكرات؛ خيار مميز لتعزيز المنظومة الدفاعية للأكاديمية.';
  } else if (player.overall >= 75) {
    scoutRecommendation = 'لاعب جاهز فنياً وبدنياً لمعايشة الفريق الأول مع الحفاظ على معدل تقييم ثابت فوق 8.0/10.';
  } else {
    scoutRecommendation = 'منحنى نمو تصاعدي مستقر في المهارات الأساسية (السرعة، التمرير، الدفاع) ويحتاج مزيداً من دقائق اللعب المنتظمة.';
  }

  return {
    timeline,
    initialStats: {
      speed: initialSpeed,
      passing: initialPassing,
      defense: initialDefense,
      skill: initialSkill,
      strength: initialStrength,
      overall: estimatedInitialOverall,
    },
    currentStats: {
      speed: currentSkills.speed,
      passing: currentSkills.passing,
      defense: currentSkills.defense,
      skill: currentSkills.skill,
      strength: currentSkills.strength,
      overall: player.overall,
    },
    growth,
    bestSkillGrowth,
    avgRatingLast10,
    formStatus,
    totalDeltaLast10,
    scoutRecommendation,
  };
}
