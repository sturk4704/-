import { Player, DynamicBadge, BadgeRarity, FieldPlayerStats, GoalkeeperStats } from '../types';

export interface BadgeEvaluationResult {
  badge: DynamicBadge;
  isUnlocked: boolean;
  progressPercent: number;
}

/**
 * الأنماط اللونية لكل فئة ندرة لشارات الهوية الرقمية
 */
export const RARITY_STYLES: Record<BadgeRarity, {
  label: string;
  badgeBg: string;
  badgeBorder: string;
  glow: string;
  textColor: string;
  gradientText: string;
  tagColor: string;
}> = {
  legendary: {
    label: 'أسطوري',
    badgeBg: 'bg-gradient-to-r from-amber-500/25 via-yellow-400/30 to-amber-600/25',
    badgeBorder: 'border-yellow-400',
    glow: 'shadow-yellow-400/50 shadow-lg',
    textColor: 'text-yellow-300',
    gradientText: 'from-amber-300 via-yellow-200 to-amber-400',
    tagColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
  },
  diamond: {
    label: 'ماسي',
    badgeBg: 'bg-gradient-to-r from-cyan-500/25 via-sky-400/30 to-blue-500/25',
    badgeBorder: 'border-cyan-400',
    glow: 'shadow-cyan-400/40 shadow-md',
    textColor: 'text-cyan-300',
    gradientText: 'from-cyan-300 via-sky-200 to-blue-300',
    tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
  },
  gold: {
    label: 'ذهبي',
    badgeBg: 'bg-gradient-to-r from-[#d4af37]/25 via-[#f5d77f]/30 to-[#c59b27]/25',
    badgeBorder: 'border-[#d4af37]',
    glow: 'shadow-[#d4af37]/40 shadow-md',
    textColor: 'text-[#f5d77f]',
    gradientText: 'from-[#f5d77f] via-amber-200 to-[#d4af37]',
    tagColor: 'bg-[#d4af37]/20 text-[#f5d77f] border-[#d4af37]/40',
  },
  silver: {
    label: 'فضي',
    badgeBg: 'bg-gradient-to-r from-slate-400/20 via-slate-200/25 to-slate-400/20',
    badgeBorder: 'border-slate-300',
    glow: 'shadow-slate-300/30 shadow-sm',
    textColor: 'text-slate-200',
    gradientText: 'from-white via-slate-200 to-slate-400',
    tagColor: 'bg-slate-700/50 text-slate-200 border-slate-500/40',
  },
  bronze: {
    label: 'برونزي',
    badgeBg: 'bg-gradient-to-r from-amber-800/20 via-amber-700/25 to-amber-900/20',
    badgeBorder: 'border-amber-700/60',
    glow: 'shadow-amber-900/20 shadow-sm',
    textColor: 'text-amber-300',
    gradientText: 'from-amber-200 via-amber-300 to-amber-500',
    tagColor: 'bg-amber-900/30 text-amber-300 border-amber-700/40',
  },
};

/**
 * محرك تحليل السجل التراكمي وطاقات اللاعب لمنح الشارات الرقمية تلقائياً
 */
