import React, { useState } from 'react';
import { 
  FriendlyReferee, 
  RefereeEvaluation, 
  Player, 
  SquadFormat, 
  RefereeBookingRequest,
  UserRole 
} from '../types';
import { JEDDAH_NEIGHBORHOODS } from '../utils/cardRatingEngine';
import { 
  ShieldCheck, 
  UserCheck, 
  Star, 
  Lock, 
  EyeOff, 
  Scale, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  PlusCircle, 
  Calendar, 
  MessageSquare, 
  Phone, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Check, 
  MapPin, 
  HeartHandshake, 
  ShieldAlert,
  Flame,
  Info,
  X
} from 'lucide-react';

interface FriendlyRefereesSectionProps {
  referees: FriendlyReferee[];
  players?: Player[];
  onSaveRefereeEvaluation: (refereeId: string, evaluation: RefereeEvaluation) => void;
  onRegisterNewReferee?: (newRef: FriendlyReferee) => void;
  onShowToast: (msg: string) => void;
  currentCaptainName?: string;
  currentCaptainTeam?: string;
  currentUserRole?: UserRole;
}

export const FriendlyRefereesSection: React.FC<FriendlyRefereesSectionProps> = ({
  referees,
  players = [],
  onSaveRefereeEvaluation,
  onRegisterNewReferee,
  onShowToast,
  currentCaptainName = 'كابتن المباراة',
  currentCaptainTeam = 'فريق الكابتن',
  currentUserRole = 'captain',
}) => {
  // فلاتر البحث
  const [searchQuery, setSearchQuery] = useState('');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'fairness' | 'matches' | 'experience'>('rating');

  // نوافذ التفاعل
  const [evaluatingReferee, setEvaluatingReferee] = useState<FriendlyReferee | null>(null);
  const [bookingReferee, setBookingReferee] = useState<FriendlyReferee | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [expandedRefereeId, setExpandedRefereeId] = useState<string | null>(null);

  // حالة نموذج التقييم السري للكابتن
  const [evalMatchTitle, setEvalMatchTitle] = useState('');
  const [evalCaptainName, setEvalCaptainName] = useState(currentCaptainName);
  const [evalCaptainTeam, setEvalCaptainTeam] = useState(currentCaptainTeam);
  const [fairnessScore, setFairnessScore] = useState<number>(9.0);
  const [timeManagementScore, setTimeManagementScore] = useState<number>(8.5);
  const [foulDecisionsScore, setFoulDecisionsScore] = useState<number>(8.5);
  const [composureScore, setComposureScore] = useState<number>(9.0);
  const [privateNotes, setPrivateNotes] = useState('');
  const [evalSavedSuccess, setEvalSavedSuccess] = useState(false);

  // حالة نموذج حجز/طلب التحكيم
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('21:00');
  const [bookingPitch, setBookingPitch] = useState('ملاعب الجوهرة سبورتس');
  const [bookingNeighborhood, setBookingNeighborhood] = useState('حي الحمدانية');
  const [bookingOpponent, setBookingOpponent] = useState('');
  const [bookingFormat, setBookingFormat] = useState<SquadFormat>('8v8');
  const [bookingHonorarium, setBookingHonorarium] = useState<number>(50);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // حالة تسجيل حكم جديد
  const [newRefName, setNewRefName] = useState('');
  const [newRefPhone, setNewRefPhone] = useState('');
  const [newRefNeighborhood, setNewRefNeighborhood] = useState('حي الحمدانية');
  const [newRefExp, setNewRefExp] = useState(3);
  const [newRefHonorariumType, setNewRefHonorariumType] = useState<'voluntary' | 'standard_honorarium'>('standard_honorarium');
  const [newRefHonorariumAmount, setNewRefHonorariumAmount] = useState(50);
  const [newRefBio, setNewRefBio] = useState('');
  const [selectedLinkedPlayerId, setSelectedLinkedPlayerId] = useState('');

  // تصفية وترتيب الحكام
  const filteredReferees = referees
    .filter((ref) => {
      const matchesSearch =
        ref.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ref.bio && ref.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ref.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesNeighborhood =
        neighborhoodFilter === 'all' || ref.neighborhood === neighborhoodFilter;

      const matchesAvailability =
        availabilityFilter === 'all' || ref.availabilityStatus === availabilityFilter;

      const matchesFormat =
        formatFilter === 'all' || ref.preferredFormats.includes(formatFilter as SquadFormat);

      return matchesSearch && matchesNeighborhood && matchesAvailability && matchesFormat;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.averageRating - a.averageRating;
      if (sortBy === 'fairness') return b.fairnessAvg - a.fairnessAvg;
      if (sortBy === 'matches') return b.matchesOfficiated - a.matchesOfficiated;
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      return 0;
    });

  // حساب الإحصائيات العامة للكباتن
  const totalReferees = referees.length;
  const totalMatchesOfficiated = referees.reduce((sum, r) => sum + r.matchesOfficiated, 0);
  const overallIntegrityIndex =
    totalReferees > 0
      ? Math.round((referees.reduce((sum, r) => sum + r.fairnessAvg, 0) / totalReferees) * 10) / 10
      : 9.2;
  const verifiedCount = referees.filter((r) => r.isCaptainVerified).length;

  // حفظ التقييم السري
  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingReferee) return;

    const overallCalc =
      Math.round(((fairnessScore + timeManagementScore + foulDecisionsScore + composureScore) / 4) * 10) /
      10;

    const evaluation: RefereeEvaluation = {
      id: `eval-${Date.now()}`,
      matchId: `match-${Date.now()}`,
      matchTitle: evalMatchTitle.trim() || `مباراة ودية (${evalCaptainTeam})`,
      evaluatorCaptainName: evalCaptainName.trim() || 'كابتن معتمد',
      evaluatorTeamName: evalCaptainTeam.trim() || 'فريق من جدة',
      date: new Date().toISOString().split('T')[0],
      overallScore: overallCalc,
      fairnessScore,
      timeManagementScore,
      foulDecisionsScore,
      composureScore,
      privateNotes:
        privateNotes.trim() ||
        'إدارة ممتازة للمباراة الودية، التزام بالنزاهة والروح الرياضية وحسن التعامل مع اللاعبين.',
    };

    onSaveRefereeEvaluation(evaluatingReferee.id, evaluation);
    setEvalSavedSuccess(true);
    setTimeout(() => {
      setEvalSavedSuccess(false);
      setEvaluatingReferee(null);
      setPrivateNotes('');
      setEvalMatchTitle('');
      onShowToast(`تم تسجيل التقييم السري للحكم "${evaluatingReferee.name}" بنجاح وتحديث سجله الداخلي.`);
    }, 1200);
  };

  // تسجيل حكم جديد
  const handleRegisterNewReferee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRefName.trim() || !newRefPhone.trim()) return;

    const linkedPlayer = players.find((p) => p.id === selectedLinkedPlayerId);

    const newRef: FriendlyReferee = {
      id: `ref-${Date.now()}`,
      playerId: linkedPlayer?.id,
      name: newRefName.trim(),
      phone: newRefPhone.trim(),
      avatarUrl:
        linkedPlayer?.avatarUrl ||
        `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80`,
      neighborhood: newRefNeighborhood,
      experienceYears: Number(newRefExp) || 1,
      preferredFormats: ['7v7', '8v8', '9v9'],
      availabilityStatus: 'available',
      isCaptainVerified: true,
      matchesOfficiated: 1,
      averageRating: 8.8,
      fairnessAvg: 9.0,
      timeManagementAvg: 8.7,
      foulDecisionsAvg: 8.8,
      composureAvg: 8.9,
      specialties: ['⚖️ نزاهة مشهودة', '🤝 حكم ودّي معتمد'],
      honorariumType: newRefHonorariumType,
      honorariumAmount: newRefHonorariumType === 'voluntary' ? 0 : Number(newRefHonorariumAmount),
      bio: newRefBio.trim() || `حكم ودّي مسجل لخدمة مباريات أحياء جدة بالتنسيق مع الكباتن.`,
      evaluations: [
        {
          id: `eval-init-${Date.now()}`,
          matchId: `match-init`,
          matchTitle: 'مباراة ودية اعتماد أولى',
          evaluatorCaptainName: currentCaptainName,
          evaluatorTeamName: currentCaptainTeam,
          date: new Date().toISOString().split('T')[0],
          overallScore: 8.8,
          fairnessScore: 9.0,
          timeManagementScore: 8.7,
          foulDecisionsScore: 8.8,
          composureScore: 8.9,
          privateNotes: 'تمت تزكيته وتسجيله بواسطة كابتن معتمد، يتمتع بالحياد والروح الرياضية.',
        },
      ],
    };

    if (onRegisterNewReferee) {
      onRegisterNewReferee(newRef);
    }
    setIsRegisterOpen(false);
    setNewRefName('');
    setNewRefPhone('');
    setNewRefBio('');
    onShowToast(`تمت إضافة الحكم الودي "${newRef.name}" إلى قائمة كباتن جدة بنجاح!`);
  };

  // إرسال طلب حجز / تنسيق عبر الواتساب أو النظام
  const handleSendBookingRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingReferee) return;

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      const text = encodeURIComponent(
        `السلام عليكم كابتن ${bookingReferee.name}، أنا الكابتن ${currentCaptainName} من فريق ${currentCaptainTeam}. نرغب في حضورك لتحكيم مباراتنا الودية ضد ${bookingOpponent || 'الفريق المنافس'} في ${bookingPitch} (${bookingNeighborhood}) بتاريخ ${bookingDate || 'قريباً'} الساعة ${bookingTime}. نسعد بتأكيد تواجدك.`
      );
      window.open(`https://wa.me/966${bookingReferee.phone.replace(/^0/, '')}?text=${text}`, '_blank');
      setBookingReferee(null);
      onShowToast(`تم إرسال طلب التنسيق للحكم "${bookingReferee.name}" وتجهيز رسالة الواتساب.`);
    }, 1000);
  };

  return (
    <div className="space-y-8 text-right font-['Cairo',sans-serif]">
      {/* 1. شعار السرية وتنبيه حماية التحكيم الودي الخاص بالكباتن */}
      <div className="relative overflow-hidden bg-gradient-to-l from-[#11141b] via-[#161a24] to-[#11141b] border border-[#d4af37]/30 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#f5d77f] font-bold text-xs">
                <Lock className="w-3.5 h-3.5" />
                {currentUserRole === 'referee' 
                  ? 'بوابة الحكام المعتمدين الرسمية ⚖️' 
                  : currentUserRole === 'pitch_owner'
                  ? 'سجل سلامة المنشآت والتحكيم 🏟️'
                  : 'سري ومحمي للكباتن والمنظمين فقط 🔒'}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                حماية الروح الرياضية بجدة
              </span>
            </div>

            <h1 className="text-xl md:text-2xl lg:text-3xl font-black font-['Changa',sans-serif] text-white tracking-wide">
              {currentUserRole === 'referee'
                ? 'جدول تكليفات وملفات الحكام المعتمدين'
                : currentUserRole === 'pitch_owner'
                ? 'سجل حكام ملاعب ومنشآت جدة'
                : 'إدارة وتقييم الحكام الوديين'}
            </h1>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {currentUserRole === 'referee'
                ? 'مرحباً بك كحكم معتمد في منصة كابتن جدة: يمكنك استعراض المباريات الودية المتاحة للتكليف، متابعة بدلك المالي (100 - 200 ريال للمباراة)، والاطلاع على مؤشر النزاهة والحياد المقيّم بعد كل لقاء.'
                : currentUserRole === 'pitch_owner'
                ? 'قائمة الحكام المعتمدين لتغطية وإدارة مباريات منشآتك الرياضية بجدة لضمان الالتزام بقواعد السلامة، حسن إدارة الوقت، وتفادي النزاعات.'
                : 'واجهة مخصصة لكباتن الفرق ومنظمي المباريات في أحياء جدة لاختيار وتقييم الحكام الوديين بشفافية سرية. تعتمد التقييمات حصراً على النزاهة والحياد، إدارة الوقت، حسم الأخطاء، والهدوء.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#1a1f2c] hover:bg-[#222838] border border-[#2b3345] text-slate-200 hover:text-white font-bold text-xs transition flex items-center gap-2 shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-[#f5d77f]" />
              تسجيل حكم ودي جديد
            </button>
            <button
              onClick={() => {
                if (referees.length > 0) {
                  setEvaluatingReferee(referees[0]);
                }
              }}
              className="gold-gradient-btn px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg"
            >
              <Scale className="w-4 h-4" />
              تقييم أداء حكم بعد مباراة
            </button>
          </div>
        </div>

        {/* شريط الإحصائيات والأرقام المعتمدة */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#222735]">
          <div className="bg-[#0b0d13]/80 p-3.5 rounded-2xl border border-[#1e2330]">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>الحكام الوديون المتاحون</span>
              <UserCheck className="w-3.5 h-3.5 text-[#f5d77f]" />
            </div>
            <div className="text-lg md:text-xl font-black text-white font-mono">
              {totalReferees} <span className="text-xs text-slate-400 font-sans">حكماً</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">
              {verifiedCount} معتمد بتزكية الكباتن
            </div>
          </div>

          <div className="bg-[#0b0d13]/80 p-3.5 rounded-2xl border border-[#1e2330]">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>مؤشر النزاهة والحياد العام</span>
              <Scale className="w-3.5 h-3.5 text-[#f5d77f]" />
            </div>
            <div className="text-lg md:text-xl font-black text-[#f5d77f] font-mono">
              ⭐ {overallIntegrityIndex} <span className="text-xs text-slate-400 font-sans">/ 10</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              بناءً على المعايير الـ 4 المعتمدة
            </div>
          </div>

          <div className="bg-[#0b0d13]/80 p-3.5 rounded-2xl border border-[#1e2330]">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>المباريات المدارة ودياً</span>
              <Award className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-lg md:text-xl font-black text-white font-mono">
              {totalMatchesOfficiated} <span className="text-xs text-slate-400 font-sans">مباراة</span>
            </div>
            <div className="text-[10px] text-blue-400 mt-0.5">
              في مختلف ملاعب أحياء جدة
            </div>
          </div>

          <div className="bg-[#0b0d13]/80 p-3.5 rounded-2xl border border-[#1e2330]">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span>مستوى خصوصية السجل</span>
              <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg md:text-xl font-black text-emerald-400 font-mono">
              100% سري
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              محجوب عن اللاعبين والجمهور
            </div>
          </div>
        </div>
      </div>

      {/* 2. شريط البحث والفلاتر المتقدمة لأحياء جدة وتوافر الحكام */}
      <div className="bg-[#11141b] border border-[#222735] rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* حقل البحث */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الحكم، الحي في جدة، أو وسام التميز..."
              className="w-full bg-[#08090d] border border-[#222735] rounded-xl pr-10 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          {/* فلتر الحي */}
          <select
            value={neighborhoodFilter}
            onChange={(e) => setNeighborhoodFilter(e.target.value)}
            className="bg-[#08090d] border border-[#222735] text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none"
          >
            <option value="all">كافة أحياء جدة</option>
            {JEDDAH_NEIGHBORHOODS.map((nh) => (
              <option key={nh} value={nh}>
                {nh}
              </option>
            ))}
          </select>

          {/* فلتر التوافر */}
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="bg-[#08090d] border border-[#222735] text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none"
          >
            <option value="all">كافة حالات التوافر</option>
            <option value="available">متاح للتحكيم الآن</option>
            <option value="weekend">عطلات نهاية الأسبوع</option>
            <option value="busy">منشغل حالياً</option>
          </select>

          {/* فلتر الترتيب */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#08090d] border border-[#222735] text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none"
          >
            <option value="rating">الأعلى تقييماً سرياً</option>
            <option value="fairness">الأعلى في النزاهة والحياد</option>
            <option value="matches">الأكثر إدارة للمباريات</option>
            <option value="experience">الأكثر خبرة بالسنوات</option>
          </select>
        </div>

        {/* أزرار سريعة لاختيار حجم المباراة */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-bold text-slate-300">
            <Filter className="w-3.5 h-3.5 text-[#f5d77f]" />
            حجم المباراة المطلوب:
          </span>
          {['all', '5v5', '7v7', '8v8', '9v9', '11v11'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormatFilter(fmt)}
              className={`px-2.5 py-1 rounded-lg border transition font-mono ${
                formatFilter === fmt
                  ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#f5d77f] font-bold'
                  : 'bg-[#08090d] border-[#222735] text-slate-400 hover:text-white'
              }`}
            >
              {fmt === 'all' ? 'جميع الأحجام' : fmt}
            </button>
          ))}
        </div>
      </div>

      {/* 3. قائمة الحكام الوديين المتاحين بجدة مع المعايير الـ 4 الصريحة */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#f5d77f]" />
              الحكام الوديون المسجلون بجدة:
            </span>
            <span className="text-slate-400 text-xs font-mono">
              ({filteredReferees.length} حكم متطابق)
            </span>
          </div>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            التقييمات محسوبة من تقارير الكباتن السرية بعد كل مباراة
          </span>
        </div>

        {filteredReferees.length === 0 ? (
          <div className="bg-[#11141b] border border-[#222735] rounded-3xl p-12 text-center space-y-3">
            <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-white font-bold text-sm">لا يوجد حكام يطابقون خيارات البحث الحالية</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              جرب تغيير الحي أو حالة التوافر، أو قم بتسجيل حكم ودّي جديد من حيك في المنصة.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setNeighborhoodFilter('all');
                setAvailabilityFilter('all');
                setFormatFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-[#1a1f2c] text-[#f5d77f] border border-[#2b3345] font-bold text-xs"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredReferees.map((ref) => {
              const isExpanded = expandedRefereeId === ref.id;

              return (
                <div
                  key={ref.id}
                  className="bg-[#11141b] border border-[#222735] hover:border-[#384259] rounded-3xl p-5 md:p-6 transition shadow-xl space-y-5 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* معلومات رأس بطاقة الحكم */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <img
                            src={ref.avatarUrl}
                            alt={ref.name}
                            className="w-14 h-14 rounded-2xl object-cover border border-[#343d52] shadow-md"
                          />
                          {ref.isCaptainVerified && (
                            <span
                              title="حكم معتمد ومزكى من كباتن جدة"
                              className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-[#d4af37] text-slate-950 flex items-center justify-center shadow-md border border-black"
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-sm md:text-base text-white font-['Changa',sans-serif]">
                              {ref.name}
                            </h3>
                            {ref.isCaptainVerified && (
                              <span className="text-[10px] bg-[#d4af37]/15 text-[#f5d77f] px-2 py-0.5 rounded-full font-bold border border-[#d4af37]/30">
                                معتمد من الكباتن
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {ref.neighborhood}
                            </span>
                            <span>•</span>
                            <span>خبرة {ref.experienceYears} سنوات</span>
                            <span>•</span>
                            <span className="font-mono text-slate-300">
                              {ref.matchesOfficiated} مباراة مدارة
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* شارة التقييم السري الشامل */}
                      <div className="shrink-0 text-left bg-[#08090d] px-3.5 py-2 rounded-2xl border border-[#d4af37]/30">
                        <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                          <Lock className="w-2.5 h-2.5 text-[#f5d77f]" />
                          <span>التقييم السري:</span>
                        </div>
                        <div className="text-base md:text-lg font-black text-[#f5d77f] font-mono">
                          ⭐ {ref.averageRating.toFixed(1)} <span className="text-[10px] text-slate-400 font-sans">/ 10</span>
                        </div>
                        <div className="text-[9px] text-emerald-400 text-left font-bold">
                          {ref.evaluations.length} تقييم موثق
                        </div>
                      </div>
                    </div>

                    {/* النبذة والوسوم */}
                    {ref.bio && (
                      <p className="text-xs text-slate-300 leading-relaxed bg-[#0a0c10] p-3 rounded-xl border border-[#1a1f2c]">
                        "{ref.bio}"
                      </p>
                    )}

                    {/* المعايير الـ 4 الصريحة المطلوبة من المستخدم */}
                    <div className="bg-[#08090d] p-4 rounded-2xl border border-[#1e2330] space-y-3">
                      <div className="flex items-center justify-between text-[11px] border-b border-[#1a1f2a] pb-1.5">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-[#f5d77f]" />
                          المعايير المعتمدة لتقييم الحكم (سري):
                        </span>
                        <span className="text-[10px] text-slate-500">من 10 درجات</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        {/* 1. النزاهة والحياد */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              النزاهة والحيادية وعدم الانحياز:
                            </span>
                            <span className="font-bold font-mono text-[#f5d77f]">
                              {ref.fairnessAvg.toFixed(1)} / 10
                            </span>
                          </div>
                          <div className="w-full bg-[#181c26] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#d4af37] h-full rounded-full transition-all duration-500"
                              style={{ width: `${(ref.fairnessAvg / 10) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* 2. إدارة الوقت */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                              إدارة الوقت والتبديلات والإيقافات:
                            </span>
                            <span className="font-bold font-mono text-blue-400">
                              {ref.timeManagementAvg.toFixed(1)} / 10
                            </span>
                          </div>
                          <div className="w-full bg-[#181c26] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${(ref.timeManagementAvg / 10) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* 3. حسم الأخطاء */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              حسم الأخطاء ودقة صافرة التسلل واللمسات:
                            </span>
                            <span className="font-bold font-mono text-emerald-400">
                              {ref.foulDecisionsAvg.toFixed(1)} / 10
                            </span>
                          </div>
                          <div className="w-full bg-[#181c26] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${(ref.foulDecisionsAvg / 10) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* 4. الهدوء */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                              الهدوء وضبط النفس والسيطرة على التوتر:
                            </span>
                            <span className="font-bold font-mono text-purple-400">
                              {ref.composureAvg.toFixed(1)} / 10
                            </span>
                          </div>
                          <div className="w-full bg-[#181c26] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-purple-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${(ref.composureAvg / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* الأوسمة والمكافأة الرمزية */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        {ref.specialties.map((spec, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-[#161a24] text-slate-300 px-2 py-0.5 rounded-lg border border-[#222735]"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      <div className="text-[11px] text-slate-400">
                        {ref.honorariumType === 'voluntary' ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <HeartHandshake className="w-3 h-3" />
                            تحكيم ودي تطوعي مجاني
                          </span>
                        ) : (
                          <span className="text-[#f5d77f] font-bold">
                            مكافأة تقديرية: {ref.honorariumAmount} ريال
                          </span>
                        )}
                      </div>
                    </div>

                    {/* آخر تقرير سري مسجل للحكم */}
                    {ref.evaluations.length > 0 && (
                      <div className="bg-[#08090d] p-3 rounded-xl border border-[#222735] text-[11px] space-y-1.5">
                        <div className="flex items-center justify-between text-slate-400 text-[10px]">
                          <span className="flex items-center gap-1 text-[#f5d77f] font-bold">
                            <Lock className="w-3 h-3" />
                            آخر تقرير سري من كابتن:
                          </span>
                          <span>{ref.evaluations[0].date}</span>
                        </div>
                        <p className="text-slate-300 italic leading-relaxed">
                          "{ref.evaluations[0].privateNotes}"
                        </p>
                        <div className="text-[10px] text-slate-400 text-left">
                          — {ref.evaluations[0].evaluatorCaptainName} ({ref.evaluations[0].evaluatorTeamName})
                        </div>
                      </div>
                    )}

                    {/* سجل التقييمات السرية الكامل (عند الفتح) */}
                    {isExpanded && (
                      <div className="space-y-3 pt-3 border-t border-[#222735]">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <EyeOff className="w-3.5 h-3.5 text-[#f5d77f]" />
                          سجل التقييمات السرية السابقة ({ref.evaluations.length} تقرير):
                        </h4>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {ref.evaluations.map((ev) => (
                            <div
                              key={ev.id}
                              className="bg-[#08090d] p-3 rounded-xl border border-[#1e2330] space-y-1.5 text-xs"
                            >
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-white">{ev.matchTitle || 'مباراة ودية'}</span>
                                <span className="text-[#f5d77f] font-mono font-bold">
                                  ⭐ {ev.overallScore.toFixed(1)}/10
                                </span>
                              </div>
                              <div className="grid grid-cols-4 gap-1 text-[10px] text-center">
                                <div className="bg-[#11141b] p-1 rounded border border-[#222735]">
                                  <span className="text-slate-400 block">نزاهة</span>
                                  <span className="font-bold text-[#f5d77f]">{ev.fairnessScore}</span>
                                </div>
                                <div className="bg-[#11141b] p-1 rounded border border-[#222735]">
                                  <span className="text-slate-400 block">وقت</span>
                                  <span className="font-bold text-blue-400">{ev.timeManagementScore}</span>
                                </div>
                                <div className="bg-[#11141b] p-1 rounded border border-[#222735]">
                                  <span className="text-slate-400 block">أخطاء</span>
                                  <span className="font-bold text-emerald-400">{ev.foulDecisionsScore}</span>
                                </div>
                                <div className="bg-[#11141b] p-1 rounded border border-[#222735]">
                                  <span className="text-slate-400 block">هدوء</span>
                                  <span className="font-bold text-purple-400">{ev.composureScore}</span>
                                </div>
                              </div>
                              <p className="text-slate-300 text-[11px] leading-relaxed pt-1">
                                "{ev.privateNotes}"
                              </p>
                              <div className="text-[9px] text-slate-400 text-left">
                                بقلم: {ev.evaluatorCaptainName} • {ev.evaluatorTeamName} • {ev.date}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* أزرار الإجراءات للكابتن */}
                  <div className="pt-4 border-t border-[#222735] flex flex-wrap items-center justify-between gap-2 mt-4">
                    <button
                      onClick={() => setExpandedRefereeId(isExpanded ? null : ref.id)}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-bold py-1"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          إخفاء سجل التقارير
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          عرض جميع تقارير الكباتن ({ref.evaluations.length})
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setBookingReferee(ref);
                          setBookingHonorarium(ref.honorariumAmount || 50);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#1a1f2c] hover:bg-[#242b3d] text-slate-200 hover:text-white border border-[#2b3345] font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#f5d77f]" />
                        طلب تحكيم مباراة
                      </button>

                      <button
                        onClick={() => {
                          setEvaluatingReferee(ref);
                          setEvalCaptainName(currentCaptainName);
                          setEvalCaptainTeam(currentCaptainTeam);
                        }}
                        className="gold-gradient-btn px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        تقييم أدائه
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. نافذة تقييم الحكم السري من الكابتن (Modal)                              */}
      {/* ========================================================================= */}
      {evaluatingReferee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto text-right">
          <div className="relative w-full max-w-2xl bg-[#11141b] border border-[#d4af37]/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-[#222735] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/35 flex items-center justify-center text-[#f5d77f]">
                  <Scale className="w-5 h-5 text-[#f5d77f]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base md:text-lg font-bold font-['Changa',sans-serif] text-white">
                      تقييم أداء الحكم الودي
                    </h3>
                    <span className="flex items-center gap-1 text-[10px] bg-[#d4af37]/15 text-[#f5d77f] px-2.5 py-0.5 rounded-full border border-[#d4af37]/30 font-bold">
                      <Lock className="w-3 h-3" />
                      سري 100%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    الحكم: <strong className="text-white">{evaluatingReferee.name}</strong> • {evaluatingReferee.neighborhood}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEvaluatingReferee(null)}
                className="w-8 h-8 rounded-full bg-[#161a23] text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* إشعار الأمان والسرية */}
            <div className="bg-[#161a24] border border-[#222735] rounded-2xl p-3.5 flex items-start gap-3">
              <EyeOff className="w-4 h-4 text-[#f5d77f] shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">
                تقييمك وملاحظاتك ستضاف إلى <strong>سجل الكباتن الداخلي فقط</strong>. لن يتم إطلاع الحكم أو الجمهور أو أي لاعب على درجاتك التفصيلية حمايةً للحياد.
              </p>
            </div>

            {/* نموذج التقييم */}
            <form onSubmit={handleSubmitEvaluation} className="space-y-4 text-xs">
              {/* بيانات المباراة والمقيم */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">عنوان المباراة أو المناسبة:</label>
                  <input
                    type="text"
                    required
                    value={evalMatchTitle}
                    onChange={(e) => setEvalMatchTitle(e.target.value)}
                    placeholder="مثال: نسور الحمدانية vs فهود الصفا (8v8)"
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">اسم الكابتن وفريقه:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={evalCaptainName}
                      onChange={(e) => setEvalCaptainName(e.target.value)}
                      placeholder="اسمك ككابتن"
                      className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      value={evalCaptainTeam}
                      onChange={(e) => setEvalCaptainTeam(e.target.value)}
                      placeholder="فريقك"
                      className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* المعايير الـ 4 الأساسية */}
              <div className="bg-[#08090d] p-4 rounded-2xl border border-[#222735] space-y-4">
                <div className="flex items-center justify-between border-b border-[#1c222e] pb-2 font-bold text-white">
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-[#f5d77f]" />
                    تقييم المعايير الأربعة (1 إلى 10):
                  </span>
                  <span className="text-xs text-[#f5d77f] font-mono">
                    المعدل: {(((fairnessScore + timeManagementScore + foulDecisionsScore + composureScore) / 4)).toFixed(1)} / 10
                  </span>
                </div>

                {/* 1. النزاهة */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-medium">
                      1. النزاهة والحياد وعدم مجاملة أي فريق:
                    </span>
                    <span className="text-[#f5d77f] font-bold font-mono">{fairnessScore.toFixed(1)} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={fairnessScore}
                    onChange={(e) => setFairnessScore(parseFloat(e.target.value))}
                    className="w-full accent-[#d4af37] cursor-pointer"
                  />
                </div>

                {/* 2. إدارة الوقت */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-medium">
                      2. إدارة الوقت والتبديلات والإيقافات بدقة:
                    </span>
                    <span className="text-blue-400 font-bold font-mono">{timeManagementScore.toFixed(1)} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={timeManagementScore}
                    onChange={(e) => setTimeManagementScore(parseFloat(e.target.value))}
                    className="w-full accent-blue-400 cursor-pointer"
                  />
                </div>

                {/* 3. حسم الأخطاء */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-medium">
                      3. حسم الأخطاء والشجاعة في احتساب القرارات ولمسات اليد:
                    </span>
                    <span className="text-emerald-400 font-bold font-mono">{foulDecisionsScore.toFixed(1)} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={foulDecisionsScore}
                    onChange={(e) => setFoulDecisionsScore(parseFloat(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>

                {/* 4. الهدوء */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-medium">
                      4. الهدوء وضبط النفس والسيطرة على انفعالات المباراة:
                    </span>
                    <span className="text-purple-400 font-bold font-mono">{composureScore.toFixed(1)} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={composureScore}
                    onChange={(e) => setComposureScore(parseFloat(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* الملاحظة السرية للكباتن */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#f5d77f]" />
                  ملاحظة وتوصية سرية للكباتن القادمين (لن يراها الحكم):
                </label>
                <textarea
                  rows={3}
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                  placeholder="اكتب رأيك بصراحة وأمانة: هل تنصح بالاستعانة به في مباريات حماسية؟ كيف كان أسلوبه في حل المشادات؟..."
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl p-3 text-white placeholder-slate-500 focus:border-[#d4af37] focus:outline-none text-xs leading-relaxed"
                />
              </div>

              <div className="pt-2">
                {evalSavedSuccess ? (
                  <div className="p-3.5 bg-[#d4af37] text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg">
                    <Check className="w-4 h-4" />
                    تم حفظ التقييم السري وتحديث السجل الداخلي للحكم بنجاح!
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEvaluatingReferee(null)}
                      className="px-4 py-2.5 rounded-xl bg-[#161a23] text-slate-300 hover:text-white font-bold text-xs"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="flex-1 gold-gradient-btn py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Scale className="w-4 h-4" />
                      اعتماد التقييم السري وحفظه في سجل الكباتن
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. نافذة طلب وتنسيق تحكيم مباراة ودية (Booking / Request Modal)             */}
      {/* ========================================================================= */}
      {bookingReferee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto text-right">
          <div className="relative w-full max-w-lg bg-[#11141b] border border-[#222735] rounded-3xl p-6 md:p-7 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#222735] pb-3.5">
              <div className="flex items-center gap-3">
                <img
                  src={bookingReferee.avatarUrl}
                  alt={bookingReferee.name}
                  className="w-10 h-10 rounded-xl object-cover border border-[#343d52]"
                />
                <div>
                  <h3 className="text-base font-bold text-white font-['Changa',sans-serif]">
                    طلب وتنسيق تحكيم مباراة ودية
                  </h3>
                  <p className="text-xs text-slate-400">
                    الحكم: <strong className="text-white">{bookingReferee.name}</strong> ({bookingReferee.neighborhood})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setBookingReferee(null)}
                className="w-7 h-7 rounded-full bg-[#161a23] text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendBookingRequest} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">تاريخ المباراة:</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">وقت البداية:</label>
                  <input
                    type="time"
                    required
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">ملعب المباراة:</label>
                  <input
                    type="text"
                    required
                    value={bookingPitch}
                    onChange={(e) => setBookingPitch(e.target.value)}
                    placeholder="اسم الملعب بجدة"
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">الحي:</label>
                  <select
                    value={bookingNeighborhood}
                    onChange={(e) => setBookingNeighborhood(e.target.value)}
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                  >
                    {JEDDAH_NEIGHBORHOODS.map((nh) => (
                      <option key={nh} value={nh}>
                        {nh}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">الفريق المنافس:</label>
                  <input
                    type="text"
                    value={bookingOpponent}
                    onChange={(e) => setBookingOpponent(e.target.value)}
                    placeholder="مثال: فهود الصفا"
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">حجم الملعب:</label>
                  <select
                    value={bookingFormat}
                    onChange={(e) => setBookingFormat(e.target.value as SquadFormat)}
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                  >
                    {['5v5', '6v6', '7v7', '8v8', '9v9', '11v11'].map((fmt) => (
                      <option key={fmt} value={fmt}>
                        {fmt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">
                  المكافأة التقديرية المقترحة (ريال):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={bookingHonorarium}
                    onChange={(e) => setBookingHonorarium(Number(e.target.value))}
                    className="w-32 bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none font-mono"
                  />
                  <span className="text-[11px] text-slate-400">
                    {bookingHonorarium === 0 ? 'تحكيم تطوعي بالاتفاق' : 'مكافأة رمزية ودية تدفع بعد انتهاء المباراة'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                {bookingSuccess ? (
                  <div className="p-3 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    تم تجهيز الطلب وفتح محادثة الواتساب المباشرة...
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full gold-gradient-btn py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                    إرسال الطلب والتواصل المباشر مع الحكم
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. نافذة تسجيل حكم ودّي جديد بالمنصة                                      */}
      {/* ========================================================================= */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto text-right">
          <div className="relative w-full max-w-lg bg-[#11141b] border border-[#222735] rounded-3xl p-6 md:p-7 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#222735] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/35 flex items-center justify-center text-[#f5d77f]">
                  <PlusCircle className="w-5 h-5 text-[#f5d77f]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Changa',sans-serif]">
                    تسجيل وتزكية حكم ودّي جديد
                  </h3>
                  <p className="text-xs text-slate-400">
                    إضافة كفاءة تحكيمية موثوقة لخدمة مباريات أحياء جدة
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsRegisterOpen(false)}
                className="w-7 h-7 rounded-full bg-[#161a23] text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterNewReferee} className="space-y-3.5 text-xs">
              {/* إمكانية ربطه بلاعب موجود */}
              {players.length > 0 && (
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium flex items-center justify-between">
                    <span>ربط بلاعب مسجل في المنصة (اختياري):</span>
                    <span className="text-[10px] text-slate-400">إذا كان لاعباً يمارس التحكيم أيضاً</span>
                  </label>
                  <select
                    value={selectedLinkedPlayerId}
                    onChange={(e) => {
                      setSelectedLinkedPlayerId(e.target.value);
                      const p = players.find((pl) => pl.id === e.target.value);
                      if (p) {
                        setNewRefName(p.name);
                        setNewRefNeighborhood(p.neighborhood);
                      }
                    }}
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                  >
                    <option value="">-- تسجيل حكم خارجي مستقل --</option>
                    {players.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.name} ({pl.clubName} - {pl.neighborhood})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">اسم الحكم بالكامل:</label>
                  <input
                    type="text"
                    required
                    value={newRefName}
                    onChange={(e) => setNewRefName(e.target.value)}
                    placeholder="مثال: الكابتن أحمد الحربي"
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">رقم الجوال للتنسيق:</label>
                  <input
                    type="tel"
                    required
                    value={newRefPhone}
                    onChange={(e) => setNewRefPhone(e.target.value)}
                    placeholder="05XXXXXXXX"
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">الحي الرئيسي بجدة:</label>
                  <select
                    value={newRefNeighborhood}
                    onChange={(e) => setNewRefNeighborhood(e.target.value)}
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                  >
                    {JEDDAH_NEIGHBORHOODS.map((nh) => (
                      <option key={nh} value={nh}>
                        {nh}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">سنوات الخبرة التحكيمية:</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={newRefExp}
                    onChange={(e) => setNewRefExp(Number(e.target.value))}
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">نوع التحكيم:</label>
                  <select
                    value={newRefHonorariumType}
                    onChange={(e) => setNewRefHonorariumType(e.target.value as any)}
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                  >
                    <option value="standard_honorarium">مكافأة رمزية تقديرية</option>
                    <option value="voluntary">تطوعي ودي بدون مقابل</option>
                  </select>
                </div>
                {newRefHonorariumType === 'standard_honorarium' && (
                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">المبلغ التقديري (ريال):</label>
                    <input
                      type="number"
                      min="30"
                      max="300"
                      value={newRefHonorariumAmount}
                      onChange={(e) => setNewRefHonorariumAmount(Number(e.target.value))}
                      className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">نبذة وتزكية مختصرة:</label>
                <textarea
                  rows={2}
                  value={newRefBio}
                  onChange={(e) => setNewRefBio(e.target.value)}
                  placeholder="معلومات عن تجاربه السابقة، تميزه في ضبط الوقت أو حسم الأخطاء..."
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl p-3 text-white placeholder-slate-500 focus:border-[#d4af37] focus:outline-none text-xs leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#161a23] text-slate-300 hover:text-white font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 gold-gradient-btn py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <Check className="w-4 h-4" />
                  تسجيل الحكم الودي بالقائمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
