import React, { useState, useEffect } from 'react';
import { Player, DynamicBadge } from '../types';
import { FifaCard } from './FifaCard';
import { PlayerPerformanceAnalytics } from './PlayerPerformanceAnalytics';
import {
  Award,
  Sparkles,
  Shield,
  Zap,
  CheckCircle2,
  Lock,
  TrendingUp,
  X,
  Activity,
  Flame,
  Trophy,
  Target,
  Compass,
  Star,
  LineChart as LineChartIcon,
  Share2,
  Download,
  Camera,
  UploadCloud,
} from 'lucide-react';
import {
  analyzeAndGenerateDynamicBadges,
  getFullBadgeCatalogWithProgress,
  RARITY_STYLES,
} from '../utils/dynamicBadgeEngine';
import { processImageFile } from '../utils/imageUploadHelper';

interface PlayerDigitalIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  onOpenSimulator?: (player: Player) => void;
  onOpenExport?: (player: Player) => void;
  onUpdatePlayerPhoto?: (playerId: string, newPhotoUrl: string) => void;
  initialTab?: 'analytics' | 'unlocked' | 'catalog' | 'history';
}

export const PlayerDigitalIdentityModal: React.FC<PlayerDigitalIdentityModalProps> = ({
  isOpen,
  onClose,
  player,
  onOpenSimulator,
  onOpenExport,
  onUpdatePlayerPhoto,
  initialTab = 'analytics',
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'unlocked' | 'catalog' | 'history'>(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen || !player) return null;

  const dynamicBadges = analyzeAndGenerateDynamicBadges(player);
  const fullCatalog = getFullBadgeCatalogWithProgress(player);

  const history = player.ratingHistory || [];
  const historyCount = history.length;
  const avgRating = historyCount > 0
    ? (history.reduce((s, h) => s + h.rating, 0) / historyCount).toFixed(1)
    : (player.overall / 10).toFixed(1);
  const maxRating = historyCount > 0
    ? Math.max(...history.map((h) => h.rating)).toFixed(1)
    : '7.0';
  const totalDeltaPoints = history.reduce((s, h) => s + h.deltaPoints, 0).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#0d1017] border border-[#222735] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-right">
        {/* رأس النافذة الملكي */}
        <div className="p-4 sm:p-6 bg-[#11141b] border-b border-[#222735] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#c59b27] via-[#f5d77f] to-[#9e7922] p-0.5 shadow-lg shadow-[#c59b27]/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#08090d] rounded-[14px] flex items-center justify-center">
                <Award className="w-5 h-5 text-[#f5d77f]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-['Changa',sans-serif] text-white">
                  لوحة تحكم وهوية اللاعب الرقمية
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#f5d77f] border border-[#d4af37]/35">
                  PLAYER DASHBOARD
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تحليلات الأداء المتقدمة، مسار تطور المهارات عبر 10 مباريات، والشارات التراكمية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#161a24] hover:bg-[#1f2433] text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* جسم النافذة */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* الجانب الأيمن: عرض بطاقة فيفا وإحصائيات الهوية */}
          <div className="lg:col-span-4 flex flex-col items-center justify-start space-y-4">
            <div className="transform scale-90 sm:scale-100 transition-transform">
              <FifaCard 
                player={player} 
                size="lg" 
                interactive={true} 
                showBadges={true} 
                onUpdatePhoto={(newPhoto) => onUpdatePlayerPhoto && onUpdatePlayerPhoto(player.id, newPhoto)}
              />
            </div>

            {/* أزرار الإجراء السريع */}
            <div className="w-full space-y-2">
              <button
                type="button"
                id="btn-modal-export-card"
                onClick={() => {
                  if (onOpenExport) {
                    onOpenExport(player);
                  }
                }}
                className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border border-[#d4af37]/60 bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#f5d77f] transition shadow-md"
              >
                <Share2 className="w-4 h-4 text-[#f5d77f]" />
                <span>تصدير ومشاركة البطاقة (PNG عالي الدقة)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition shadow-sm ${
                  activeTab === 'analytics'
                    ? 'bg-[#d4af37]/25 text-[#f5d77f] border-[#d4af37]/60 shadow-md'
                    : 'bg-[#161a24] text-slate-300 border-[#222735] hover:text-white hover:border-[#d4af37]/40'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-[#f5d77f]" />
                <span>تحليلات الأداء (آخر 10 مباريات)</span>
              </button>

              <label className="w-full gold-gradient-btn py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer transition active:scale-95">
                <Camera className="w-4 h-4 text-slate-950" />
                <span>تحديث صورتي الشخصية على البطاقة</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !player || !onUpdatePlayerPhoto) return;
                    try {
                      const dataUrl = await processImageFile(file, 400, 0.85);
                      onUpdatePlayerPhoto(player.id, dataUrl);
                    } catch (err) {
                      console.error('Error uploading photo:', err);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {/* بطاقة ملخص الهوية الرياضية التراكمية */}
            <div className="w-full bg-[#11141b] p-4 rounded-2xl border border-[#222735] space-y-3">
              <h4 className="text-xs font-bold text-[#f5d77f] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#d4af37]" />
                مؤشرات السجل التراكمي المعتمدة:
              </h4>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-[#08090d] p-2.5 rounded-xl border border-[#1c222e]">
                  <span className="text-[10px] text-slate-400 block">المباريات المقيمة</span>
                  <span className="text-base font-black text-white font-mono">{historyCount || player.matchesPlayed}</span>
                </div>
                <div className="bg-[#08090d] p-2.5 rounded-xl border border-[#1c222e]">
                  <span className="text-[10px] text-slate-400 block">متوسط التقييم</span>
                  <span className="text-base font-black text-emerald-400 font-mono">{avgRating} / 10</span>
                </div>
                <div className="bg-[#08090d] p-2.5 rounded-xl border border-[#1c222e]">
                  <span className="text-[10px] text-slate-400 block">أعلى تقييم أعمى</span>
                  <span className="text-base font-black text-[#f5d77f] font-mono">{maxRating}</span>
                </div>
                <div className="bg-[#08090d] p-2.5 rounded-xl border border-[#1c222e]">
                  <span className="text-[10px] text-slate-400 block">الانضباط والروح</span>
                  <span className="text-base font-black text-sky-400 font-mono">{player.disciplineScore}%</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-[#08090d] p-2.5 rounded-xl border border-[#1c222e] flex items-center justify-between">
                <span>إجمالي النقاط المكتسبة بمعادلة (×3):</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {Number(totalDeltaPoints) >= 0 ? `+${totalDeltaPoints}` : totalDeltaPoints} نقطة
                </span>
              </div>
            </div>
          </div>

          {/* الجانب الأيسر: تبويبات الشارات التراكمية والتفاصيل والتحليلات */}
          <div className="lg:col-span-8 space-y-4">
            {/* شريط التبويبات الداخلية */}
            <div className="flex items-center gap-2 bg-[#11141b] p-1.5 rounded-2xl border border-[#222735] flex-wrap sm:flex-nowrap">
              <button
                type="button"
                id="tab-btn-performance-analytics"
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'analytics'
                    ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LineChartIcon className="w-4 h-4 text-[#f5d77f]" />
                <span>تحليلات الأداء (السرعة، التمرير، الدفاع)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('unlocked')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'unlocked'
                    ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>الشارات ({dynamicBadges.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'catalog'
                    ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>دليل الشارات والتقدم ({fullCatalog.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>سجل التقييم ({historyCount})</span>
              </button>
            </div>

            {/* 0. شاشة تحليلات الأداء المتقدمة (Recharts) */}
            {activeTab === 'analytics' && (
              <PlayerPerformanceAnalytics player={player} />
            )}

            {/* 1. قائمة الشارات المكتسبة تلقائياً */}
            {activeTab === 'unlocked' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#11141b] rounded-2xl border border-[#222735] flex items-center justify-between text-xs text-slate-300">
                  <span>الشارات الممنوحة حالياً على بطاقة اللاعب:</span>
                  <span className="font-bold text-[#f5d77f] font-mono">{dynamicBadges.length} شارة نشطة</span>
                </div>

                {dynamicBadges.length === 0 ? (
                  <div className="p-8 text-center bg-[#11141b] rounded-3xl border border-[#222735] space-y-2">
                    <Lock className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="text-sm font-bold text-slate-300">لا توجد شارات مفتوحة بعد</p>
                    <p className="text-xs text-slate-500">
                      شارك في المباريات الودية ونل تقييمات أعمى إيجابية لتفتح شاراتك الأولى تلقائياً!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dynamicBadges.map((badge) => {
                      const rStyle = RARITY_STYLES[badge.rarity] || RARITY_STYLES.bronze;
                      return (
                        <div
                          key={badge.id}
                          className={`p-4 rounded-2xl border backdrop-blur-md transition-all duration-300 space-y-2.5 relative overflow-hidden ${rStyle.badgeBg} ${rStyle.badgeBorder} ${rStyle.glow}`}
                        >
                          {/* الرأس: الأيقونة والاسم وفئة الندرة */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl p-1.5 rounded-xl bg-black/40 border border-white/10">
                                {badge.icon}
                              </span>
                              <div>
                                <h4 className="font-bold text-sm text-white font-['Changa',sans-serif]">
                                  {badge.name}
                                </h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${rStyle.tagColor}`}>
                                  شارة {rStyle.label}
                                </span>
                              </div>
                            </div>
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          </div>

                          {/* الشرح */}
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {badge.description}
                          </p>

                          {/* سبب المنح بالتحليل التراكمي */}
                          <div className="p-2 rounded-xl bg-black/50 border border-white/10 text-[11px] text-[#f5d77f]">
                            <strong>تحليل السجل التراكمي:</strong> {badge.criteriaMetReason}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. دليل الشارات الكامل مع نسب التقدم */}
            {activeTab === 'catalog' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#11141b] rounded-2xl border border-[#222735] text-xs text-slate-300 leading-relaxed">
                  يحلل النظام بعد كل مباراة سجل تقييماتك التراكمي. بمجرد وصولك للمعيار المطلوب، تُمنح الشارة وتظهر على بطاقتك مباشرة!
                </div>

                <div className="space-y-2.5">
                  {fullCatalog.map((item) => {
                    const rStyle = RARITY_STYLES[item.badge.rarity] || RARITY_STYLES.bronze;
                    return (
                      <div
                        key={item.badge.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          item.isUnlocked
                            ? `${rStyle.badgeBg} ${rStyle.badgeBorder}`
                            : 'bg-[#11141b] border-[#222735] opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl p-2 rounded-xl bg-[#08090d] border border-[#222735]">
                              {item.badge.icon}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-white">
                                  {item.badge.name}
                                </h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${rStyle.tagColor}`}>
                                  {rStyle.label}
                                </span>
                                {item.isUnlocked && (
                                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                    مكتسبة ✓
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-1">
                                {item.badge.description}
                              </p>
                            </div>
                          </div>

                          <span className="font-mono text-xs font-black text-[#f5d77f] shrink-0">
                            {item.progressPercent}%
                          </span>
                        </div>

                        {/* شريط نسبة التقدم نحو فتح الشارة */}
                        <div className="mt-3 space-y-1">
                          <div className="w-full bg-[#08090d] h-2 rounded-full overflow-hidden border border-[#222735]">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                item.isUnlocked
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                  : 'bg-gradient-to-r from-[#d4af37] to-[#f5d77f]'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(8, item.progressPercent))}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>{item.badge.criteriaMetReason}</span>
                            <span>{item.isUnlocked ? 'مكتملة وممنوحة' : `${item.progressPercent}% نحو الفتح`}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. سجل التقييم الأعمى التراكمي للمباريات */}
            {activeTab === 'history' && (
              <div className="space-y-3">
                {history.length === 0 ? (
                  <div className="p-8 text-center bg-[#11141b] rounded-3xl border border-[#222735] space-y-2">
                    <Activity className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="text-sm font-bold text-slate-300">لا توجد مباريات مسجلة في السجل التراكمي بعد</p>
                    <p className="text-xs text-slate-500">
                      يتم تسجيل التقييمات تلقائياً بمجرد انتهاء مبارياتك وتأكيد تقييمات الزملاء (×3).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((h, i) => (
                      <div
                        key={h.matchId || i}
                        className="p-3.5 bg-[#11141b] rounded-2xl border border-[#222735] flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white font-mono">مباراة #{i + 1}</span>
                            <span className="text-[10px] text-slate-400">{h.date}</span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            تم التقييم أعمى بواسطة {h.evaluatedByCount} من الزملاء والخصوم
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <span className="text-[10px] text-slate-400 block">التقييم الأعمى</span>
                            <span className="text-sm font-black text-[#f5d77f] font-['Changa',sans-serif]">
                              {h.rating} / 10
                            </span>
                          </div>

                          <div className="text-center">
                            <span className="text-[10px] text-slate-400 block">فارق النقاط</span>
                            <span
                              className={`text-sm font-mono font-bold ${
                                h.deltaPoints > 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {h.deltaPoints > 0 ? `+${h.deltaPoints}` : h.deltaPoints}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
