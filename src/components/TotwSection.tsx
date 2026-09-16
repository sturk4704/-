import React, { useState, useMemo } from 'react';
import { Player, SquadFormat, TotwSelection, SquadLineupPlayer } from '../types';
import { generateTotwSquad, promoteSquadToTotw } from '../utils/totwEngine';
import { FifaCard } from './FifaCard';
import {
  Trophy,
  Crown,
  Calendar,
  Share2,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  Users,
  Award,
  Shield,
  Zap,
  Flame,
  Star,
  Info,
  Download,
} from 'lucide-react';

interface TotwSectionProps {
  players: Player[];
  onUpdatePlayers: (updatedPlayers: Player[]) => void;
  onSelectPlayer: (player: Player) => void;
  onShowToast: (msg: string) => void;
  onExportPlayer?: (player: Player) => void;
}

export const TotwSection: React.FC<TotwSectionProps> = ({
  players,
  onUpdatePlayers,
  onSelectPlayer,
  onShowToast,
  onExportPlayer,
}) => {
  const [selectionType, setSelectionType] = useState<'week' | 'month'>('week');
  const [edition, setEdition] = useState<number>(3); // أسبوع 3 أو شهر 9
  const [format, setFormat] = useState<SquadFormat>('11v11');
  const [selectedLineupPlayer, setSelectedLineupPlayer] = useState<SquadLineupPlayer | null>(null);
  const [copied, setCopied] = useState(false);

  // توليد التشكيلة الذكية ديناميكياً
  const currentSquad: TotwSelection = useMemo(() => {
    return generateTotwSquad(players, selectionType, edition, format);
  }, [players, selectionType, edition, format]);

  // اللاعب الأفضل (MVP)
  const mvp = useMemo(() => {
    return currentSquad.startingLineup.find((s) => s.isMvp) || currentSquad.startingLineup[0];
  }, [currentSquad]);

  // الكابتن
  const captain = useMemo(() => {
    return currentSquad.startingLineup.find((s) => s.isCaptain) || currentSquad.startingLineup[1];
  }, [currentSquad]);

  // نسخ ومشاركة التشكيلة للواتساب
  const handleShareSquad = () => {
    const title = selectionType === 'week' ? `⭐ تشكيلة الأسبوع الرسمية - كابتن جدة (${currentSquad.periodLabel})` : `👑 تشكيلة الشهر الرسمية - كابتن جدة (${currentSquad.periodLabel})`;
    const mvpText = mvp ? `\n🏆 نجم التشكيلة (MVP): ${mvp.player.name} (${mvp.player.clubName}) - تقييم ${mvp.performanceScore}/10` : '';
    const startingText = currentSquad.startingLineup
      .map((s, idx) => `${idx + 1}. [${s.slotRole}] ${s.player.name} (${s.player.overall} OVR) - ${s.player.clubName}`)
      .join('\n');
    const benchText = currentSquad.bench
      .map((b) => `• [${b.slotRole}] ${b.player.name} (${b.player.overall} OVR)`)
      .join('\n');

    const shareMessage = `${title}\n${mvpText}\n\n📋 التشكيلة الأساسية (${currentSquad.formation}):\n${startingText}\n\n🪑 دكة البدلاء المميزين:\n${benchText}\n\n✨ تم الاحتساب تلقائياً عبر نظام التقييم الأعمى والسجل التراكمي في كابتن جدة.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      onShowToast('تم نسخ تقرير التشكيلة بنجاح وجاهز للمشاركة في مجموعات الواتساب!');
    }
  };

  // تطبيق ترقية TOTW الملكية على الفائزين
  const handlePromoteSquad = () => {
    const updated = promoteSquadToTotw(players, currentSquad);
    onUpdatePlayers(updated);
    onShowToast(`تم بنجاح ترقية نجوم ${currentSquad.periodLabel} إلى بطاقة TOTW الملكية السوداء والذهبية!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* رأس الصفحة الملكي لاختيار الأسبوع أو الشهر */}
      <div className="bg-[#11141b] border border-[#222735] rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#c59b27] via-[#f5d77f] to-[#9e7922] p-0.5 shadow-lg shadow-[#c59b27]/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#08090d] rounded-[14px] flex items-center justify-center">
                {selectionType === 'week' ? (
                  <Star className="w-6 h-6 text-[#f5d77f]" />
                ) : (
                  <Crown className="w-6 h-6 text-[#f5d77f]" />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-['Changa',sans-serif] text-white">
                  {selectionType === 'week' ? 'تشكيلة الأسبوع (TOTW)' : 'تشكيلة الشهر (TOTM)'}
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#d4af37]/15 text-[#f5d77f] border border-[#d4af37]/40">
                  {currentSquad.periodLabel}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                تُختار النخبة تلقائياً عبر السجل التراكمي ونتائج التقييم الأعمى بعد كل جولة كروية بجدة
              </p>
            </div>
          </div>

          {/* أزرار التبديل والتحكم */}
          <div className="flex flex-wrap items-center gap-2">
            {/* التبديل بين الأسبوع والشهر */}
            <div className="flex items-center bg-[#08090d] p-1 rounded-2xl border border-[#222735]">
              <button
                type="button"
                onClick={() => {
                  setSelectionType('week');
                  setEdition(3);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectionType === 'week'
                    ? 'bg-[#d4af37] text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>تشكيلة الأسبوع</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectionType('month');
                  setEdition(9);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectionType === 'month'
                    ? 'bg-[#d4af37] text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>تشكيلة الشهر</span>
              </button>
            </div>

            {/* زر المشاركة */}
            <button
              type="button"
              onClick={handleShareSquad}
              className="px-3.5 py-2 rounded-xl bg-[#161a24] hover:bg-[#1e2332] border border-[#222735] text-slate-200 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              title="مشاركة التشكيلة عبر الواتساب"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#f5d77f]" />}
              <span>{copied ? 'تم النسخ!' : 'مشاركة التشكيلة'}</span>
            </button>

            {/* ترقية TOTW */}
            <button
              type="button"
              onClick={handlePromoteSquad}
              className="gold-gradient-btn px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>ترقية TOTW الملكية</span>
            </button>
          </div>
        </div>

        {/* شريط اختيار الجولة / الأسبوع أو الشهر ونمط الملعب */}
        <div className="mt-4 pt-4 border-t border-[#1a1f2c] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">أرشيف الجولات:</span>
            {selectionType === 'week' ? (
              <div className="flex items-center gap-1">
                {[3, 2, 1].map((wk) => (
                  <button
                    key={wk}
                    type="button"
                    onClick={() => setEdition(wk)}
                    className={`px-3 py-1 rounded-xl font-bold transition ${
                      edition === wk
                        ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/50'
                        : 'bg-[#08090d] text-slate-400 border border-[#222735] hover:text-white'
                    }`}
                  >
                    الأسبوع {wk}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {[
                  { num: 9, label: 'سبتمبر 2026' },
                  { num: 8, label: 'أغسطس 2026' },
                  { num: 7, label: 'يوليو 2026' },
                ].map((m) => (
                  <button
                    key={m.num}
                    type="button"
                    onClick={() => setEdition(m.num)}
                    className={`px-3 py-1 rounded-xl font-bold transition ${
                      edition === m.num
                        ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/50'
                        : 'bg-[#08090d] text-slate-400 border border-[#222735] hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">توزيع الملعب:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {[
                { fmt: '11v11' as SquadFormat, label: '11v11 (نخبة الـ 11)' },
                { fmt: '8v8' as SquadFormat, label: '8v8 (3-3-1)' },
                { fmt: '7v7' as SquadFormat, label: '7v7 (2-3-1)' },
                { fmt: '6v6' as SquadFormat, label: '6v6 (2-2-1)' },
                { fmt: '5v5' as SquadFormat, label: '5v5 (1-2-1 نخبة النخبة)' },
              ].map((f) => (
                <button
                  key={f.fmt}
                  type="button"
                  onClick={() => setFormat(f.fmt)}
                  className={`px-3 py-1 rounded-xl font-bold transition ${
                    format === f.fmt
                      ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/50 shadow-sm'
                      : 'bg-[#08090d] text-slate-400 border border-[#222735] hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* تنبيه نظام نخبة النخبة عند تقليص العدد */}
        {format !== '11v11' && (
          <div className="mt-3 p-3 bg-gradient-to-r from-[#d4af37]/15 via-[#161a24] to-[#08090d] rounded-2xl border border-[#d4af37]/30 flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#f5d77f] shrink-0" />
              <span className="text-slate-200">
                <strong className="text-[#f5d77f]">قاعدة نخبة النخبة مفعلة:</strong> تم اختيار الـ ({currentSquad.startingLineup.length}) لاعبين <strong>الأعلى تقييماً</strong> في مراكزهم من بين الـ 11 لاعباً الأساسيين، وانتقلت بقية النخبة تلقائياً إلى دكة البدلاء.
              </span>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f5d77f] text-[10px] font-black border border-[#d4af37]/30">
              {currentSquad.formation}
            </span>
          </div>
        )}
      </div>

      {/* قسم العرض الرئيسي: الملعب التكتيكي واللوحة الجانبية لنجم التشكيلة */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* الملعب الأخضر الاحترافي مع بطاقات TOTW */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="relative w-full aspect-[4/5] sm:aspect-[4/4.5] md:aspect-[4/4.2] bg-gradient-to-b from-[#0e3b1c] via-[#092913] to-[#04150a] rounded-3xl border-2 border-[#1e6130] shadow-2xl p-4 overflow-hidden select-none">
            {/* خطوط الملعب الكروي */}
            <div className="absolute inset-4 border border-white/25 rounded-2xl pointer-events-none" />
            {/* دائرة المنتصف وخط الوسط */}
            <div className="absolute top-1/2 left-4 right-4 h-px bg-white/25 -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 border border-white/25 rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/40 rounded-full pointer-events-none" />

            {/* منطقة جزاء الهجوم (الأعلى) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-52 sm:w-64 h-20 sm:h-24 border border-white/25 border-t-0 rounded-b-xl pointer-events-none" />
            {/* منطقة جزاء الدفاع (الأسفل) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-52 sm:w-64 h-20 sm:h-24 border border-white/25 border-b-0 rounded-t-xl pointer-events-none" />

            {/* شارة التشكيلة على أرضية الملعب */}
            <div className="absolute top-6 left-6 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 text-right">
              <span className="text-[10px] text-[#f5d77f] font-bold block">{currentSquad.periodLabel}</span>
              <span className="text-xs font-black text-white font-mono">{currentSquad.formation}</span>
            </div>

            {/* تنبيه الحالة الفارغة قبل بدء الجولات */}
            {currentSquad.startingLineup.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 bg-black/50 backdrop-blur-xs">
                <div className="w-14 h-14 rounded-2xl bg-[#08090d]/90 border border-[#d4af37]/40 flex items-center justify-center text-[#f5d77f] mb-3 shadow-xl">
                  <Crown className="w-7 h-7" />
                </div>
                <h3 className="text-white font-black text-base font-['Changa',sans-serif]">
                  بانتظار تقييمات أول جولة كروية لاختيار التشكيلة
                </h3>
                <p className="text-xs text-slate-300 max-w-sm mt-1 leading-relaxed">
                  تُفرز تشكيلة الأسبوع (TOTW) وتشكيلة الشهر ونجم الجولة (MVP) تلقائياً بناءً على تقييمات المباريات الحقيقية بملاعب جدة فور تسجيل اللاعبين.
                </p>
              </div>
            )}

            {/* بطاقات اللاعبين الموضوعة تكتيكياً على أرضية الملعب */}
            {currentSquad.startingLineup.map((lineupSlot) => {
              const isSelected = selectedLineupPlayer?.player.id === lineupSlot.player.id;
              const isMvp = lineupSlot.isMvp;
              const isCap = lineupSlot.isCaptain;

              return (
                <div
                  key={lineupSlot.player.id}
                  style={{
                    left: `${lineupSlot.x}%`,
                    top: `${lineupSlot.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onClick={() => setSelectedLineupPlayer(lineupSlot)}
                  className={`absolute z-20 cursor-pointer transition-all duration-300 hover:scale-110 ${
                    isSelected ? 'scale-115 z-30 ring-2 ring-[#f5d77f]' : ''
                  }`}
                >
                  {/* كرت فيفا مصغر بأسلوب TOTW الفاخر */}
                  <div className="relative w-16 sm:w-20 bg-gradient-to-b from-[#14151a] via-[#090a0d] to-[#040405] rounded-xl border border-[#d4af37] shadow-xl p-1 text-center group">
                    {/* شارة المركز والطاقة */}
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] sm:text-xs font-black text-[#f5d77f] font-['Changa',sans-serif]">
                        {lineupSlot.player.overall}
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-black text-slate-300">
                        {lineupSlot.slotRole}
                      </span>
                    </div>

                    {/* صورة اللاعب */}
                    <div className="relative mx-auto my-0.5 w-9 h-9 sm:w-11 sm:h-11 rounded-lg overflow-hidden border border-[#d4af37]/40 bg-[#12141c]">
                      <img
                        src={lineupSlot.player.avatarUrl}
                        alt={lineupSlot.player.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {isMvp && (
                        <div className="absolute top-0 right-0 bg-[#d4af37] p-0.5 rounded-bl shadow">
                          <Crown className="w-2.5 h-2.5 text-slate-950" />
                        </div>
                      )}
                      {isCap && !isMvp && (
                        <div className="absolute top-0 right-0 bg-rose-600 text-white text-[7px] font-black px-1 rounded-bl">
                          C
                        </div>
                      )}
                    </div>

                    {/* اسم اللاعب وناديه */}
                    <p className="text-[9px] sm:text-[10px] font-bold text-white truncate px-0.5">
                      {lineupSlot.player.name.split(' ')[0]}
                    </p>
                    <p className="text-[7px] sm:text-[8px] text-slate-400 truncate">
                      {lineupSlot.player.clubName}
                    </p>

                    {/* مؤشر تقييم الأسبوع */}
                    <div className="mt-0.5 bg-[#d4af37]/20 rounded py-0.2 px-0.5 text-[8px] font-bold text-[#f5d77f]">
                      ★ {lineupSlot.performanceScore}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* تنويه الشفافية */}
          <div className="mt-3 p-3 bg-[#11141b] rounded-2xl border border-[#222735] flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#f5d77f] shrink-0" />
              <span>انقر على أي لاعب بالملعب لعرض بطاقته الكاملة وسبب استحقاقه الفني.</span>
            </div>
            <span className="font-mono text-[#f5d77f] font-bold">11 لاعباً أساسياً</span>
          </div>
        </div>

        {/* الجانب الأيسر: تفاصيل اللاعب المحدد أو نجم الأسبوع (MVP Spotlight) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* بطاقة نجم التشكيلة / اللاعب المختار */}
          {(() => {
            const activeLineup = selectedLineupPlayer || mvp;
            if (!activeLineup) {
              return (
                <div className="bg-[#11141b] border border-[#222735] rounded-3xl p-6 shadow-xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#161a24] text-[#f5d77f] flex items-center justify-center mx-auto border border-[#222735]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white font-['Changa',sans-serif]">نجم التشكيلة (MVP)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    سيتم تتويج اللاعب الحائز على أعلى تقييم أعمى في الجولة هنا تلقائياً ومنحه البطاقة الملكية السوداء والذهبية.
                  </p>
                </div>
              );
            }

            return (
              <div className="bg-[#11141b] border border-[#222735] rounded-3xl p-5 shadow-xl space-y-4 text-right relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-[#1f2433]">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {activeLineup.isMvp ? '🏆' : activeLineup.isCaptain ? '👑' : '⭐'}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-white font-['Changa',sans-serif]">
                        {activeLineup.isMvp
                          ? selectionType === 'week' ? 'نجم الأسبوع (MVP)' : 'أسطورة الشهر (POTM)'
                          : activeLineup.isCaptain
                          ? 'قائد التشكيلة (Captain)'
                          : 'أحد نجوم التشكيلة الأساسية'}
                      </h3>
                      <span className="text-[10px] text-slate-400">
                        المركز في التشكيلة: {activeLineup.slotRole}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-black font-mono px-2.5 py-1 rounded-full bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/40">
                    تقييم: {activeLineup.performanceScore} / 10
                  </span>
                </div>

                {/* بطاقة فيفا الفاخرة للاعب المختار */}
                <div className="flex justify-center scale-95 transition-transform">
                  <FifaCard player={activeLineup.player} size="md" interactive={false} showBadges={true} />
                </div>

                {/* سبب الاستحقاق الفني */}
                <div className="bg-[#08090d] p-3.5 rounded-2xl border border-[#1f2433] space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-[#f5d77f] block">
                    تقرير اللجنة الفنية بالسجل التراكمي:
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {activeLineup.highlightReason}
                  </p>
                </div>

                {/* أزرار الإجراء */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectPlayer(activeLineup.player)}
                      className="w-full py-2.5 rounded-xl bg-[#161a24] hover:bg-[#1e2332] text-xs font-bold text-slate-200 border border-[#222735] hover:border-[#d4af37]/40 transition flex items-center justify-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5 text-[#f5d77f]" />
                      <span>الهوية والشارات</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = promoteSquadToTotw(players, currentSquad);
                        onUpdatePlayers(updated);
                        onShowToast(`تمت ترقية بطاقة اللاعب [ ${activeLineup.player.name} ] لفئة TOTW بنجاح!`);
                      }}
                      className="w-full gold-gradient-btn py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>ترقية فردية TOTW</span>
                    </button>
                  </div>

                  {onExportPlayer && (
                    <button
                      type="button"
                      id={`btn-totw-export-${activeLineup.player.id}`}
                      onClick={() => onExportPlayer(activeLineup.player)}
                      className="w-full py-2.5 rounded-xl bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#f5d77f] border border-[#d4af37]/50 text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#f5d77f]" />
                      <span>تصدير ومشاركة بطاقة نجم الأسبوع (PNG)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ملخص دكة البدلاء (Bench / Honorable Mentions) */}
          <div className="bg-[#11141b] border border-[#222735] rounded-3xl p-5 shadow-xl space-y-3 text-right">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#d4af37]" />
                <span>دكة بدلاء التشكيلة (الاحتياط):</span>
              </h4>
              <span className="text-[10px] text-slate-400">{currentSquad.bench.length} لاعبين</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {currentSquad.bench.map((benchSlot) => (
                <div
                  key={benchSlot.player.id}
                  onClick={() => setSelectedLineupPlayer(benchSlot)}
                  className="p-2.5 bg-[#08090d] hover:bg-[#141722] rounded-xl border border-[#1f2433] hover:border-[#d4af37]/40 cursor-pointer transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={benchSlot.player.avatarUrl}
                      alt={benchSlot.player.name}
                      className="w-8 h-8 rounded-lg object-cover border border-[#222735]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-white">{benchSlot.player.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/60 text-slate-300 border border-white/10">
                          {benchSlot.slotRole}
                        </span>
                        {benchSlot.isElite11Displaced && (
                          <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/40 font-bold flex items-center gap-1">
                            <Crown className="w-2.5 h-2.5" />
                            <span>نخبة الـ 11</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block">{benchSlot.player.clubName}</span>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className="text-xs font-black text-[#f5d77f] font-mono block">
                      ★ {benchSlot.performanceScore}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {benchSlot.player.overall} OVR
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