export function analyzeAndGenerateDynamicBadges(player: Player): DynamicBadge[] {
  const isGK = player.position === 'GK';
  const stats = player.stats;
  const history = player.ratingHistory || [];
  const historyCount = history.length;

  const avgRating = historyCount > 0
    ? history.reduce((sum, h) => sum + h.rating, 0) / historyCount
    : player.overall / 10;

  const maxRating = historyCount > 0
    ? Math.max(...history.map((h) => h.rating))
    : 0;

  const fieldStats = !isGK ? (stats as FieldPlayerStats) : null;
  const gkStats = isGK ? (stats as GoalkeeperStats) : null;

  const badges: DynamicBadge[] = [];

  // إذا لم يخض اللاعب أي مباراة رسمية بعد، لا تُمنح له أي شارة مسبقة (الشارات تُكتسب بالمهارات والمباريات)
  if (player.matchesPlayed === 0 && historyCount === 0) {
    return [];
  }

  // 1. شارة: 'صخرة الدفاع' (Defense Rock)
  // تكتسب فقط عندما يتجاوز الدفاع 72 مع خوض 3 مباريات على الأقل أو تقييم دفاعي تراكمي قوي
  if (!isGK && fieldStats) {
    const def = fieldStats.def;
    const isDefPos = ['CB', 'LB', 'RB', 'CDM'].includes(player.position);
    const passesCriteria =
      (def >= 72 && (player.matchesPlayed >= 3 || historyCount >= 2)) ||
      (isDefPos && def >= 70 && avgRating >= 7.5 && historyCount >= 2);

    if (passesCriteria) {
      let rarity: BadgeRarity = 'bronze';
      if (def >= 84 || (def >= 80 && avgRating >= 8.0)) rarity = 'diamond';
      else if (def >= 78 || (def >= 74 && avgRating >= 7.5)) rarity = 'gold';
      else if (def >= 70) rarity = 'silver';

      badges.push({
        id: 'defense_rock',
        name: 'صخرة الدفاع',
        category: 'defense',
        icon: '🛡️',
        description: 'تُمنح تلقائياً للاعبين ذوي الحضور الدفاعي الصلب، والقدرة الاستثنائية على قطع الكرات وإحباط هجمات المنافسين.',
        criteriaMetReason: `طاقة دفاع ${def} DEF مع ثبات في التدخلات الدفاعية بالتقييم التراكمي (${avgRating.toFixed(1)}/10)`,
        rarity,
        glowColor: RARITY_STYLES[rarity].badgeBorder,
        isUnlocked: true,
        progressPercent: 100,
      });
    }
  }

  // 2. شارة: 'مايسترو الوسط' (Midfield Maestro)
  // تكتسب بتمرير 72+ ومراوغة 70+ مع مشاركة فعلية في 3 مباريات على الأقل
  if (!isGK && fieldStats) {
    const pas = fieldStats.pas;
    const dri = fieldStats.dri;
    const isMidPos = ['CM', 'CAM', 'CDM'].includes(player.position);
    const passesCriteria =
      ((pas >= 72 && dri >= 70) && (player.matchesPlayed >= 3 || historyCount >= 2)) ||
      (isMidPos && pas >= 70 && avgRating >= 7.6 && historyCount >= 2);

    if (passesCriteria) {
      let rarity: BadgeRarity = 'bronze';
      if (pas >= 84 || (pas >= 80 && dri >= 80)) rarity = 'diamond';
      else if (pas >= 78 || (pas >= 74 && dri >= 74)) rarity = 'gold';
      else if (pas >= 70) rarity = 'silver';

      badges.push({
        id: 'midfield_maestro',
        name: 'مايسترو الوسط',
        category: 'midfield',
        icon: '🪄',
        description: 'تُمنح لمهندسي وسط الميدان الذين يتحكمون في إيقاع اللعب بدقة التمرير وصناعة الفرص الحاسمة للزملاء.',
        criteriaMetReason: `دقة تمرير ${pas} PAS ومراوغة ${dri} DRI مع سيطرة في بناء الهجمات بالتقييم التراكمي`,
        rarity,
        glowColor: RARITY_STYLES[rarity].badgeBorder,
        isUnlocked: true,
        progressPercent: 100,
      });
    }
  }

  // 3. شارة: 'الهداف الحاسم' (Clutch Scorer)
  // تكتسب بتسديد 72+ مع خوض 3 مباريات وتقييم هجومي حاسم
  if (!isGK && fieldStats) {
    const sho = fieldStats.sho;
    const isAtkPos = ['ST', 'LW', 'RW', 'CAM'].includes(player.position);
    const passesCriteria =
      (sho >= 72 && (player.matchesPlayed >= 3 || historyCount >= 2)) ||
      (isAtkPos && sho >= 70 && maxRating >= 8.5 && historyCount >= 2);

    if (passesCriteria) {
      let rarity: BadgeRarity = 'bronze';
      if (sho >= 84 || (sho >= 80 && maxRating >= 9.0)) rarity = 'diamond';
      else if (sho >= 78 || (sho >= 72 && avgRating >= 7.8)) rarity = 'gold';
      else if (sho >= 70) rarity = 'silver';

      badges.push({
        id: 'clutch_scorer',
        name: 'الهداف الحاسم',
        category: 'attack',
        icon: '🎯',
        description: 'تُمنح للمهاجمين أصحاب اللمسة التهديفية القاتلة، الذين يحسمون المباريات بالتسديد المتقن أمام المرمى.',
        criteriaMetReason: `قوة وحسم تسديد ${sho} SHO مع تأثير تهديفي عالٍ في سجل التقييمات التراكمي`,
        rarity,
        glowColor: RARITY_STYLES[rarity].badgeBorder,
        isUnlocked: true,
        progressPercent: 100,
      });
    }
  }

  // 4. شارة: 'سهم نفاثة' (Jet Speed / Lightning Bolt)
  // تكتسب بسرعة 80+ وخوض مباراتين على الأقل
  if (!isGK && fieldStats) {
    const pac = fieldStats.pac;
    if (pac >= 80 && (player.matchesPlayed >= 2 || historyCount >= 1)) {
      let rarity: BadgeRarity = 'silver';
      if (pac >= 90) rarity = 'diamond';
      else if (pac >= 84) rarity = 'gold';

      badges.push({
        id: 'jet_speed',
        name: 'سهم نفاثة',
        category: 'attack',
        icon: '⚡',
        description: 'تُمنح للاعبين فائقي السرعة القادرين على تجاوز المنافسين بسباقات السرعة والانطلاقات الصاروخية.',
        criteriaMetReason: `معدل سرعة خارق ${pac} PAC وانطلاقات خاطفة في خطوط اللعب`,
        rarity,
        glowColor: RARITY_STYLES[rarity].badgeBorder,
        isUnlocked: true,
        progressPercent: 100,
      });
    }
  }

  // 5. شارة: 'قفاز فولاذي' (Steel Glove) - للحراس فقط
  // تتطلب مركز حارس وخوض 3 مباريات وردة فعل 72+
  if (isGK && gkStats) {
    const ref = gkStats.ref;
    const div = gkStats.div;
    const passesCriteria =
      (ref >= 72 || div >= 72) &&
      (player.matchesPlayed >= 3 || historyCount >= 2);

    if (passesCriteria) {
      let rarity: BadgeRarity = 'silver';
      if (player.overall >= 80 || ref >= 82) rarity = 'diamond';
      else if (player.overall >= 74 || ref >= 76) rarity = 'gold';

      badges.push({
        id: 'golden_glove',
        name: 'قفاز فولاذي',
        category: 'goalkeeper',
        icon: '🧤',
        description: 'تُمنح لحراس المرمى البارعين في حماية عرينهم بردود فعل مذهلة وتصديات تعجز مهاجمي الخصم.',
        criteriaMetReason: `ردة فعل ${ref} REF وارتماء ${div} DIV مع نظافة الشباك وتصديات بطولية`,
        rarity,
        glowColor: RARITY_STYLES[rarity].badgeBorder,
        isUnlocked: true,
        progressPercent: 100,
      });
    }
  }

  // 6. شارة: 'روح الكابيتانو' (Capitano Spirit) - الروح الرياضية والانضباط
  // تتطلب انضباط 95%+ وخوض 5 مباريات على الأقل
  if (player.disciplineScore >= 95 && (player.matchesPlayed >= 5 || historyCount >= 3)) {
    const rarity: BadgeRarity = player.disciplineScore >= 98 ? 'gold' : 'silver';
    badges.push({
      id: 'capitano_spirit',
      name: 'روح الكابيتانو',
      category: 'leadership',
      icon: '👑',
      description: 'تُمنح للقادة أصحاب الروح الرياضية الرفيعة والالتزام الصارم بالمواعيد وأخلاقيات كرة القدم في ملاعب جدة.',
      criteriaMetReason: `مؤشر انضباط وروح رياضية استثنائي ${player.disciplineScore}% مع حضور قيادي متواصل`,
      rarity,
      glowColor: RARITY_STYLES[rarity].badgeBorder,
      isUnlocked: true,
      progressPercent: 100,
    });
  }

  // 7. شارة: 'محرك الفريق' (Team Engine) - القوة واللياقة البدنية
  // تتطلب لياقة وقوة 74+ وخوض 5 مباريات
  if (!isGK && fieldStats) {
    const phy = fieldStats.phy;
    if (phy >= 74 && (player.matchesPlayed >= 5 || historyCount >= 3)) {
      const rarity: BadgeRarity = phy >= 82 ? 'gold' : 'silver';
      badges.push({
        id: 'team_engine',
        name: 'محرك الفريق',
        category: 'midfield',
        icon: '⚙️',
        description: 'تُمنح للاعبين ذوي الجهد البدني والقتالية العالية الذين لا يهدأون طوال دقائق المباراة.',
        criteriaMetReason: `طاقة بدنية ${phy} PHY ومعدل نشاط وقتالي في السجل التراكمي`,
        rarity,
        glowColor: RARITY_STYLES[rarity].badgeBorder,
        isUnlocked: true,
        progressPercent: 100,
      });
    }
  }

  // 8. شارة: 'نجم الأسبوع' (TOTW Star)
  // تتطلب الحصول على بطاقة TOTW أو تقييم 9.0+ في مباراة فعلية خاضها
  if (
    player.cardTier === 'totw' ||
    (historyCount >= 1 && (maxRating >= 9.0 || history[0]?.rating >= 9.0))
  ) {
    badges.push({
      id: 'totw_star',
      name: 'نجم الأسبوع',
      category: 'special',
      icon: '⭐',
      description: 'تُمنح للنخبة الذين انفجروا بأداء خارق في آخر مواجهاتهم وتصدروا قائمة نجوم الأسبوع في جدة.',
      criteriaMetReason: `نيل تقييم ناري استثنائي (${(maxRating || 9.2).toFixed(1)}/10) والتواجد في التشكيلة الأسبوعية`,
      rarity: 'diamond',
      glowColor: RARITY_STYLES.diamond.badgeBorder,
      isUnlocked: true,
      progressPercent: 100,
    });
  }

  // 9. شارة: 'موهبة صاعدة' (Rising Talent)
  // تتطلب فئة تحت 18 وخوض 3 مباريات على الأقل مع تقييم تراكمي 7.0+
  if (
    player.ageCategory === 'under_18' &&
    (player.matchesPlayed >= 3 || historyCount >= 2) &&
    avgRating >= 7.0
  ) {
    badges.push({
      id: 'rising_talent',
      name: 'موهبة صاعدة',
      category: 'special',
      icon: '🚀',
      description: 'تُمنح للوجوه الواعدة التي تبدأ مسيرتها الكروية الرقمية في كابتن جدة وتخطو خطواتها الأولى نحو الاحتراف.',
      criteriaMetReason: `بداية واعدة في الفئات السنية مع جاهزية للتطور السريع بنظام التقييم الأعمى (×3)`,
      rarity: 'bronze',
      glowColor: RARITY_STYLES.bronze.badgeBorder,
      isUnlocked: true,
      progressPercent: 100,
    });
  }

  // ترتيب الشارات بحيث تأتي الشارات الخاصة والماسية والذهبية أولاً
  const rarityRank: Record<BadgeRarity, number> = {
    legendary: 5,
    diamond: 4,
    gold: 3,
    silver: 2,
    bronze: 1,
  };

  return badges.sort((a, b) => rarityRank[b.rarity] - rarityRank[a.rarity]);
}

