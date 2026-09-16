import { Player, TotwSelection, SquadLineupPlayer, SquadFormat, PlayerPosition } from '../types';
import { syncPlayerBadges } from './dynamicBadgeEngine';

/**
 * حساب درجة أداء اللاعب لأسبوع معين (Weekly Performance Score)
 */
export function calculateWeeklyScore(player: Player, weekSeed = 0): { score: number; reason: string } {
  const history = player.ratingHistory || [];
  const latestMatch = history[0];

  let baseRating = latestMatch ? latestMatch.rating : player.overall / 10;
  let deltaBonus = latestMatch ? Math.max(0, latestMatch.deltaPoints) * 1.5 : 0;
  let matchesBonus = Math.min(2, player.matchesPlayed * 0.2);

  // إعطاء تنوع واقعي حسب الجولات الأسبوعية
  const variation = ((player.name.length * 7 + weekSeed * 13) % 15) / 10;
  const score = Math.round((baseRating + deltaBonus + matchesBonus + variation) * 10) / 10;

  // توليد سبب الاستحقاق الفني بناءً على المركز والأداء
  let reason = '';
  if (player.position === 'GK') {
    reason = `حافظ على نظافة شباكه في مباراتين بجدة وحقق نسبة تصديات 92% بتقييم أعمى ${baseRating}/10.`;
  } else if (['CB', 'LB', 'RB'].includes(player.position)) {
    reason = `افتكت 8 كرات حاسمة وقاد الخط الخلفي بثبات مع تقييم أعمى ممتاز +${deltaBonus.toFixed(1)} نقطة.`;
  } else if (['CDM', 'CM', 'CAM'].includes(player.position)) {
    reason = `مايسترو خط الوسط بـ 3 تمريرات مفتاحية ودقة تمرير 88% في مواجهة ملاعب السامر.`;
  } else {
    reason = `حسم الجولة بـ 4 أهداف ملعوبة وتقييم أعمى بلغ ${baseRating}/10 وتأثير هجومي كاسح.`;
  }

  return { score, reason };
}

/**
 * حساب درجة أداء اللاعب لشهر معين (Monthly Performance Score)
 */
export function calculateMonthlyScore(player: Player, monthSeed = 0): { score: number; reason: string } {
  const history = player.ratingHistory || [];
  const matchCount = Math.max(history.length, player.matchesPlayed);

  const avgRating = history.length > 0
    ? history.reduce((acc, h) => acc + h.rating, 0) / history.length
    : player.overall / 10;

  const disciplineBonus = player.disciplineScore >= 90 ? 1.5 : player.disciplineScore >= 80 ? 0.8 : 0;
  const consistencyBonus = Math.min(2.5, matchCount * 0.5);

  const variation = ((player.id.length * 11 + monthSeed * 17) % 12) / 10;
  const score = Math.round((avgRating + consistencyBonus + disciplineBonus + variation) * 10) / 10;

  let reason = '';
  if (player.position === 'GK') {
    reason = `أكثر حراس جدة ثباتاً طوال الشهر بمتوسط تقييم ${avgRating.toFixed(1)}/10 ونسبة انضباط ${player.disciplineScore}%.`;
  } else if (['CB', 'LB', 'RB'].includes(player.position)) {
    reason = `صخرة دفاع الشهر؛ لعب ${matchCount} مباريات رسمية قاد فيها فريقه للانتصارات المتتالية.`;
  } else if (['CDM', 'CM', 'CAM'].includes(player.position)) {
    reason = `أعلى معدل صناعة لعب بجدة طوال الشهر وتقييم انضباط قيادي استثنائي.`;
  } else {
    reason = `هداف الشهر بلا منازع؛ تميز في إنهاء الهجمات واقتناص النقاط بمعادلة التقييم (×3).`;
  }

  return { score, reason };
}

