import React, { useState, useMemo } from 'react';
import {
  Coins,
  Gift,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Calculator,
  Percent,
  Store,
  MapPin,
  Phone,
  Copy,
  Clock,
  Tag,
  Search,
  Award,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Info,
  QrCode,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  RewardItem,
  RewardCategory,
  CaptainCoinTransaction,
  RedeemedRewardVoucher,
  CAPTAIN_COINS_CONFIG,
} from '../types';
import { JEDDAH_SPORTS_PARTNERS } from '../data/mockRewards';

interface RewardsStoreSectionProps {
  userCoins: number;
  transactions: CaptainCoinTransaction[];
  vouchers: RedeemedRewardVoucher[];
  rewardItems: RewardItem[];
  onRedeemReward: (reward: RewardItem) => void;
  onSimulateMatchEarning?: () => void;
  onSimulateRatingEarning?: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const RewardsStoreSection: React.FC<RewardsStoreSectionProps> = ({
  userCoins,
  transactions,
  vouchers,
  rewardItems,
  onRedeemReward,
  onSimulateMatchEarning,
  onSimulateRatingEarning,
  onShowToast,
}) => {
  // Navigation tabs inside the store
  const [storeTab, setStoreTab] = useState<'catalog' | 'my_vouchers' | 'transactions' | 'calculator'>('catalog');
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<RewardCategory>('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected reward for redemption modal
  const [confirmingReward, setConfirmingReward] = useState<RewardItem | null>(null);
  const [newlyGeneratedVoucher, setNewlyGeneratedVoucher] = useState<RedeemedRewardVoucher | null>(null);

  // Economic simulator state (default 22 players, 10 SAR margin)
  const [simPlayersCount, setSimPlayersCount] = useState<number>(22);
  const [simRewardPercent, setSimRewardPercent] = useState<number>(25); // 25% default (between 20% and 30%)
  const [simBookingsCount, setSimBookingsCount] = useState<number>(10); // 10 matches simulation

  // Math calculations for the economic guardrail
  const platformMarginPerBooking = CAPTAIN_COINS_CONFIG.PLATFORM_COMMISSION_SAR; // 10 SAR
  const poolPerBookingSar = (platformMarginPerBooking * simRewardPercent) / 100; // e.g. 2.50 SAR
  const platformNetProfitPerBookingSar = platformMarginPerBooking - poolPerBookingSar; // 7.50 SAR
  const coinsPerPlayerInMatch = Math.floor((poolPerBookingSar * CAPTAIN_COINS_CONFIG.SAR_TO_COINS_RATIO) / simPlayersCount); // ~11 coins
  const totalCoinsDistributedPerBooking = coinsPerPlayerInMatch * simPlayersCount;

  // Filtered rewards
  const filteredRewards = useMemo(() => {
    return rewardItems.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchNeigh = selectedNeighborhood === 'all' || item.partnerNeighborhood.includes(selectedNeighborhood);
      const matchSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchNeigh && matchSearch;
    });
  }, [rewardItems, selectedCategory, selectedNeighborhood, searchQuery]);

  // Handle redemption trigger
  const handleInitiateRedeem = (reward: RewardItem) => {
    if (userCoins < reward.coinsRequired) {
      onShowToast(
        `رصيدك الحالي (${userCoins} كوينز) لا يكفي لاستبدال هذا الخصم. تحتاج ${reward.coinsRequired - userCoins} كوينز إضافية. العب أو قيّم مباراة لكسبها!`,
        'warning'
      );
      return;
    }
    setConfirmingReward(reward);
  };

