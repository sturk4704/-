import React, { useState } from 'react';
import { Player, GoalkeeperStats, FieldPlayerStats, DynamicBadge } from '../types';
import { Trophy, Eye, Award, Info, X, AlertTriangle, Ban, CheckCircle, Share2, Download, Camera } from 'lucide-react';
import { analyzeAndGenerateDynamicBadges, RARITY_STYLES } from '../utils/dynamicBadgeEngine';

interface FifaCardProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  showBadges?: boolean;
  onClick?: () => void;
  onExport?: (player: Player) => void;
  onUpdatePhoto?: (newAvatarUrl: string) => void;
}

export const FifaCard: React.FC<FifaCardProps> = ({
  player,
  size = 'md',
  interactive = true,
  showBadges = true,
  onClick,
  onExport,
  onUpdatePhoto,
}) => {
  const [activeBadgeTooltip, setActiveBadgeTooltip] = useState<DynamicBadge | null>(null);
  const isGK = player.position === 'GK';

  const hasNoAvatar = !player.avatarUrl || 
    player.avatarUrl.trim() === '' || 
    player.avatarUrl.includes('photo-1534528741775-53994a69daeb');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl && onUpdatePhoto) {
        onUpdatePhoto(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // الشارات الرقمية الديناميكية المكتسبة تلقائياً من تحليل السجل التراكمي
  const dynamicBadges = player.dynamicBadges && player.dynamicBadges.length > 0
    ? player.dynamicBadges
    : analyzeAndGenerateDynamicBadges(player);

  // أنماط البطاقات حسب الفئة الملكية (برونزي، فضي، ذهبي ملكي، TOTW)
  const tierStyles = {
    bronze: {
      bg: 'from-[#28180c] via-[#482c16] to-[#120a05]',
      border: 'border-[#a0683a]/90',
      textPrimary: 'text-[#f5e6d8]',
      textSecondary: 'text-[#d6a57c]',
      badgeBg: 'bg-[#5c371b]/70',
      statColor: 'text-[#e8be99]',
      accentGlow: 'shadow-[#a0683a]/25',
      flagBorder: 'border-[#a0683a]',
    },
    silver: {
      bg: 'from-[#141923] via-[#283244] to-[#0d1017]',
      border: 'border-[#94a3b8]/90',
      textPrimary: 'text-[#f8fafc]',
      textSecondary: 'text-[#cbd5e1]',
      badgeBg: 'bg-[#334155]/70',
      statColor: 'text-[#e2e8f0]',
      accentGlow: 'shadow-[#64748b]/25',
      flagBorder: 'border-[#94a3b8]',
    },
    gold: {
      bg: 'from-[#382a08] via-[#7d6016] to-[#1c1504]',
      border: 'border-[#d4af37]',
      textPrimary: 'text-[#fae39b]',
      textSecondary: 'text-[#f5d77f]',
      badgeBg: 'bg-[#8c6b16]/70',
      statColor: 'text-[#fae39b]',
      accentGlow: 'shadow-[#d4af37]/35',
      flagBorder: 'border-[#d4af37]',
    },
    totw: {
      bg: 'from-[#080a0f] via-[#141824] to-[#040508]',
      border: 'border-[#f5d77f]',
      textPrimary: 'text-[#fae39b]',
      textSecondary: 'text-[#f5d77f]',
      badgeBg: 'bg-[#d4af37]/20',
      statColor: 'text-[#fae39b]',
      accentGlow: 'shadow-[#d4af37]/45 shadow-2xl',
      flagBorder: 'border-[#f5d77f]',
    },
  };

  const currentTier = tierStyles[player.cardTier] || tierStyles.bronze;

  // إحصائيات الست
  const statEntries = isGK
    ? [
        { label: 'DIV', value: (player.stats as GoalkeeperStats).div },
        { label: 'HAN', value: (player.stats as GoalkeeperStats).han },
        { label: 'KIC', value: (player.stats as GoalkeeperStats).kic },
        { label: 'REF', value: (player.stats as GoalkeeperStats).ref },
        { label: 'SPD', value: (player.stats as GoalkeeperStats).spd },
        { label: 'POS', value: (player.stats as GoalkeeperStats).pos },
      ]
    : [
        { label: 'PAC', value: (player.stats as FieldPlayerStats).pac },
        { label: 'SHO', value: (player.stats as FieldPlayerStats).sho },
        { label: 'PAS', value: (player.stats as FieldPlayerStats).pas },
        { label: 'DRI', value: (player.stats as FieldPlayerStats).dri },
        { label: 'DEF', value: (player.stats as FieldPlayerStats).def },
        { label: 'PHY', value: (player.stats as FieldPlayerStats).phy },
      ];

  const sizeClasses = {
    sm: 'w-44 h-72 text-xs',
    md: 'w-64 h-98 text-sm',
    lg: 'w-76 h-116 text-base',
  };

  return (
    <div
      id={`fifa-card-${player.id}`}
      onClick={interactive ? onClick : undefined}
      className={`relative select-none flex flex-col justify-between rounded-[2rem] p-4 bg-gradient-to-b ${currentTier.bg} border-2 ${currentTier.border} ${currentTier.accentGlow} shadow-2xl transition-all duration-300 ${
        interactive ? 'hover:scale-105 hover:-translate-y-2 cursor-pointer' : ''
      } ${sizeClasses[size]}`}
      style={{
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 92%, 50% 100%, 0% 92%)',
      }}
    >
      {/* خلفية زخرفية فيفا */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

      {/* الرأس: المعدل العام OVR والمركز ورقم القميص والحي */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex flex-col items-center">
          <span className={`font-black font-['Changa',sans-serif] leading-none text-3xl md:text-4xl ${currentTier.textPrimary}`}>
            {player.overall}
          </span>
          <span className={`font-black uppercase tracking-wider text-xs md:text-sm ${currentTier.textSecondary}`}>
            {player.position}
          </span>
          <div className="w-5 h-[1.5px] bg-[#d4af37]/60 my-1" />
          <span className="text-[10px] font-mono text-slate-200">#{player.number}</span>
          <span className="text-[9px] font-bold text-slate-300">{player.height}سم</span>
        </div>

        {/* الحي ورمز الكشافة وزر التصدير السريع */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            {onExport && (
              <button
                type="button"
                id={`btn-export-card-${player.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onExport(player);
                }}
                title="تصدير ومشاركة البطاقة كصورة PNG"
                className="no-export p-1 rounded-full bg-black/60 hover:bg-[#d4af37] text-slate-300 hover:text-black border border-[#d4af37]/40 transition shadow-md"
              >
                <Share2 className="w-3 h-3" />
              </button>
            )}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-[#f5d77f] border border-[#d4af37]/30">
              {player.neighborhood}
            </span>
          </div>
          {player.allowScoutVisibility ? (
            <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded flex items-center gap-1 border border-emerald-500/30">
              <Eye className="w-2.5 h-2.5 text-emerald-400" /> متاح للكشافة
            </span>
          ) : (
            <span className="text-[9px] font-bold text-slate-400 bg-black/50 px-1.5 py-0.5 rounded">
              خاص
            </span>
          )}
        </div>
      </div>

      {/* صورة اللاعب والدرع الأوسط */}
      <div className="relative z-10 flex flex-col items-center my-auto">
        <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-[#d4af37]/60 via-white/25 to-transparent shadow-xl group">
          {hasNoAvatar ? (
            <label
              title="انقر لرفع صورتك الشخصية على بطاقتك"
              className="w-full h-full rounded-full bg-[#0a0d14] border-2 border-dashed border-[#d4af37]/70 flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:border-[#f5d77f] hover:bg-[#121722] transition relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#f5d77f] mb-1 group-hover:scale-110 transition">
                <Camera className="w-4 h-4" />
              </div>
              <span className="text-[11px] md:text-xs font-black text-[#f5d77f] font-['Changa',sans-serif] tracking-tight leading-tight">
                أضف صورتك
              </span>
              <span className="text-[8px] text-slate-400 mt-0.5">
                انقر للرفع
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          ) : (
            <>
              <img
                src={player.avatarUrl}
                alt={player.name}
                className="w-full h-full rounded-full object-cover object-top border border-black/40"
              />
              {/* زر خيار تغيير الصورة عند التمرير */}
              {onUpdatePhoto && (
                <label
                  title="تغيير صورتك"
                  className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition p-1 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Camera className="w-4 h-4 text-[#f5d77f] mb-0.5" />
                  <span className="text-[9px] font-bold text-white">تغيير الصورة</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </>
          )}

          {player.cardTier === 'totw' && (
            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-[#d4af37] to-[#f5d77f] text-[#08090d] rounded-full p-1 shadow-lg">
              <Trophy className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* اسم اللاعب */}
        <h3 className={`mt-2 font-black font-['Changa',sans-serif] tracking-wide text-sm md:text-base text-center truncate max-w-full ${currentTier.textPrimary}`}>
          {player.name}
        </h3>
        <p className="text-[10px] text-slate-300 font-semibold truncate">
          {player.clubName}
        </p>

        {/* الشارات الرقمية التراكمية على وجه بطاقة فيفا */}
        {showBadges && dynamicBadges.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-1 max-w-full px-1">
            {dynamicBadges.slice(0, size === 'sm' ? 1 : 2).map((badge) => {
              const rStyle = RARITY_STYLES[badge.rarity] || RARITY_STYLES.bronze;
              return (
                <div
                  key={badge.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveBadgeTooltip(activeBadgeTooltip?.id === badge.id ? null : badge);
                  }}
                  title={`${badge.name}: ${badge.criteriaMetReason}`}
                  className={`group relative cursor-pointer px-2 py-0.5 rounded-full text-[10px] md:text-[11px] font-black flex items-center gap-1 border backdrop-blur-md transition-all duration-200 hover:scale-105 ${rStyle.badgeBg} ${rStyle.badgeBorder} ${rStyle.textColor} ${rStyle.glow}`}
                >
                  <span className="text-xs">{badge.icon}</span>
                  <span className="truncate max-w-[95px] font-bold">{badge.name}</span>
                </div>
              );
            })}
            {dynamicBadges.length > (size === 'sm' ? 1 : 2) && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveBadgeTooltip(dynamicBadges[size === 'sm' ? 1 : 2]);
                }}
                className="cursor-pointer text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/60 text-slate-300 border border-white/20 hover:border-[#f5d77f]"
              >
                +{dynamicBadges.length - (size === 'sm' ? 1 : 2)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* نافذة تفاصيل الشارة المنبثقة التفاعلية */}
      {activeBadgeTooltip && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-2 bottom-3 z-30 bg-[#080a0f]/95 border border-[#d4af37] rounded-2xl p-3 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 text-right"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-[#222735]">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{activeBadgeTooltip.icon}</span>
              <span className="font-bold text-xs text-white">{activeBadgeTooltip.name}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${RARITY_STYLES[activeBadgeTooltip.rarity].tagColor}`}>
                {RARITY_STYLES[activeBadgeTooltip.rarity].label}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveBadgeTooltip(null)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-slate-300 mt-1.5 leading-relaxed">
            {activeBadgeTooltip.description}
          </p>
          <div className="mt-2 p-1.5 rounded-lg bg-[#11141b] border border-[#222735] text-[9px] text-[#f5d77f]">
            <strong>تحليل السجل التراكمي:</strong> {activeBadgeTooltip.criteriaMetReason}
          </div>
        </div>
      )}

      {/* شبكة الإحصائيات الست (FIFA Attributes Grid) */}
      <div className="relative z-10 border-t border-white/20 pt-2 pb-5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-center font-mono">
          {statEntries.slice(0, 3).map((stat, idx) => (
            <React.Fragment key={stat.label}>
              <div className="flex justify-between items-center px-2">
                <span className={`font-black text-xs md:text-sm ${currentTier.statColor}`}>{stat.value}</span>
                <span className="text-[10px] font-bold text-slate-300/80">{stat.label}</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className={`font-black text-xs md:text-sm ${currentTier.statColor}`}>{statEntries[idx + 3].value}</span>
                <span className="text-[10px] font-bold text-slate-300/80">{statEntries[idx + 3].label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