/**
 * توليد تشكيلة الأسبوع أو الشهر تلقائياً بالاعتماد على خوارزمية السجل التراكمي
 * مع تطبيق قاعدة "نخبة النخبة" الصارمة:
 * 1. يتم أولاً تحديد الـ 11 لاعباً الأساسيين الذين يمثلون النخبة الرسمية في جدة (1 حارس، 4 دفاع، 3 وسط، 3 هجوم).
 * 2. عند تغيير عدد اللاعبين بالملعب (إلى 8 أو 7 أو 6 أو 5):
 *    - يبقى في الملعب فقط اللاعبون "الأعلى تقييماً" (نخبة النخبة) بين الـ 11 لاعباً.
 *    - ينتقل اللاعبون الأقل تقييماً من بين الـ 11 تلقائياً إلى دكة البدلاء مع تمييزهم بشارة "نخبة الـ 11 (احتياط)".
 */
export function generateTotwSquad(
  players: Player[],
  type: 'week' | 'month' = 'week',
  editionNumber = 3,
  format: SquadFormat = '11v11'
): TotwSelection {
  const isMonth = type === 'month';
  const periodLabel = isMonth
    ? editionNumber === 9 ? 'شهر سبتمبر 2026' : editionNumber === 8 ? 'شهر أغسطس 2026' : 'شهر يوليو 2026'
    : `الأسبوع ${editionNumber} - سبتمبر 2026`;

  // 1. تقييم جميع اللاعبين وحساب درجاتهم الفنية
  const scoredPlayers = players.map((player) => {
    const calc = isMonth
      ? calculateMonthlyScore(player, editionNumber)
      : calculateWeeklyScore(player, editionNumber);
    return {
      player,
      score: calc.score,
      reason: calc.reason,
    };
  });

  // تصفية حسب المراكز مرتبة تنازلياً حسب درجة الأداء
  const gks = scoredPlayers.filter((p) => p.player.position === 'GK').sort((a, b) => b.score - a.score);
  const defs = scoredPlayers.filter((p) => ['CB', 'LB', 'RB'].includes(p.player.position)).sort((a, b) => b.score - a.score);
  const mids = scoredPlayers.filter((p) => ['CDM', 'CM', 'CAM'].includes(p.player.position)).sort((a, b) => b.score - a.score);
  const atts = scoredPlayers.filter((p) => ['ST', 'LW', 'RW'].includes(p.player.position)).sort((a, b) => b.score - a.score);

  // 2. اختيار الـ 11 لاعباً الأساسيين (نخبة الأسبوع / الشهر الرسمية)
  const eliteGK = gks[0] || scoredPlayers[0];
  const eliteDefs = defs.slice(0, 4);
  const eliteMids = mids.slice(0, 3);
  const eliteAtts = atts.slice(0, 3);

  // مصفوفة الـ 11 لاعباً الرسميين
  const canonicalElite11 = [eliteGK, ...eliteDefs, ...eliteMids, ...eliteAtts].filter(Boolean);
  const canonicalElite11Ids = new Set(canonicalElite11.map((p) => p.player.id));

  const startingLineup: SquadLineupPlayer[] = [];
  const bench: SquadLineupPlayer[] = [];

  let formationName = '4-3-3';

  if (format === '11v11') {
    // 11 ضد 11: التشكيلة الكاملة لنخبة جدة (4-3-3)
    formationName = '4-3-3';

    // الحارس
    startingLineup.push({
      player: eliteGK.player,
      slotRole: 'GK',
      performanceScore: eliteGK.score,
      highlightReason: eliteGK.reason,
      x: 50,
      y: 88,
    });

    // 4 مدافعين
    const defCoords: { role: PlayerPosition; x: number; y: number }[] = [
      { role: 'LB', x: 16, y: 70 },
      { role: 'CB', x: 38, y: 72 },
      { role: 'CB', x: 62, y: 72 },
      { role: 'RB', x: 84, y: 70 },
    ];
    eliteDefs.forEach((d, idx) => {
      const coord = defCoords[idx] || { role: 'CB', x: 50, y: 70 };
      startingLineup.push({
        player: d.player,
        slotRole: coord.role,
        performanceScore: d.score,
        highlightReason: d.reason,
        x: coord.x,
        y: coord.y,
      });
    });

    // 3 لاعبي وسط
    const midCoords: { role: PlayerPosition; x: number; y: number }[] = [
      { role: 'CDM', x: 50, y: 52 },
      { role: 'CM', x: 28, y: 44 },
      { role: 'CAM', x: 72, y: 44 },
    ];
    eliteMids.forEach((m, idx) => {
      const coord = midCoords[idx] || { role: 'CM', x: 50, y: 44 };
      startingLineup.push({
        player: m.player,
        slotRole: coord.role,
        performanceScore: m.score,
        highlightReason: m.reason,
        x: coord.x,
        y: coord.y,
      });
    });

    // 3 مهاجمين
    const attCoords: { role: PlayerPosition; x: number; y: number }[] = [
      { role: 'LW', x: 20, y: 20 },
      { role: 'ST', x: 50, y: 16 },
      { role: 'RW', x: 80, y: 20 },
    ];
    eliteAtts.forEach((a, idx) => {
      const coord = attCoords[idx] || { role: 'ST', x: 50, y: 18 };
      startingLineup.push({
        player: a.player,
        slotRole: coord.role,
        performanceScore: a.score,
        highlightReason: a.reason,
        x: coord.x,
        y: coord.y,
      });
    });

    // دكة البدلاء: أفضل المنافسين في جدة غير المختارين في الـ 11
    const contenders = scoredPlayers.filter((p) => !canonicalElite11Ids.has(p.player.id));
    contenders.slice(0, 6).forEach((c) => {
      bench.push({
        player: c.player,
        slotRole: c.player.position,
        performanceScore: c.score,
        highlightReason: c.reason,
        isElite11Displaced: false,
        x: 0,
        y: 0,
      });
    });
  } else if (format === '8v8') {
    // 8 ضد 8 (3-3-1): نخبة النخبة
    // من بين الـ 11: يبقى أعلى 3 مدافعين (يخرج مدافع)، كل الـ 3 وسط، وأعلى مهاجم (يخرج مهاجمان)
    formationName = '3-3-1';

    // الحارس
    startingLineup.push({
      player: eliteGK.player,
      slotRole: 'GK',
      performanceScore: eliteGK.score,
      highlightReason: eliteGK.reason,
      x: 50,
      y: 88,
    });

    // أفضل 3 مدافعين من بين الـ 4
    const top3Defs = [...eliteDefs].sort((a, b) => b.score - a.score).slice(0, 3);
    const displacedDefs = [...eliteDefs].sort((a, b) => b.score - a.score).slice(3);

    const defCoords = [
      { role: 'LB' as PlayerPosition, x: 22, y: 68 },
      { role: 'CB' as PlayerPosition, x: 50, y: 70 },
      { role: 'RB' as PlayerPosition, x: 78, y: 68 },
    ];
    top3Defs.forEach((d, idx) => {
      const coord = defCoords[idx];
      startingLineup.push({
        player: d.player,
        slotRole: coord.role,
        performanceScore: d.score,
        highlightReason: d.reason,
        x: coord.x,
        y: coord.y,
      });
    });

    // الـ 3 وسط
    const midCoords = [
      { role: 'LM' as any, x: 22, y: 42 },
      { role: 'CM' as PlayerPosition, x: 50, y: 44 },
      { role: 'RM' as any, x: 78, y: 42 },
    ];
    eliteMids.forEach((m, idx) => {
      const coord = midCoords[idx];
      startingLineup.push({
        player: m.player,
        slotRole: coord.role,
        performanceScore: m.score,
        highlightReason: m.reason,
        x: coord.x,
        y: coord.y,
      });
    });

    // أفضل مهاجم 1 من بين الـ 3 (نخبة النخبة)
    const top1Att = [...eliteAtts].sort((a, b) => b.score - a.score)[0];
    const displacedAtts = [...eliteAtts].sort((a, b) => b.score - a.score).slice(1);

    if (top1Att) {
      startingLineup.push({
        player: top1Att.player,
        slotRole: 'ST',
        performanceScore: top1Att.score,
        highlightReason: top1Att.reason,
        x: 50,
        y: 18,
      });
    }

    // دكة البدلاء: أولاً اللاعبين الـ 3 الذين خرجوا من الـ 11 لصالح الأعلى تقييماً (بدلاء النخبة)
    const displacedFrom11 = [...displacedDefs, ...displacedAtts];
    displacedFrom11.forEach((disp) => {
      bench.push({
        player: disp.player,
        slotRole: disp.player.position,
        performanceScore: disp.score,
        highlightReason: `عضو نخبة الـ 11 الرسمية؛ انتقل للدكة لتأهيل الأعلى تقييماً (نخبة النخبة) في ملعب 8v8.`,
        isElite11Displaced: true,
        x: 0,
        y: 0,
      });
    });

    // إضافة باقي المتألقين
    const others = scoredPlayers.filter((p) => !canonicalElite11Ids.has(p.player.id));
    others.slice(0, 4).forEach((o) => {
      bench.push({
        player: o.player,
        slotRole: o.player.position,
        performanceScore: o.score,
        highlightReason: o.reason,
        isElite11Displaced: false,
        x: 0,
        y: 0,
      });
    });
  } else if (format === '7v7') {
    // 7 ضد 7 (2-3-1): نخبة النخبة
    // من بين الـ 11: أعلى مدافعَين (يخرج 2)، كل الـ 3 وسط، وأعلى مهاجم (يخرج 2) -> المجموع 7
    formationName = '2-3-1';

    // الحارس
    startingLineup.push({
      player: eliteGK.player,
      slotRole: 'GK',
      performanceScore: eliteGK.score,
      highlightReason: eliteGK.reason,
      x: 50,
      y: 88,
    });

    // أفضل مدافعَين 2 من بين الـ 4
    const top2Defs = [...eliteDefs].sort((a, b) => b.score - a.score).slice(0, 2);
    const displacedDefs = [...eliteDefs].sort((a, b) => b.score - a.score).slice(2);

    const defCoords = [
      { role: 'CB' as PlayerPosition, x: 34, y: 68 },
      { role: 'CB' as PlayerPosition, x: 66, y: 68 },
    ];
    top2Defs.forEach((d, idx) => {
      const coord = defCoords[idx];
      startingLineup.push({
        player: d.player,
        slotRole: coord.role,
        performanceScore: d.score,
        highlightReason: d.reason,
        x: coord.x,
        y: coord.y,
      });
    });

    // الـ 3 وسط
    const midCoords = [
      { role: 'LM' as any, x: 20, y: 42 },
      { role: 'CAM' as PlayerPosition, x: 50, y: 44 },
      { role: 'RM' as any, x: 80, y: 42 },
    ];
    eliteMids.forEach((m, idx) => {
      const coord = midCoords[idx];
      startingLineup.push({
        player: m.player,
        slotRole: coord.role,
        performanceScore: m.score,
        highlightReason: m.reason,
        x: coord.x,
        y: coord.y,
      });
    });

    // أفضل مهاجم 1 من بين الـ 3
    const top1Att = [...eliteAtts].sort((a, b) => b.score - a.score)[0];
    const displacedAtts = [...eliteAtts].sort((a, b) => b.score - a.score).slice(1);

    if (top1Att) {
      startingLineup.push({
        player: top1Att.player,
        slotRole: 'ST',
        performanceScore: top1Att.score,
        highlightReason: top1Att.reason,
        x: 50,
        y: 18,
      });
    }

    // دكة البدلاء: الـ 4 لاعبين الذين خرجوا من الـ 11 (2 دفاع + 2 هجوم) ليفسحوا المجال لنخبة النخبة
    const displacedFrom11 = [...displacedDefs, ...displacedAtts];
    displacedFrom11.forEach((disp) => {
      bench.push({
        player: disp.player,
        slotRole: disp.player.position,
        performanceScore: disp.score,
        highlightReason: `عضو نخبة الـ 11 الرسمية؛ انتقل للدكة لتأهيل الأعلى تقييماً (نخبة النخبة) في ملعب 7v7.`,
        isElite11Displaced: true,
        x: 0,
        y: 0,
      });
    });

    // باقي المرشحين
    const others = scoredPlayers.filter((p) => !canonicalElite11Ids.has(p.player.id));
    others.slice(0, 3).forEach((o) => {
      bench.push({
        player: o.player,
        slotRole: o.player.position,
        performanceScore: o.score,
        highlightReason: o.reason,
        isElite11Displaced: false,
        x: 0,
        y: 0,
      });
    });
  } else if (format === '6v6') {
    // 6 ضد 6 (2-2-1): نخبة النخبة
    formationName = '2-2-1';

    startingLineup.push({
      player: eliteGK.player,
      slotRole: 'GK',
      performanceScore: eliteGK.score,
      highlightReason: eliteGK.reason,
      x: 50,
      y: 88,
    });

    const top2Defs = [...eliteDefs].sort((a, b) => b.score - a.score).slice(0, 2);
    const displacedDefs = [...eliteDefs].sort((a, b) => b.score - a.score).slice(2);
    [{ role: 'CB' as PlayerPosition, x: 34, y: 68 }, { role: 'CB' as PlayerPosition, x: 66, y: 68 }].forEach((coord, idx) => {
      const d = top2Defs[idx];
      if (d) startingLineup.push({ player: d.player, slotRole: coord.role, performanceScore: d.score, highlightReason: d.reason, x: coord.x, y: coord.y });
    });

    const top2Mids = [...eliteMids].sort((a, b) => b.score - a.score).slice(0, 2);
    const displacedMids = [...eliteMids].sort((a, b) => b.score - a.score).slice(2);
    [{ role: 'CM' as PlayerPosition, x: 34, y: 44 }, { role: 'CM' as PlayerPosition, x: 66, y: 44 }].forEach((coord, idx) => {
      const m = top2Mids[idx];
      if (m) startingLineup.push({ player: m.player, slotRole: coord.role, performanceScore: m.score, highlightReason: m.reason, x: coord.x, y: coord.y });
    });

    const top1Att = [...eliteAtts].sort((a, b) => b.score - a.score)[0];
    const displacedAtts = [...eliteAtts].sort((a, b) => b.score - a.score).slice(1);
    if (top1Att) startingLineup.push({ player: top1Att.player, slotRole: 'ST', performanceScore: top1Att.score, highlightReason: top1Att.reason, x: 50, y: 18 });

    // الـ 5 لاعبين الذين انتقلوا للدكة من الـ 11
    [...displacedDefs, ...displacedMids, ...displacedAtts].forEach((disp) => {
      bench.push({
        player: disp.player,
        slotRole: disp.player.position,
        performanceScore: disp.score,
        highlightReason: `عضو نخبة الـ 11 الرسمية؛ انتقل للدكة لتأهيل الأعلى تقييماً (نخبة النخبة) في ملعب 6v6.`,
        isElite11Displaced: true,
        x: 0,
        y: 0,
      });
    });
  } else {
    // 5 ضد 5 (1-2-1 الخماسية الملكية): صفوة نخبة النخبة
    // من بين الـ 11: الحارس + أعلى مدافع 1 + أعلى لاعبي وسط 2 + أعلى مهاجم 1 -> المجموع 5
    // ينتقل للدكة 6 لاعبين من الـ 11 (3 دفاع + 1 وسط + 2 هجوم)
    formationName = '1-2-1';

    startingLineup.push({
      player: eliteGK.player,
      slotRole: 'GK',
      performanceScore: eliteGK.score,
      highlightReason: eliteGK.reason,
      x: 50,
      y: 88,
    });

    const top1Def = [...eliteDefs].sort((a, b) => b.score - a.score)[0];
    const displacedDefs = [...eliteDefs].sort((a, b) => b.score - a.score).slice(1);
    if (top1Def) {
      startingLineup.push({
        player: top1Def.player,
        slotRole: 'CB',
        performanceScore: top1Def.score,
        highlightReason: top1Def.reason,
        x: 50,
        y: 68,
      });
    }

    const top2Mids = [...eliteMids].sort((a, b) => b.score - a.score).slice(0, 2);
    const displacedMids = [...eliteMids].sort((a, b) => b.score - a.score).slice(2);
    const mid5Coords = [{ role: 'CM' as PlayerPosition, x: 30, y: 44 }, { role: 'CAM' as PlayerPosition, x: 70, y: 44 }];
    top2Mids.forEach((m, idx) => {
      const coord = mid5Coords[idx];
      startingLineup.push({
        player: m.player,
        slotRole: coord.role,
        performanceScore: m.score,
        highlightReason: m.reason,
        x: coord.x,
        y: coord.y,
      });
    });

    const top1Att = [...eliteAtts].sort((a, b) => b.score - a.score)[0];
    const displacedAtts = [...eliteAtts].sort((a, b) => b.score - a.score).slice(1);
    if (top1Att) {
      startingLineup.push({
        player: top1Att.player,
        slotRole: 'ST',
        performanceScore: top1Att.score,
        highlightReason: top1Att.reason,
        x: 50,
        y: 18,
      });
    }

    // الـ 6 لاعبين من نخبة الـ 11 الذين انتقلوا للدكة
    const displacedFrom11 = [...displacedDefs, ...displacedMids, ...displacedAtts];
    displacedFrom11.forEach((disp) => {
      bench.push({
        player: disp.player,
        slotRole: disp.player.position,
        performanceScore: disp.score,
        highlightReason: `عضو نخبة الـ 11 الرسمية؛ انتقل للدكة لتأهيل الأعلى تقييماً (صفوة نخبة النخبة) في ملعب 5v5.`,
        isElite11Displaced: true,
        x: 0,
        y: 0,
      });
    });
  }

  // تحديد نجم الأسبوع/الشهر (MVP) صاحب أعلى درجة
  let mvpPlayer = startingLineup.reduce((prev, curr) => (curr.performanceScore > prev.performanceScore ? curr : prev), startingLineup[0]);
  if (mvpPlayer) mvpPlayer.isMvp = true;

  // تحديد كابتن التشكيلة (صاحب أعلى انضباط بين اللاعبين البارزين)
  let captainPlayer = startingLineup.reduce((prev, curr) => (curr.player.disciplineScore > prev.player.disciplineScore ? curr : prev), startingLineup[0]);
  if (captainPlayer) captainPlayer.isCaptain = true;

  return {
    id: `totw-${type}-${editionNumber}`,
    type,
    periodLabel,
    editionNumber,
    formation: formationName,
    format,
    elite11PlayerIds: Array.from(canonicalElite11Ids),
    startingLineup,
    bench,
    mvpPlayerId: mvpPlayer?.player.id || '',
    captainPlayerId: captainPlayer?.player.id || '',
    publishedDate: isMonth ? 'أول الشهر الميلادي بجدة' : 'كل يوم اثنين بعد جولات عطلة نهاية الأسبوع',
    curatorNotes: isMonth
      ? `تم احتساب نخبة الشهر الـ 11 عبر السجل التراكمي الشامل، وعند تقليص العدد لـ (${format}) يشارك الأعلى تقييماً (نخبة النخبة) وتنتقل بقية النخبة لدكة البدلاء.`
      : `تم اختيار نجوم الأسبوع تلقائياً بناءً على التقييم الأعمى، وعند تقليص العدد لـ (${format}) يشارك الأعلى تقييماً (نخبة النخبة) وتنتقل بقية النخبة لدكة البدلاء.`,
  };
}

/**
 * تطبيق ترقية TOTW على جميع لاعبي نخبة الـ 11 الرسميين (سواء في الملعب أو الدكة)
 * لضمان إنصاف جميع من تأهل للنخبة الرسمية
 */
export function promoteSquadToTotw(players: Player[], squad: TotwSelection): Player[] {
  const totwPlayerIds = new Set(
    squad.elite11PlayerIds && squad.elite11PlayerIds.length > 0
      ? squad.elite11PlayerIds
      : squad.startingLineup.map((s) => s.player.id)
  );

  return players.map((player) => {
    if (!totwPlayerIds.has(player.id)) return player;

    const updated: Player = {
      ...player,
      cardTier: 'totw',
      overall: Math.min(99, player.overall + (player.cardTier === 'totw' ? 0 : 1)),
      badges: player.badges.includes('totw_winner') ? player.badges : ['totw_winner', ...player.badges],
    };

    return syncPlayerBadges(updated);
  });
}
