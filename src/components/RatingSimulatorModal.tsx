import React, { useState } from 'react';
import { Player } from '../types';
import { FifaCard } from './FifaCard';
import { applyMatchRating, FIELD_SKILLS_INFO, GK_SKILLS_INFO } from '../utils/cardRatingEngine';
import { Calculator, Sparkles, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface RatingSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  onSaveUpdatedPlayer: (updated: Player) => void;
}

export const RatingSimulatorModal: React.FC<RatingSimulatorModalProps> = ({
  isOpen,
  onClose,
  player,
  onSaveUpdatedPlayer,
}) => {
  const [matchRating, setMatchRating] = useState<number>(8.5);
  const [chosenSkill, setChosenSkill] = useState<string>(
    player.position === 'GK' ? 'ref' : 'sho'
  );

  if (!isOpen) return null;

  const isGK = player.position === 'GK';
  const skillsMap = isGK ? GK_SKILLS_INFO : FIELD_SKILLS_INFO;

  // معاينة اللاعب بعد تطبيق التقييم
  const { updatedPlayer: simulatedPlayer } = applyMatchRating(player, [matchRating], chosenSkill);

  const delta = matchRating - 6.0;
  const isPositive = delta > 0;
  const multiplier = isPositive ? 3.0 : 1.5;
  const deltaPoints = isPositive ? delta * 3.0 : delta * 1.5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#11141b] border border-[#222735] rounded-3xl shadow-2xl p-6 md:p-8 my-8 text-right">
        {/* هيدر المحاكي */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222735]">
          <div>
            <div className="flex items-center gap-2 text-[#f5d77f]">
              <span className="p-2 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/35">
                <Calculator className="w-5 h-5 text-[#f5d77f]" />
              </span>
              <h3 className="text-xl font-bold font-['Changa',sans-serif] text-white">
                محاكي معادلة فيفا الذكية (×3 للإيجابي / -1.5 للسلبي)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              شاهد بشكل حي ومباشر كيف تتطور بطاقة اللاعب وطاقاته عند نيل تقييم أعمى مرتفع أو منخفض!
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-xl bg-[#161a23]">✕</button>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* التحكم في التقييم والمعادلة */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-[#08090d] p-4 rounded-2xl border border-[#222735] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">تقييم الزملاء والمنافسين في المباراة:</span>
                <span className="text-xl font-black font-['Changa',sans-serif] text-[#f5d77f]">
                  {matchRating.toFixed(1)} / 10
                </span>
              </div>

              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.1"
                value={matchRating}
                onChange={(e) => setMatchRating(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#161a23] rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1.0 (سيء جداً)</span>
                <span className="text-[#f5d77f] font-bold">6.0 (نقطة التعادل)</span>
                <span>10.0 (أسطوري)</span>
              </div>
            </div>

            {/* بطاقة شرح المعادلة الحسابية */}
            <div className={`p-4 rounded-2xl border ${isPositive ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <div className="flex items-center gap-2 mb-2 font-bold text-xs">
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className={isPositive ? 'text-emerald-300' : 'text-red-300'}>
                  {isPositive ? 'تأثير إيجابي خارق (مضاعف ×3)' : 'تأثير سلبي وتراجع (-1.5)'}
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-1 font-mono leading-relaxed">
                <div>الفارق عن المعدل (6.0): <strong className="text-white">{delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}</strong></div>
                <div>
                  المعادلة: ({delta.toFixed(1)}) × {multiplier} ={' '}
                  <strong className={isPositive ? 'text-emerald-400' : 'text-red-400'}>
                    {deltaPoints > 0 ? `+${deltaPoints.toFixed(1)}` : deltaPoints.toFixed(1)} نقطة تطور
                  </strong>
                </div>
              </div>
            </div>

            {/* المهارة المستهدفة */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                المهارة المستهدفة بالحصة الأكبر (50% من الزيادة):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(skillsMap).map(([key, info]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setChosenSkill(key)}
                    className={`p-2 rounded-xl text-xs font-bold border transition text-center ${
                      chosenSkill === key
                        ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#f5d77f]'
                        : 'bg-[#08090d] border-[#222735] text-slate-400 hover:border-[#343d52]'
                    }`}
                  >
                    <div>{info.code}</div>
                    <div className="text-[10px] opacity-70 font-normal">{info.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* معاينة البطاقة بعد التقييم */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 bg-[#08090d] rounded-2xl border border-[#222735]">
            <div className="text-xs text-slate-400 font-bold mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#f5d77f]" />
              البطاقة الناتجة بعد احتساب المباراة:
            </div>

            <FifaCard player={simulatedPlayer} size="lg" interactive={false} showBadges={true} />

            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-slate-400">الطاقة السابقة:</span>
              <span className="text-sm font-bold text-slate-300">{player.overall}</span>
              <span className="text-slate-500">←</span>
              <span className="text-xs text-slate-400">الطاقة الجديدة:</span>
              <span className="text-base font-black text-[#f5d77f] font-['Changa',sans-serif]">
                {simulatedPlayer.overall} OVR
              </span>
            </div>

            {/* عرض الشارات الرقمية الناتجة عن المحاكاة */}
            {simulatedPlayer.dynamicBadges && simulatedPlayer.dynamicBadges.length > 0 && (
              <div className="mt-3 w-full p-2.5 rounded-xl bg-[#11141b] border border-[#222735] text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">
                  الشارات الرقمية المستحقة بناءً على هذه المحاكاة:
                </span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {simulatedPlayer.dynamicBadges.map((b) => (
                    <span
                      key={b.id}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-[#f5d77f] border border-[#d4af37]/40 flex items-center gap-1"
                    >
                      <span>{b.icon}</span>
                      <span>{b.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* أزرار الإجراء */}
          <div className="lg:col-span-12 flex justify-end gap-3 pt-4 border-t border-[#222735]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 text-xs font-bold hover:text-white"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => {
                onSaveUpdatedPlayer(simulatedPlayer);
                onClose();
              }}
              className="gold-gradient-btn px-6 py-2.5 rounded-xl text-xs md:text-sm flex items-center gap-2 shadow-lg"
            >
              <RefreshCw className="w-4 h-4 text-slate-950" />
              <span>تحديث بطاقة اللاعب بهذه النتيجة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