  const handleConfirmRedeem = () => {
    if (!confirmingReward) return;
    onRedeemReward(confirmingReward);
    
    // Create new voucher representation for instant display
    const code = `JED-${confirmingReward.category.toUpperCase().slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newVoucher: RedeemedRewardVoucher = {
      id: `vch-${Date.now()}`,
      rewardId: confirmingReward.id,
      rewardTitle: confirmingReward.title,
      partnerName: confirmingReward.partnerName,
      partnerPhone: confirmingReward.partnerPhone,
      partnerNeighborhood: confirmingReward.partnerNeighborhood,
      partnerAddress: confirmingReward.partnerNeighborhood,
      voucherCode: code,
      coinsSpent: confirmingReward.coinsRequired,
      discountSummary: `خصم ${confirmingReward.discountValueSar} ريال عند الشراء`,
      redeemedAt: 'الآن',
      expiresAt: new Date(Date.now() + confirmingReward.expiresInDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
    };
    
    setNewlyGeneratedVoucher(newVoucher);
    setConfirmingReward(null);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onShowToast(`تم نسخ ${label}: ${text}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* 1. البانر الترحيبي ورصيد الكابتن كوينز */}
      <div className="bg-gradient-to-br from-[#121620] via-[#10131b] to-[#0c0f16] border border-[#d4af37]/35 rounded-2xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        {/* توهج خلفي ناعم */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f5d77f] text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Coins className="w-3.5 h-3.5 text-[#f5d77f]" />
                <span>متجر المكافآت وكابتن كوينز</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>نظام اقتصادي آمن 100% (صافي ربح المنصة محمي 70%-80%)</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              استبدل أداءك الكروي بخصومات حقيقية من متاجر جدة
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              كل مباراة تحجزها وتلعبها (22 لاعباً)، أو تقييم موضوعي تقدمه للحكام وزملائك يمنحك{' '}
              <strong className="text-[#f5d77f]">كابتن كوينز</strong> موثقة. استبدلها بكوبونات خصم فورية على الأحذية، القفازات، الأطقم وتخفيضات الملاعب من شركائنا في أحياء جدة!
            </p>

            {/* إيضاح المعادلة الاقتصادية في سطر سريع */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 bg-[#161a25] px-2.5 py-1 rounded-lg border border-[#222736]">
                <Calculator className="w-3 h-3 text-[#f5d77f]" />
                <span>حجز 22 لاعب = مكسب المنصة 10 ريال</span>
              </span>
              <span className="flex items-center gap-1 bg-[#161a25] px-2.5 py-1 rounded-lg border border-[#222736]">
                <Percent className="w-3 h-3 text-emerald-400" />
                <span>المكافآت محددة بـ 20% - 30% كحد أقصى (2.0 - 3.0 ريال)</span>
              </span>
              <span className="flex items-center gap-1 bg-emerald-950/40 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-600/30 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>صافي ربح المنصة مضمون 7.00 - 8.00 ريال بكل مباراة</span>
              </span>
            </div>
          </div>

          {/* محفظة الكوينز والأزرار السريعة */}
          <div className="w-full lg:w-auto bg-[#151923] border border-[#272d3e] p-4 sm:p-5 rounded-2xl flex flex-col items-center sm:items-end justify-center gap-3 shadow-inner">
            <div className="flex items-center gap-3 w-full justify-between sm:justify-end">
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-slate-400 font-bold block">رصيد كابتن كوينز المتاح</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#f5d77f] tracking-tight">{userCoins}</span>
                  <span className="text-xs text-[#d4af37] font-bold">كوينز</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-medium">
                  يعادل {(userCoins / CAPTAIN_COINS_CONFIG.SAR_TO_COINS_RATIO).toFixed(2)} ر.س رصيد خصم فعلي
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#d4af37]/30 to-[#f5d77f]/20 border border-[#d4af37]/50 flex items-center justify-center shadow-lg">
                <Coins className="w-6 h-6 text-[#f5d77f]" />
              </div>
            </div>
          </div>
        </div>

        {/* شريط التنقل الداخلي بين أقسام المتجر */}
        <div className="mt-6 pt-4 border-t border-[#1c2230] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStoreTab('catalog')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                storeTab === 'catalog'
                  ? 'bg-[#d4af37] text-black font-black shadow-md'
                  : 'bg-[#151923] text-slate-300 hover:text-white border border-[#252b3d]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>كتالوج المكافآت والخصومات</span>
            </button>

            <button
              onClick={() => setStoreTab('my_vouchers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 relative ${
                storeTab === 'my_vouchers'
                  ? 'bg-[#d4af37] text-black font-black shadow-md'
                  : 'bg-[#151923] text-slate-300 hover:text-white border border-[#252b3d]'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>كوبوناتي النشطة</span>
              {vouchers.filter((v) => v.status === 'active').length > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    storeTab === 'my_vouchers' ? 'bg-black text-[#d4af37]' : 'bg-[#d4af37] text-black'
                  }`}
                >
                  {vouchers.filter((v) => v.status === 'active').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setStoreTab('transactions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                storeTab === 'transactions'
                  ? 'bg-[#d4af37] text-black font-black shadow-md'
                  : 'bg-[#151923] text-slate-300 hover:text-white border border-[#252b3d]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>سجل كسب الكوينز</span>
            </button>

            <button
              onClick={() => setStoreTab('calculator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                storeTab === 'calculator'
                  ? 'bg-emerald-500 text-black font-black shadow-md'
                  : 'bg-[#151923] text-emerald-400 hover:text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>حاسبة الأمان المالي ومكسب المنصة</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            شركاء جدة المعتمدون: <span className="text-[#f5d77f] font-bold">{JEDDAH_SPORTS_PARTNERS.length} فروع ومتاجر</span>
          </div>
        </div>
      </div>

      {/* 2. التبويب الرابع: حاسبة الأمان المالي ومكسب المنصة (ضمان عدم الخسارة 100%) */}
      {storeTab === 'calculator' && (
        <div className="bg-[#10131b] border border-emerald-500/30 rounded-2xl p-6 space-y-6 shadow-xl animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1c2230] pb-5">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>الضمان المالي الرياضي للمنصة ضد أي خسارة</span>
              </div>
              <h3 className="text-lg font-black text-white">
                المعادلة الاقتصادية الصارمة: كيف نحمي أرباحك من أي تأثير مزعج
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                قاعدتنا الأساسية: عند حجز 22 لاعباً للملعب، تكسب المنصة <strong>10 ريالات صافية</strong>. الحد الأقصى للمكافآت
                الموزعة على جميع الـ 22 لاعباً مجتمعين لا يتجاوز أبداً <strong>20% إلى 30% (أي 2 إلى 3 ريالات كحد أقصى)</strong>،
                ما يضمن لك بقاء <strong>70% إلى 80% (7 إلى 8 ريالات صافية لكل حجز)</strong> في جيب المنصة بدون أي احتمالية للخسارة!
              </p>
            </div>
            <button
              onClick={() => setStoreTab('catalog')}
              className="px-4 py-2 rounded-xl bg-[#161a25] text-slate-300 hover:text-white text-xs font-bold border border-[#272e42]"
            >
              العودة للكتالوج
            </button>
          </div>

          {/* محاكي الأرقام الحي */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* متحكم نسبة المكافأة وسعة الحجز */}
            <div className="bg-[#151923] border border-[#242a3a] p-5 rounded-xl space-y-4">
              <h4 className="text-sm font-bold text-[#f5d77f] flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                <span>إعدادات معادلة الأمان</span>
              </h4>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-300">نسبة المكافأة المقتطعة من ربحك:</span>
                  <span className="text-emerald-400">{simRewardPercent}% (حد أقصى 30%)</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="30"
                  step="1"
                  value={simRewardPercent}
                  onChange={(e) => setSimRewardPercent(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>20% (أعلى أمان للمنصة)</span>
                  <span>25% (الموصى به)</span>
                  <span>30% (الحد الأقصى المسموح)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-300">عدد لاعبي الحجز:</span>
                  <span className="text-[#f5d77f]">{simPlayersCount} لاعب (ملعب كامل)</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="22"
                  step="2"
                  value={simPlayersCount}
                  onChange={(e) => setSimPlayersCount(Number(e.target.value))}
                  className="w-full accent-[#d4af37] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>10 لاعبين (5 ضد 5)</span>
                  <span>16 لاعب (8 ضد 8)</span>
                  <span>22 لاعب (11 ضد 11)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-300">تقدير عدد المباريات المحجوزة:</span>
                  <span className="text-white font-bold">{simBookingsCount} مباراة</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={simBookingsCount}
                  onChange={(e) => setSimBookingsCount(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>

            {/* تفصيل الحسبة لمباراة واحدة */}
            <div className="bg-[#151923] border border-[#242a3a] p-5 rounded-xl space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>حسبة المباراة الواحدة (22 لاعباً)</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#1f2535]">
                  <span className="text-slate-400">إجمالي مكسب المنصة لكل حجز:</span>
                  <span className="text-white font-bold">10.00 ر.س</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#1f2535]">
                  <span className="text-slate-400">مسبح الكوينز الموزع ({simRewardPercent}%):</span>
                  <span className="text-amber-400 font-bold">-{poolPerBookingSar.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#1f2535]">
                  <span className="text-slate-400">نصيب كل لاعب من الكوينز:</span>
                  <span className="text-[#f5d77f] font-bold">
                    {coinsPerPlayerInMatch} كوينز (~{(coinsPerPlayerInMatch / 100).toFixed(2)} ر.س)
                  </span>
                </div>
                <div className="flex justify-between py-2 bg-emerald-950/40 px-3 rounded-lg border border-emerald-500/30">
                  <span className="text-emerald-200 font-black">صافي ربح المنصة المضمون:</span>
                  <span className="text-emerald-400 font-black text-sm">
                    {platformNetProfitPerBookingSar.toFixed(2)} ر.س ({100 - simRewardPercent}%)
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                📌 لاحظ: التاجر الرياضي المحلي هو من يتحمل الجزء الأكبر من خصم الحذاء والقفازات لجذب الزبائن، والمنصة تؤكد الخصم
                فقط عبر الكوينز دون أن تدفع هللة زيادة!
              </p>
            </div>

            {/* تفصيل الحسبة التراكمية لعدد المباريات */}
            <div className="bg-gradient-to-br from-[#131d16] to-[#0f141f] border border-emerald-500/40 p-5 rounded-xl space-y-4 shadow-lg">
              <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#f5d77f]" />
                <span>أرباح المنصة التراكمية ({simBookingsCount} حجز)</span>
              </h4>

              <div className="space-y-3">
                <div className="bg-[#11171f] p-3 rounded-lg border border-[#222c3d]">
                  <span className="text-[11px] text-slate-400 block mb-0.5">إجمالي إيراد المنصة:</span>
                  <span className="text-xl font-black text-white">{(platformMarginPerBooking * simBookingsCount).toFixed(2)} ر.س</span>
                </div>

                <div className="bg-[#11171f] p-3 rounded-lg border border-[#222c3d]">
                  <span className="text-[11px] text-slate-400 block mb-0.5">إجمالي مكافآت اللاعبين ({simRewardPercent}%):</span>
                  <span className="text-base font-bold text-amber-400">
                    {(poolPerBookingSar * simBookingsCount).toFixed(2)} ر.س ({(totalCoinsDistributedPerBooking * simBookingsCount).toLocaleString()} كوينز)
                  </span>
                </div>

                <div className="bg-emerald-900/40 p-3 rounded-lg border border-emerald-500/50">
                  <span className="text-[11px] text-emerald-300 font-bold block mb-0.5">
                    صافي ربح المنصة الصافي 100%:
                  </span>
                  <span className="text-2xl font-black text-emerald-400">
                    {(platformNetProfitPerBookingSar * simBookingsCount).toFixed(2)} ر.س
                  </span>
                  <span className="text-[10px] text-emerald-200 block mt-1">
                    ✔ مضمون بالكامل بدون أدنى مخاطرة أو خسارة تشغيلية.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. التبويب الأول: كتالوج المكافآت والخصومات من شركاء جدة */}
      {storeTab === 'catalog' && (
        <div className="space-y-6">
          {/* شريط الفلاتر والتصنيفات */}
          <div className="bg-[#11141c] border border-[#1f2533] p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* تصنيفات المنتجات */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'كافة الخصومات' },
                { id: 'shoes', label: 'أحذية TF ترتان' },
                { id: 'gloves_guards', label: 'قفازات وواقي ساق' },
                { id: 'jerseys', label: 'أطقم وطباعة أرقام' },
                { id: 'equipment', label: 'كرات ومستلزمات' },
                { id: 'pitch_vouchers', label: 'خصم حجز الملاعب' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-[#d4af37] text-black font-black'
                      : 'bg-[#161a25] text-slate-300 hover:text-white border border-[#232838]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* فلترة الحي والبحث */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                  className="bg-[#161a25] border border-[#272d3e] text-xs font-bold text-slate-200 rounded-xl px-3 py-2 pr-8 appearance-none focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="all">كل أحياء ومتاجر جدة</option>
                  <option value="الروضة">حي الروضة</option>
                  <option value="الصفا">حي الصفا</option>
                  <option value="التحلية">شارع التحلية</option>
                  <option value="السامر">حي السامر</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
              </div>

              <div className="relative flex-1 sm:w-56">
                <input
                  type="text"
                  placeholder="ابحث عن حذاء، قفاز، أو متجر..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#161a25] border border-[#272d3e] text-xs text-slate-200 rounded-xl pl-8 pr-3 py-2 placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>
          </div>

          {/* شبكة بطاقات المكافآت */}
          {filteredRewards.length === 0 ? (
            <div className="text-center py-16 bg-[#11141c] border border-[#1f2533] rounded-2xl p-6">
              <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">لا توجد خصومات مطابقة لخيارات الفلترة</h4>
              <p className="text-xs text-slate-400">جرب اختيار حي آخر أو تصنيف عام لرؤية خصومات الشركاء بجدة.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRewards.map((reward) => {
                const canAfford = userCoins >= reward.coinsRequired;
                const coinsNeeded = reward.coinsRequired - userCoins;

                return (
                  <div
                    key={reward.id}
                    className="bg-[#12151f] border border-[#1f2637] hover:border-[#d4af37]/45 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 shadow-md group"
                  >
                    <div>
                      {/* صورة العرض والبادجات */}
                      <div className="relative h-44 w-full bg-[#181d2a] overflow-hidden">
                        <img
                          src={reward.imageUrl}
                          alt={reward.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#12151f] via-transparent to-black/40" />

                        {/* بادج التاجر والوسم */}
                        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                          <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[#f5d77f] font-bold text-[10px] border border-[#d4af37]/30 shadow-sm">
                            {reward.tag}
                          </span>
                        </div>

                        {/* بادج تكلفة الكوينز */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#d4af37] text-black font-black text-xs shadow-lg">
                          <Coins className="w-3.5 h-3.5 text-black" />
                          <span>{reward.coinsRequired} كابتن كوينز</span>
                        </div>

                        {/* قيمة التوفير */}
                        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-500 text-black font-black text-[11px] shadow-sm">
                          وفر {reward.discountValueSar} ر.س
                        </div>
                      </div>

                      {/* تفاصيل العرض والمتجر */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 text-[#f5d77f] font-bold">
                            <Store className="w-3.5 h-3.5" />
                            <span>{reward.partnerName}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{reward.partnerNeighborhood}</span>
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-[#f5d77f] transition">
                          {reward.title}
                        </h4>

                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {reward.description}
                        </p>

                        {/* الأسعار ونسبة التوفير */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#1c2230] text-xs">
                          <div>
                            <span className="text-slate-400 text-[10px] block">السعر الأصلي:</span>
                            <span className="text-slate-400 line-through font-semibold">{reward.originalPriceSar} ر.س</span>
                          </div>
                          <div className="text-right">
                            <span className="text-emerald-400 text-[10px] font-bold block">السعر بعد الخصم:</span>
                            <span className="text-white font-black text-sm">
                              {reward.originalPriceSar - reward.discountValueSar} ر.س
                            </span>
                          </div>
                        </div>

                        {/* إيضاح نوع الخصم ودعمه */}
                        <div className="bg-[#161a25] p-2 rounded-xl text-[10px] text-slate-300 flex items-center justify-between border border-[#222838]">
                          <span className="flex items-center gap-1 text-slate-400">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>
                              {reward.coMarketingPartnerDiscount
                                ? 'خصم ترويجي معتمد من التاجر بجدة'
                                : 'كاش باك ممول من مسبح أرباح المنصة'}
                            </span>
                          </span>
                          <span className="text-slate-400">متبقي {reward.stockRemaining} كوبون</span>
                        </div>
                      </div>
                    </div>

                    {/* زر الاستبدال */}
                    <div className="p-4 pt-0">
                      {canAfford ? (
                        <button
                          onClick={() => handleInitiateRedeem(reward)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f5d77f] text-black font-black text-xs hover:brightness-110 active:scale-[0.98] transition shadow-md flex items-center justify-center gap-2"
                        >
                          <Tag className="w-3.5 h-3.5" />
                          <span>استبدال الخصم ({reward.coinsRequired} كوينز)</span>
                        </button>
                      ) : (
                        <div className="space-y-1.5">
                          <button
                            disabled
                            className="w-full py-2.5 rounded-xl bg-[#181d29] text-slate-500 font-bold text-xs border border-[#272f42] cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <span>تحتاج {coinsNeeded} كوينز إضافية للاستبدال</span>
                          </button>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 px-1">
                            <span>رصيدك: {userCoins} كوينز</span>
                            <span className="text-[#f5d77f] font-bold">اكسب كوينز بالمشاركة في المباريات</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* دليل شركاء التجزئة في جدة */}
          <div className="bg-[#11141c] border border-[#1f2533] p-5 sm:p-6 rounded-2xl space-y-4 mt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#1c2230] pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#f5d77f]" />
                  <span>دليل الشركاء والمتاجر الرياضية المعتمدة بجدة</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  جميع الخصومات موثقة ومقبولة مباشرة في فروع الشركاء عند إظهار الكوبون أو الطلب عبر واتساب.
                </p>
              </div>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                شراكات تجارية بدون تكلفة على أرباح حجوزاتك
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {JEDDAH_SPORTS_PARTNERS.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-[#151923] border border-[#23293a] p-4 rounded-xl space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        {partner.name}
                      </span>
                      <span className="text-[10px] text-[#f5d77f] font-semibold bg-[#d4af37]/15 px-2 py-0.5 rounded-md">
                        ★ {partner.rating}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{partner.address}</span>
                    </p>
                    <p className="text-xs text-slate-300 bg-[#10131b] p-2.5 rounded-lg border border-[#1e2433] leading-relaxed">
                      {partner.perksDescription}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#1f2535] flex items-center justify-between text-xs">
                    <a
                      href={`https://wa.me/966${partner.phone.replace(/^0/, '')}?text=${encodeURIComponent(
                        `السلام عليكم، أنا كابتن في منصة كورة كارد جدة واستفسر عن الخصم المعتمد لديكم في ${partner.name}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold text-[11px]"
                    >
                      <Phone className="w-3 h-3" />
                      <span>واتساب المتجر ({partner.phone})</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. التبويب الثاني: كوبوناتي النشطة */}
      {storeTab === 'my_vouchers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#f5d77f]" />
                <span>كوبونات الخصم المستبدلة والنشطة</span>
              </h3>
              <p className="text-xs text-slate-400">
                أظهر كود الخصم للبائع عند الكاشير أو ارسله عبر واتساب المتجر لتطبيق الخصم فوراً.
              </p>
            </div>
            <button
              onClick={() => setStoreTab('catalog')}
              className="px-3.5 py-1.5 rounded-xl bg-[#161a25] text-xs font-bold text-slate-300 hover:text-white border border-[#252b3d]"
            >
              + استبدال خصومات جديدة
            </button>
          </div>

          {vouchers.length === 0 ? (
            <div className="text-center py-16 bg-[#11141c] border border-[#1f2533] rounded-2xl p-6">
              <Tag className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">لم تستبدل أي كوبونات خصم بعد</h4>
              <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                لديك {userCoins} كابتن كوينز في محفظتك. تصفح الكتالوج واستبدلها بخصم حقيقي على حذائك أو قفازاتك القادمة!
              </p>
              <button
                onClick={() => setStoreTab('catalog')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f5d77f] text-black font-black text-xs shadow-md"
              >
                تصفح كتالوج الهدايا بجدة
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {vouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="bg-[#131722] border border-[#d4af37]/35 rounded-2xl p-5 space-y-4 shadow-lg relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                        {voucher.status === 'active' ? '● ساري وجاهز للاستخدام' : 'مستخدم'}
                      </span>
                      <h4 className="text-sm font-black text-white mt-1.5">{voucher.rewardTitle}</h4>
                      <p className="text-xs text-[#f5d77f] font-semibold mt-0.5 flex items-center gap-1">
                        <Store className="w-3.5 h-3.5" />
                        <span>{voucher.partnerName}</span>
                      </p>
                    </div>

                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 block">تم الاستبدال بـ:</span>
                      <span className="text-xs font-black text-[#f5d77f]">{voucher.coinsSpent} كوينز</span>
                    </div>
                  </div>

                  {/* بطاقة كود الخصم والباركود */}
                  <div className="bg-[#0b0e14] border-2 border-dashed border-[#d4af37]/45 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block font-bold">كود الخصم الحصري:</span>
                      <span className="text-lg font-mono font-black text-[#f5d77f] tracking-wider select-all">
                        {voucher.voucherCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(voucher.voucherCode, 'كود الخصم')}
                        className="p-2 rounded-lg bg-[#181d29] hover:bg-[#222838] text-slate-300 hover:text-white border border-[#2b3347] transition active:scale-95"
                        title="نسخ الكود"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* تفاصيل الفرع وموعد الانتهاء */}
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{voucher.partnerAddress}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>صالح لغاية: {voucher.expiresAt}</span>
                    </p>
                  </div>

                  {/* زر الإرسال لواتساب المتجر */}
                  <div className="pt-2 border-t border-[#1e2535]">
                    <a
                      href={`https://wa.me/966${voucher.partnerPhone.replace(/^0/, '')}?text=${encodeURIComponent(
                        `السلام عليكم، أنا كابتن في منصة كورة كارد واستبدلت كود الخصم: (${voucher.voucherCode}) الخاص بـ: ${voucher.rewardTitle}. أريد الاستفادة منه في فرعكم.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-2 transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>تفعيل الكود ومراسلة المتجر عبر واتساب ({voucher.partnerPhone})</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. التبويب الثالث: سجل المعاملات وكسب الكوينز */}
      {storeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#f5d77f]" />
                <span>سجل حركة كابتن كوينز والمعاملات</span>
              </h3>
              <p className="text-xs text-slate-400">
                توثيق كامل لكيفية اكتساب الكوينز واستبدالها بنظام حماية الأرباح المعتمد.
              </p>
            </div>
            <div className="text-xs text-slate-300 bg-[#161a25] px-3 py-1.5 rounded-xl border border-[#242b3d]">
              الرصيد الكلي: <strong className="text-[#f5d77f]">{userCoins} كوينز</strong>
            </div>
          </div>

          <div className="bg-[#11141c] border border-[#1f2533] rounded-2xl overflow-hidden">
            <div className="divide-y divide-[#1c2230]">
              {transactions.map((tx) => {
                const isPositive = tx.amount > 0;
                return (
                  <div key={tx.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#151923] transition">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isPositive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {isPositive ? <Coins className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-xs sm:text-sm font-bold text-white">{tx.description}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{tx.timestamp}</span>
                          {tx.platformProfitSarSnapshot && (
                            <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.2 rounded border border-emerald-600/30">
                              ربح المنصة المحمي: {tx.platformProfitSarSnapshot} ر.س | مكافأة: {tx.rewardPercentSnapshot}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <span
                        className={`text-sm sm:text-base font-black ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? `+${tx.amount}` : tx.amount} كوينز
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {isPositive ? 'اكتساب' : 'استبدال كوبون'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* مودال تأكيد استبدال الكوينز */}
      {confirmingReward && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-[#d4af37]/45 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#1f2636] pb-3">
              <div className="flex items-center gap-2 text-[#f5d77f] font-bold text-sm">
                <Coins className="w-4 h-4" />
                <span>تأكيد استبدال كابتن كوينز</span>
              </div>
              <button
                onClick={() => setConfirmingReward(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 bg-[#171c2a] p-3 rounded-xl border border-[#252c3f]">
                <img
                  src={confirmingReward.imageUrl}
                  alt={confirmingReward.title}
                  className="w-14 h-14 object-cover rounded-lg"
                />
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">{confirmingReward.title}</h4>
                  <p className="text-[#f5d77f] font-medium">{confirmingReward.partnerName}</p>
                </div>
              </div>

              <div className="space-y-2 bg-[#0d1017] p-3.5 rounded-xl border border-[#1e2433]">
                <div className="flex justify-between">
                  <span className="text-slate-400">الكوينز المطلوبة:</span>
                  <span className="text-[#f5d77f] font-black">{confirmingReward.coinsRequired} كوينز</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">رصيدك الحالي:</span>
                  <span className="text-white font-bold">{userCoins} كوينز</span>
                </div>
                <div className="flex justify-between border-t border-[#1f2636] pt-1.5">
                  <span className="text-slate-400">الرصيد المتبقي بعد الخصم:</span>
                  <span className="text-emerald-400 font-black">
                    {userCoins - confirmingReward.coinsRequired} كوينز
                  </span>
                </div>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-xl flex items-center gap-2 text-[11px] text-emerald-300">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  الخصم مضمون 100% ومدعوم من الشريك التجاري بجدة دون أي تأثير على أرباح حجز الملاعب.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setConfirmingReward(null)}
                className="py-2.5 rounded-xl bg-[#181d29] text-slate-300 font-bold text-xs hover:bg-[#202737] transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmRedeem}
                className="py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f5d77f] text-black font-black text-xs hover:brightness-110 transition shadow-md"
              >
                تأكيد وتوليد الكوبون
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال عرض الكوبون المولّد حديثاً */}
      {newlyGeneratedVoucher && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#121622] via-[#0f121a] to-[#0c0e14] border border-[#d4af37] rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#d4af37] to-[#f5d77f] flex items-center justify-center mx-auto text-black shadow-lg">
                <Gift className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-white">مبروك! تم توليد كوبون الخصم بنجاح</h3>
              <p className="text-xs text-slate-300">
                تم خصم {newlyGeneratedVoucher.coinsSpent} كوينز من محفظتك وتوثيق الخصم الحصري.
              </p>
            </div>

            {/* بطاقة الكوبون الرقمية */}
            <div className="bg-[#0a0d13] border-2 border-dashed border-[#d4af37]/60 rounded-2xl p-5 space-y-4 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">كود الخصم المعتمد في جدة:</span>
                <span className="text-2xl font-mono font-black text-[#f5d77f] tracking-widest block mt-1 select-all">
                  {newlyGeneratedVoucher.voucherCode}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => copyToClipboard(newlyGeneratedVoucher.voucherCode, 'كود الخصم')}
                  className="px-4 py-2 rounded-xl bg-[#191f2c] hover:bg-[#232a3b] text-[#f5d77f] font-bold text-xs border border-[#343e57] flex items-center gap-1.5 transition active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الكود</span>
                </button>
              </div>

              <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-[#1c2230]">
                <p className="font-bold text-white">{newlyGeneratedVoucher.rewardTitle}</p>
                <p className="text-[#f5d77f]">{newlyGeneratedVoucher.partnerName}</p>
                <p className="text-[11px] text-slate-400">{newlyGeneratedVoucher.partnerAddress}</p>
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="space-y-2.5">
              <a
                href={`https://wa.me/966${newlyGeneratedVoucher.partnerPhone.replace(/^0/, '')}?text=${encodeURIComponent(
                  `السلام عليكم، أنا كابتن في منصة كورة كارد جدة واستبدلت كود الخصم: (${newlyGeneratedVoucher.voucherCode}) الخاص بـ: ${newlyGeneratedVoucher.rewardTitle}. أريد تفعيله وشراء المنتج.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center justify-center gap-2 transition shadow-lg"
              >
                <Phone className="w-4 h-4" />
                <span>مراسلة المتجر عبر واتساب لتفعيل الخصم فورا</span>
              </a>

              <button
                onClick={() => {
                  setNewlyGeneratedVoucher(null);
                  setStoreTab('my_vouchers');
                }}
                className="w-full py-2.5 rounded-xl bg-[#181d29] text-slate-300 font-bold text-xs hover:text-white border border-[#293245] transition"
              >
                عرض في قائمة كوبوناتي النشطة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
