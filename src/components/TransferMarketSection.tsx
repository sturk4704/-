import React, { useState, useMemo } from 'react';
import { Player, PlayerPosition, TransferRequest } from '../types';
import { JEDDAH_NEIGHBORHOODS } from '../utils/cardRatingEngine';
import { TransferRequestModal } from './TransferRequestModal';
import { TransferInboxModal } from './TransferInboxModal';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  UserPlus, 
  MapPin, 
  Trophy, 
  Sparkles, 
  Shield, 
  CheckCircle2, 
  Clock, 
  MessageCircle, 
  Eye, 
  SlidersHorizontal, 
  UserCheck, 
  Flame, 
  Zap, 
  RotateCcw,
  Inbox,
  AlertCircle
} from 'lucide-react';

interface TransferMarketSectionProps {
  players: Player[];
  transferRequests: TransferRequest[];
  onSendTransferRequest: (request: TransferRequest) => void;
  onAcceptTransferRequest: (request: TransferRequest) => void;
  onDeclineTransferRequest: (requestId: string) => void;
  onMarkAllRequestsRead: () => void;
  onOpenPlayerIdentity: (player: Player) => void;
  onShowToast: (message: string) => void;
}

export const TransferMarketSection: React.FC<TransferMarketSectionProps> = ({
  players,
  transferRequests,
  onSendTransferRequest,
  onAcceptTransferRequest,
  onDeclineTransferRequest,
  onMarkAllRequestsRead,
  onOpenPlayerIdentity,
  onShowToast,
}) => {
  // فلاتر البحث
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [positionGroup, setPositionGroup] = useState<'all' | 'attack' | 'midfield' | 'defense' | 'gk'>('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(50);
  const [selectedFoot, setSelectedFoot] = useState<'all' | 'right' | 'left' | 'both'>('all');
  const [ageGroupFilter, setAgeGroupFilter] = useState<'all' | 'adults' | 'under_18'>('all');
  const [sortBy, setSortBy] = useState<'rating_desc' | 'rating_asc' | 'matches' | 'discipline' | 'age'>('rating_desc');

  // المودالز
  const [selectedPlayerForRequest, setSelectedPlayerForRequest] = useState<Player | null>(null);
  const [isInboxOpen, setIsInboxOpen] = useState(false);

  // استخراج اللاعبين الأحرار فقط (المتاحين في سوق الانتقالات)
  // يشمل اللاعبين الذين لديهم isFreeAgent: true أو النادي 'لاعب حر (بدون فريق)'
  const freeAgentsList = useMemo(() => {
    return players.filter((p) => {
      const isFree = p.isFreeAgent === true || 
        p.clubName.includes('حر') || 
        p.transferMarketStatus === 'free_agent';
      return isFree;
    });
  }, [players]);

  // عدد الإشعارات غير المقروءة في صندوق الانتقالات
  const unreadRequestsCount = transferRequests.filter((r) => !r.read).length;

  // تصفية اللاعبين الأحرار
  const filteredFreeAgents = useMemo(() => {
    return freeAgentsList.filter((player) => {
      // 1. البحث النصي (الاسم، الحي، النبذة)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        player.name.toLowerCase().includes(q) ||
        player.neighborhood.toLowerCase().includes(q) ||
        (player.freeAgentBio && player.freeAgentBio.toLowerCase().includes(q)) ||
        player.position.toLowerCase().includes(q);

      // 2. فلتر المركز الدقيق
      const matchesPos = positionFilter === 'all' || player.position === positionFilter;

      // 3. فلتر مجموعة المركز
      let matchesGroup = true;
      if (positionGroup === 'attack') {
        matchesGroup = ['ST', 'LW', 'RW'].includes(player.position);
      } else if (positionGroup === 'midfield') {
        matchesGroup = ['CAM', 'CM', 'CDM'].includes(player.position);
      } else if (positionGroup === 'defense') {
        matchesGroup = ['CB', 'LB', 'RB'].includes(player.position);
      } else if (positionGroup === 'gk') {
        matchesGroup = player.position === 'GK';
      }

      // 4. فلتر الحي
      const matchesNeighborhood =
        selectedNeighborhood === 'all' || player.neighborhood === selectedNeighborhood;

      // 5. فلتر التقييم الإجمالي (OVR)
      const matchesRating = player.overall >= minRating;

      // 6. فلتر القدم المفضلة
      const matchesFoot = selectedFoot === 'all' || player.preferredFoot === selectedFoot;

      // 7. فلتر الفئة السنية
      const matchesAge = ageGroupFilter === 'all' || player.ageCategory === ageGroupFilter;

      return (
        matchesSearch &&
        matchesPos &&
        matchesGroup &&
        matchesNeighborhood &&
        matchesRating &&
        matchesFoot &&
        matchesAge
      );
    }).sort((a, b) => {
      if (sortBy === 'rating_desc') return b.overall - a.overall;
      if (sortBy === 'rating_asc') return a.overall - b.overall;
      if (sortBy === 'matches') return b.matchesPlayed - a.matchesPlayed;
      if (sortBy === 'discipline') return b.disciplineScore - a.disciplineScore;
      if (sortBy === 'age') return a.age - b.age;
      return 0;
    });
  }, [
    freeAgentsList,
    searchQuery,
    positionFilter,
    positionGroup,
    selectedNeighborhood,
    minRating,
    selectedFoot,
    ageGroupFilter,
    sortBy,
  ]);

  // تفريغ الفلاتر
  const handleResetFilters = () => {
    setSearchQuery('');
    setPositionFilter('all');
    setPositionGroup('all');
    setSelectedNeighborhood('all');
    setMinRating(50);
    setSelectedFoot('all');
    setAgeGroupFilter('all');
    setSortBy('rating_desc');
  };

  // إحصائيات عامة
  const topRatedPlayer = freeAgentsList.length > 0 
    ? Math.max(...freeAgentsList.map((p) => p.overall)) 
    : 0;
  const uniqueNeighborhoods = new Set(freeAgentsList.map((p) => p.neighborhood)).size;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* 1. البانر الترويجي الفاخر لسوق الانتقالات مع العدادات وزر الإشعارات */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#11141c] via-[#161a25] to-[#0e1117] border border-[#d4af37]/40 p-6 sm:p-8 shadow-2xl">
        {/* هالة خلفية ذهبية خافتة */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#f5d77f] text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>سوق الانتقالات المتقدم • كابتن جدة 2026</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              سوق الانتقالات واستقطاب <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5d77f] via-[#d4af37] to-[#e6ca65]">اللاعبين الأحرار</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              ابحث عن مواهب ولاعبين بدون فريق في أحياء جدة، وصفِّهم حسب المركز الدقيق والتقييم الإجمالي، وأرسل طلبات انضمام فورية تصل مباشرة للكباتن المعنيين مع إمكانية التنسيق عبر واتساب.
            </p>

            {/* عدادات سريعة */}
            <div className="flex items-center gap-4 pt-2 flex-wrap text-xs">
              <div className="flex items-center gap-2 bg-[#0c0e14] border border-[#232938] px-3.5 py-1.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-400">اللاعبون الأحرار:</span>
                <span className="font-black text-white">{freeAgentsList.length} لاعب</span>
              </div>

              <div className="flex items-center gap-2 bg-[#0c0e14] border border-[#232938] px-3.5 py-1.5 rounded-xl">
                <Trophy className="w-3.5 h-3.5 text-[#f5d77f]" />
                <span className="text-slate-400">أعلى OVR حر:</span>
                <span className="font-black text-[#f5d77f]">{topRatedPlayer}</span>
              </div>

              <div className="flex items-center gap-2 bg-[#0c0e14] border border-[#232938] px-3.5 py-1.5 rounded-xl">
                <MapPin className="w-3.5 h-3.5 text-[#f5d77f]" />
                <span className="text-slate-400">الأحياء المتاحة:</span>
                <span className="font-black text-white">{uniqueNeighborhoods} أحياء</span>
              </div>
            </div>
          </div>

          {/* زر صندوق طلبات الانضمام والإشعارات */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => setIsInboxOpen(true)}
              className="relative px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#c59b27] via-[#f5d77f] to-[#9e7922] text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-[#d4af37]/20 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-3 border border-[#f5d77f]/40"
            >
              <Inbox className="w-5 h-5 text-slate-950" />
              <span>صندوق طلبات الانتقال والإشعارات</span>
              {unreadRequestsCount > 0 && (
                <span className="bg-rose-600 text-white font-black text-[11px] px-2 py-0.5 rounded-full shadow animate-pulse">
                  {unreadRequestsCount} جديد
                </span>
              )}
            </button>

            <div className="text-[11px] text-slate-400 text-center lg:text-right flex items-center justify-center lg:justify-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>إشعار فوري وتنسيق رسمي بين الكباتن</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. لوحة التحكم والفلاتر المتقدمة (المركز، التقييم الإجمالي، الحي) */}
      <div className="bg-[#0e1117] border border-[#1c222e] rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-[#1c222e]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#f5d77f]" />
            <h2 className="text-base font-black text-white">تصفية وبحث سوق الانتقالات</h2>
            <span className="text-xs bg-[#1a1f2c] text-slate-300 px-2.5 py-0.5 rounded-full border border-[#283247]">
              {filteredFreeAgents.length} متاح
            </span>
          </div>

          <button
            onClick={handleResetFilters}
            className="text-xs text-slate-400 hover:text-[#f5d77f] flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط الفلاتر</span>
          </button>
        </div>

        {/* السطر الأول: شريط البحث، والحي، والمجموعة، والفرز */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. حقل البحث بالاسم */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-400 mb-1">البحث بالاسم أو المهارة</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن اسم لاعب حر، مهاجم، حارس..."
                className="w-full bg-[#11141b] border border-[#222735] focus:border-[#d4af37] text-white text-xs rounded-xl pl-9 pr-3.5 py-2.5 outline-none transition"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* 2. فلتر الحي في جدة */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#f5d77f]" />
              <span>الحي في جدة</span>
            </label>
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="w-full bg-[#11141b] border border-[#222735] focus:border-[#d4af37] text-white text-xs rounded-xl px-3 py-2.5 outline-none transition cursor-pointer"
            >
              <option value="all">كل أحياء جدة ({freeAgentsList.length})</option>
              {JEDDAH_NEIGHBORHOODS.map((nh) => {
                const count = freeAgentsList.filter((p) => p.neighborhood === nh).length;
                return (
                  <option key={nh} value={nh}>
                    {nh} {count > 0 ? `(${count})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 3. فلتر المركز الدقيق */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#f5d77f]" />
              <span>المركز الميداني الدقيق</span>
            </label>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full bg-[#11141b] border border-[#222735] focus:border-[#d4af37] text-white text-xs rounded-xl px-3 py-2.5 outline-none transition cursor-pointer"
            >
              <option value="all">كل المراكز</option>
              <option value="ST">ST - رأس حربة ومهاجم هداف</option>
              <option value="LW">LW - جناح أيسر</option>
              <option value="RW">RW - جناح أيمن</option>
              <option value="CAM">CAM - صانع ألعاب مايسترو</option>
              <option value="CM">CM - لاعب وسط بوكس تو بوكس</option>
              <option value="CDM">CDM - محور دفاعي وارتكاز</option>
              <option value="CB">CB - قلب دفاع</option>
              <option value="LB">LB - ظهير أيسر</option>
              <option value="RB">RB - ظهير أيمن</option>
              <option value="GK">GK - حارس مرمى</option>
            </select>
          </div>

          {/* 4. خيار الفرز */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-[#f5d77f]" />
              <span>ترتيب النتائج حسب</span>
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-[#11141b] border border-[#222735] focus:border-[#d4af37] text-white text-xs rounded-xl px-3 py-2.5 outline-none transition cursor-pointer"
            >
              <option value="rating_desc">التقييم الإجمالي OVR (الأعلى أولاً)</option>
              <option value="rating_asc">التقييم الإجمالي OVR (الأقل أولاً)</option>
              <option value="discipline">مستوى الانضباط الرياضي والمواعيد</option>
              <option value="matches">عدد المباريات والخبرة</option>
              <option value="age">العمر (المواهب الشابة أولاً)</option>
            </select>
          </div>
        </div>

        {/* السطر الثاني: مجموعات المراكز + سلايدر التقييم الإجمالي */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center pt-2">
          {/* أزرار سريعة لمجموعات الخطوط (هجوم، وسط، دفاع، حراسة) */}
          <div className="lg:col-span-7">
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">خط اللعب</label>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {[
                { id: 'all', label: 'كل الخطوط' },
                { id: 'attack', label: '⚽ خط الهجوم (ST, RW, LW)' },
                { id: 'midfield', label: '🪄 خط الوسط (CAM, CM, CDM)' },
                { id: 'defense', label: '🛡️ خط الدفاع (CB, LB, RB)' },
                { id: 'gk', label: '🧤 حراسة المرمى (GK)' },
              ].map((grp) => (
                <button
                  key={grp.id}
                  onClick={() => {
                    setPositionGroup(grp.id as any);
                    if (grp.id !== 'all') setPositionFilter('all');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    positionGroup === grp.id
                      ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/50 shadow-sm'
                      : 'bg-[#11141b] text-slate-400 border border-[#1f2533] hover:text-white'
                  }`}
                >
                  {grp.label}
                </button>
              ))}
            </div>
          </div>

          {/* سلايدر التقييم الإجمالي (OVR) مع أزرار سريعة */}
          <div className="lg:col-span-5 bg-[#11141b] border border-[#222735] rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-[#f5d77f]" />
                <span>الحد الأدنى للتقييم الإجمالي:</span>
              </span>
              <span className="font-black text-[#f5d77f] bg-[#1a1f2c] px-2.5 py-0.5 rounded-lg border border-[#d4af37]/30">
                {minRating}+ OVR
              </span>
            </div>

            <input
              type="range"
              min="50"
              max="90"
              step="1"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full accent-[#d4af37] cursor-pointer"
            />

            <div className="flex items-center justify-between gap-1 text-[10px]">
              {[50, 65, 75, 80].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMinRating(val)}
                  className={`px-2 py-0.5 rounded-md font-bold transition ${
                    minRating === val
                      ? 'bg-[#d4af37] text-slate-950'
                      : 'bg-[#181d28] text-slate-400 hover:text-white'
                  }`}
                >
                  {val === 50 ? 'الكل (50+)' : `${val}+`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. شبكة بطاقات اللاعبين الأحرار */}
      {filteredFreeAgents.length === 0 ? (
        <div className="py-20 text-center bg-[#0e1117] border border-[#1c222e] rounded-3xl p-8">
          <div className="w-16 h-16 rounded-3xl bg-[#141824] border border-[#222736] flex items-center justify-center mx-auto mb-4 text-slate-500">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-white">لم يتم العثور على لاعبين أحرار يطابقون هذه الفلاتر</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            جرب تخفيض الحد الأدنى للتقييم الإجمالي OVR أو اختيار "كل أحياء جدة" ومسح حقل البحث.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-5 py-2.5 rounded-xl bg-[#1c222e] hover:bg-[#273042] text-[#f5d77f] font-bold text-xs border border-[#d4af37]/30 transition inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة ضبط الفلاتر وعرض الجميع</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredFreeAgents.map((player) => {
            const isGk = player.position === 'GK';
            const footText = 
              player.preferredFoot === 'right' ? 'القدم اليمنى' :
              player.preferredFoot === 'left' ? 'القدم اليسرى' : 'كلتا القدمين';

            // تدرجات الألوان حسب البطاقة
            const tierBorder = 
              player.overall >= 80 ? 'border-[#d4af37]/60 hover:border-[#d4af37]' :
              player.overall >= 70 ? 'border-slate-500/50 hover:border-slate-400' :
              'border-[#8d5b4c]/40 hover:border-[#8d5b4c]';

            return (
              <div
                key={player.id}
                className={`group relative bg-gradient-to-b from-[#131620] to-[#0c0e14] border ${tierBorder} rounded-3xl p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden`}
              >
                {/* وسم التوفر كلاعب حر */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>لاعب حر متاح</span>
                  </span>

                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#f5d77f]" />
                    <span>{player.neighborhood}</span>
                  </span>
                </div>

                {/* صورة وبيانات اللاعب الرئيسية */}
                <div className="flex items-center gap-3.5 mb-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={player.avatarUrl}
                      alt={player.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#d4af37]/60 shadow-lg group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute -bottom-1 -left-1 bg-[#08090d] text-[#f5d77f] border border-[#d4af37] text-[10px] font-black px-1.5 py-0.2 rounded-md shadow">
                      {player.position}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black text-white truncate group-hover:text-[#f5d77f] transition">
                      {player.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-gradient-to-r from-[#c59b27] via-[#f5d77f] to-[#9e7922] text-slate-950 font-black px-2 py-0.5 rounded-md shadow-sm">
                        {player.overall} OVR
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {player.age} سنة • {footText}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>{player.height} سم</span>
                      <span>•</span>
                      <span className="text-amber-300/80 font-semibold">{player.disciplineScore}% انضباط</span>
                    </div>
                  </div>
                </div>

                {/* نبذة اللاعب ورغبته الكروية في سوق الانتقالات */}
                <div className="bg-[#0b0d12] border border-[#1d2331] rounded-2xl p-3 text-xs text-slate-300 mb-3.5 leading-relaxed">
                  <p className="line-clamp-2 text-[11px] text-slate-300">
                    "{player.freeAgentBio || 'لاعب مميز ومتحمس لخوض تجارب وانضمام لفرق الأحياء والبطولات الودية بجدة.'}"
                  </p>
                </div>

                {/* إحصائيات فيفا الرئيسية للبطاقة */}
                <div className="grid grid-cols-6 gap-1 bg-[#0f1219] border border-[#1a202c] rounded-xl p-2 text-center text-[10px] mb-4">
                  {isGk ? (
                    <>
                      <div><div className="text-slate-500">DIV</div><div className="font-black text-white">{(player.stats as any).div}</div></div>
                      <div><div className="text-slate-500">HAN</div><div className="font-black text-white">{(player.stats as any).han}</div></div>
                      <div><div className="text-slate-500">KIC</div><div className="font-black text-white">{(player.stats as any).kic}</div></div>
                      <div><div className="text-slate-500">REF</div><div className="font-black text-white">{(player.stats as any).ref}</div></div>
                      <div><div className="text-slate-500">SPD</div><div className="font-black text-white">{(player.stats as any).spd}</div></div>
                      <div><div className="text-slate-500">POS</div><div className="font-black text-white">{(player.stats as any).pos}</div></div>
                    </>
                  ) : (
                    <>
                      <div><div className="text-slate-500">PAC</div><div className="font-black text-white">{(player.stats as any).pac}</div></div>
                      <div><div className="text-slate-500">SHO</div><div className="font-black text-white">{(player.stats as any).sho}</div></div>
                      <div><div className="text-slate-500">PAS</div><div className="font-black text-white">{(player.stats as any).pas}</div></div>
                      <div><div className="text-slate-500">DRI</div><div className="font-black text-white">{(player.stats as any).dri}</div></div>
                      <div><div className="text-slate-500">DEF</div><div className="font-black text-white">{(player.stats as any).def}</div></div>
                      <div><div className="text-slate-500">PHY</div><div className="font-black text-white">{(player.stats as any).phy}</div></div>
                    </>
                  )}
                </div>

                {/* الشارات المميزة */}
                {player.badges && player.badges.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mb-4">
                    {player.badges.slice(0, 2).map((b, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-[#1a1f2b] text-slate-300 border border-[#273043] px-2 py-0.5 rounded-lg truncate max-w-[130px]"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                )}

                {/* زر الإجراء الحاسم: زر 'طلب انضمام' + المعاينة والواتساب */}
                <div className="space-y-2 pt-2 border-t border-[#1a202c]">
                  {/* الزر الرئيسي: طلب انضمام */}
                  <button
                    onClick={() => setSelectedPlayerForRequest(player)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#c59b27] via-[#f5d77f] to-[#9e7922] text-slate-950 font-black text-xs shadow-md shadow-[#d4af37]/20 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 border border-[#f5d77f]/50"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>طلب انضمام وإشعار الكابتن</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onOpenPlayerIdentity(player)}
                      className="py-1.5 rounded-xl bg-[#151922] hover:bg-[#1c2230] text-slate-300 text-[11px] font-bold transition flex items-center justify-center gap-1.5 border border-[#222838]"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#f5d77f]" />
                      <span>معاينة البطاقة</span>
                    </button>

                    <button
                      onClick={() => {
                        const text = encodeURIComponent(
                          `مرحباً كابتن ${player.name}، اطلعت على بطاقتك في سوق الانتقالات كلاعب حر (${player.position} - ${player.overall} OVR)، ونود التنسيق معك بخصوص الانضمام للفريق.`
                        );
                        const phone = player.phone || '0501234567';
                        window.open(`https://wa.me/966${phone.replace(/^0/, '')}?text=${text}`, '_blank');
                      }}
                      className="py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 text-[11px] font-bold transition flex items-center justify-center gap-1.5 border border-emerald-500/30"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>واتساب</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* مودال إرسال طلب الانضمام */}
      {selectedPlayerForRequest && (
        <TransferRequestModal
          player={selectedPlayerForRequest}
          isOpen={true}
          onClose={() => setSelectedPlayerForRequest(null)}
          onSubmitRequest={(newReq) => {
            onSendTransferRequest(newReq);
            setSelectedPlayerForRequest(null);
          }}
          onShowToast={onShowToast}
        />
      )}

      {/* مودال صندوق طلبات الانتقال والإشعارات */}
      <TransferInboxModal
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        requests={transferRequests}
        onAcceptRequest={onAcceptTransferRequest}
        onDeclineRequest={onDeclineTransferRequest}
        onMarkAllAsRead={onMarkAllRequestsRead}
        onShowToast={onShowToast}
      />
    </div>
  );
};