/**
 * تحليل شامل لجميع الشارات المتاحة في المنصة (المفتوحة والمغلقة) مع نسبة التقدم
 */
export function getFullBadgeCatalogWithProgress(player: Player): BadgeEvaluationResult[] {
  const unlocked = analyzeAndGenerateDynamicBadges(player);
  const unlockedIds = new Set(unlocked.map((b) => b.id));

  const isGK = player.position === 'GK';
  const stats = player.stats;
  const history = player.ratingHistory || [];
  const fieldStats = !isGK ? (stats as FieldPlayerStats) : null;
  const gkStats = isGK ? (stats as GoalkeeperStats) : null;

  // قائمة جميع الشارات القياسية
  const definitions: {
    id: string;
    name: string;
    category: DynamicBadge['category'];
    icon: string;
    description: string;
    targetRuleText: string;
    calcProgress: () => { progress: number; reason: string; rarity: BadgeRarity };
  }[] = [
    {
      id: 'defense_rock',
      name: 'صخرة الدفاع',
      category: 'defense',
      icon: '🛡️',
      description: 'تُمنح تلقائياً للاعبين ذوي الحضور الدفاعي الصلب والقدرة على استخلاص الكرات.',
      targetRuleText: 'يتطلب طاقة دفاع 72+ OVR أو أداء دفاعي تراكمي ثابت.',
      calcProgress: () => {
        if (isGK || !fieldStats) return { progress: 20, reason: 'مخصصة للاعبي الميدان والدفاع', rarity: 'bronze' };
        const p = Math.min(100, Math.round((fieldStats.def / 72) * 100));
        return {
          progress: p,
          reason: `طاقة الدفاع الحالية ${fieldStats.def} / الهدف 72`,
          rarity: fieldStats.def >= 78 ? 'gold' : 'silver',
        };
      },
    },
    {
      id: 'midfield_maestro',
      name: 'مايسترو الوسط',
      category: 'midfield',
      icon: '🪄',
      description: 'تُمنح لمهندسي وسط الميدان بدقة تمريرهم وصناعة اللعب والتحكم في إيقاع المباراة.',
      targetRuleText: 'يتطلب طاقة تمرير 72+ PAS أو مراوغة 76+ أو تقييمات وسط ميدان متقدمة.',
      calcProgress: () => {
        if (isGK || !fieldStats) return { progress: 20, reason: 'مخصصة للاعبي الوسط والميدان', rarity: 'bronze' };
        const p = Math.min(100, Math.round((Math.max(fieldStats.pas, fieldStats.dri) / 72) * 100));
        return {
          progress: p,
          reason: `طاقة التمرير الحالية ${fieldStats.pas} / الهدف 72`,
          rarity: fieldStats.pas >= 78 ? 'gold' : 'silver',
        };
      },
    },
    {
      id: 'clutch_scorer',
      name: 'الهداف الحاسم',
      category: 'attack',
      icon: '🎯',
      description: 'تُمنح للمهاجمين أصحاب اللمسة التهديفية القاتلة ودقة التسديد وحسم النتائج.',
      targetRuleText: 'يتطلب طاقة تسديد 72+ SHO أو تقييم هجومي تراكمي 7.4+ في المركز الهجومي.',
      calcProgress: () => {
        if (isGK || !fieldStats) return { progress: 20, reason: 'مخصصة للمهاجمين وصناع اللعب', rarity: 'bronze' };
        const p = Math.min(100, Math.round((fieldStats.sho / 72) * 100));
        return {
          progress: p,
          reason: `طاقة التسديد الحالية ${fieldStats.sho} / الهدف 72`,
          rarity: fieldStats.sho >= 78 ? 'gold' : 'silver',
        };
      },
    },
    {
      id: 'jet_speed',
      name: 'سهم نفاثة',
      category: 'attack',
      icon: '⚡',
      description: 'تُمنح للسرعة الخارقة والانطلاقات الصاروخية على الأطراف.',
      targetRuleText: 'يتطلب طاقة سرعة 78+ PAC.',
      calcProgress: () => {
        if (isGK || !fieldStats) return { progress: 30, reason: 'مخصصة للاعبي الميدان', rarity: 'bronze' };
        const p = Math.min(100, Math.round((fieldStats.pac / 78) * 100));
        return {
          progress: p,
          reason: `طاقة السرعة الحالية ${fieldStats.pac} / الهدف 78`,
          rarity: fieldStats.pac >= 82 ? 'gold' : 'silver',
        };
      },
    },
    {
      id: 'golden_glove',
      name: 'قفاز فولاذي',
      category: 'goalkeeper',
      icon: '🧤',
      description: 'تُمنح لحراس المرمى لتصدياتهم الحاسمة وردود أفعالهم الذكية.',
      targetRuleText: 'مخصصة لحراس المرمى (GK) بمعدل طاقة 65+ أو ردة فعل 68+.',
      calcProgress: () => {
        if (!isGK || !gkStats) return { progress: 0, reason: 'خاصة بحراس المرمى فقط', rarity: 'bronze' };
        const p = Math.min(100, Math.round((gkStats.ref / 68) * 100));
        return {
          progress: p,
          reason: `ردة فعل الحارس الحالية ${gkStats.ref} / الهدف 68`,
          rarity: player.overall >= 72 ? 'gold' : 'silver',
        };
      },
    },
    {
      id: 'capitano_spirit',
      name: 'روح الكابيتانو',
      category: 'leadership',
      icon: '👑',
      description: 'تُمنح للانضباط والروح القيادية في الملعب والأخلاق الرياضية.',
      targetRuleText: 'يتطلب درجة انضباط 94%+ ومشاركات متعددة في المباريات.',
      calcProgress: () => {
        const p = Math.min(100, Math.round((player.disciplineScore / 94) * 100));
        return {
          progress: p,
          reason: `الانضباط الحالي ${player.disciplineScore}% / المطلوب 94%`,
          rarity: player.disciplineScore >= 98 ? 'gold' : 'silver',
        };
      },
    },
    {
      id: 'team_engine',
      name: 'محرك الفريق',
      category: 'midfield',
      icon: '⚙️',
      description: 'تُمنح للياقة البدنية العالية والمجهود السخي طوال المباراة.',
      targetRuleText: 'يتطلب طاقة بدنية 72+ PHY أو خبرة مباريات متعددة.',
      calcProgress: () => {
        if (isGK || !fieldStats) return { progress: 30, reason: 'مخصصة للاعبي الميدان', rarity: 'bronze' };
        const p = Math.min(100, Math.round((fieldStats.phy / 72) * 100));
        return {
          progress: p,
          reason: `الطاقة البدنية الحالية ${fieldStats.phy} / الهدف 72`,
          rarity: fieldStats.phy >= 80 ? 'gold' : 'silver',
        };
      },
    },
    {
      id: 'totw_star',
      name: 'نجم الأسبوع',
      category: 'special',
      icon: '⭐',
      description: 'تُمنح للنخبة الذين ينالون تقييماً أعمى خارقاً يفوق 9.0 في مبارياتهم.',
      targetRuleText: 'يتطلب نيل تقييم أعمى 9.0+ في أي مباراة أو بطاقة TOTW.',
      calcProgress: () => {
        const top = history.length > 0 ? Math.max(...history.map((h) => h.rating)) : 0;
        const p = Math.min(100, Math.round((top / 9.0) * 100));
        return {
          progress: p,
          reason: `أعلى تقييم حققه ${top.toFixed(1)} / المطلوب 9.0`,
          rarity: 'diamond',
        };
      },
    },
    {
      id: 'rising_talent',
      name: 'موهبة صاعدة',
      category: 'special',
      icon: '🚀',
      description: 'تُمنح للنجوم الجدد في ملاعب جدة لتعزيز هويتهم الرقمية في بداية مسيرتهم.',
      targetRuleText: 'تُمنح للاعبين في الفئات السنية أو في أول 3 مباريات.',
      calcProgress: () => ({
        progress: 100,
        reason: 'متاحة للمواهب والناشئين في بداية انطلاقتهم',
        rarity: 'bronze',
      }),
    },
  ];

  return definitions.map((def) => {
    const existing = unlocked.find((u) => u.id === def.id);
    if (existing) {
      return {
        badge: existing,
        isUnlocked: true,
        progressPercent: 100,
      };
    }

    const { progress, reason, rarity } = def.calcProgress();
    return {
      badge: {
        id: def.id,
        name: def.name,
        category: def.category,
        icon: def.icon,
        description: def.description,
        criteriaMetReason: reason,
        rarity,
        glowColor: RARITY_STYLES[rarity].badgeBorder,
        isUnlocked: false,
        progressPercent: progress,
      },
      isUnlocked: false,
      progressPercent: progress,
    };
  });
}

/**
 * مزامنة الشارات الرقمية مع كائن اللاعب
 */
export function syncPlayerBadges(player: Player): Player {
  const dynamicBadges = analyzeAndGenerateDynamicBadges(player);
  return {
    ...player,
    dynamicBadges,
    badges: dynamicBadges.map((b) => `${b.icon} ${b.name}`),
  };
}
