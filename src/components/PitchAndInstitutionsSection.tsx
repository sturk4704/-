import React, { useState } from 'react';
import { Pitch, PendingVerificationRequest, InstitutionRole, FINANCIAL_FEES, GroupWallet, UserRole } from '../types';
import { JEDDAH_NEIGHBORHOODS } from '../utils/cardRatingEngine';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  FileText, 
  Upload, 
  CheckCircle2, 
  CreditCard, 
  Wallet, 
  ShoppingBag, 
  UserCheck, 
  Award, 
  Search,
  Sparkles,
  Lock,
  Camera,
  AlertCircle
} from 'lucide-react';

export const MOCK_PITCHES: Pitch[] = [
  {
    id: 'pitch-1',
    name: 'ملاعب الجوهرة سبورتس - مجمع راقي',
    neighborhood: 'حي الحمدانية',
    city: 'جدة',
    type: 'عشب صناعي (جيل رابع)',
    capacity: ['5v5', '7v7', '8v8', '9v9'],
    pricePerHour: 250,
    rating: 4.9,
    isCoveredAirConditioned: true,
    features: ['مغلق ومكيف لمناخ جدة', 'كشافات ليد ليلية', 'غرف تبديل واستحمام', 'مواقف سيارات واسعة'],
    imageUrl: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&auto=format&fit=crop&q=80',
    verificationStatus: 'verified',
    commercialRegFile: 'CR-1010884920.pdf',
  },
  {
    id: 'pitch-2',
    name: 'مجمع أكاديمية الموج الأزرق الدولي',
    neighborhood: 'حي أبحر الشمالية',
    city: 'جدة',
    type: 'عشب طبيعي',
    capacity: ['7v7', '8v8', '11v11'],
    pricePerHour: 320,
    rating: 4.8,
    isCoveredAirConditioned: false,
    features: ['عشب طبيعي معتمد', 'مدرجات جماهير', 'لوحة نتائج إلكترونية', 'مقهى رياضي'],
    imageUrl: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&auto=format&fit=crop&q=80',
    verificationStatus: 'verified',
    commercialRegFile: 'CR-1010399481.pdf',
  },
  {
    id: 'pitch-3',
    name: 'صالات كابتن جدة المغلقة الفاخرة',
    neighborhood: 'حي السامر',
    city: 'جدة',
    type: 'صالات داخلية مكيفة',
    capacity: ['5v5', '6v6', '7v7'],
    pricePerHour: 220,
    rating: 4.9,
    isCoveredAirConditioned: true,
    features: ['تكييف مركزي بارد جداً', 'أرضيات باركيه ومطاط احترافي', 'كاميرات لتصوير الأهداف'],
    imageUrl: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=600&auto=format&fit=crop&q=80',
    verificationStatus: 'verified',
    commercialRegFile: 'CR-4030291044.pdf',
  },
  {
    id: 'pitch-4',
    name: 'أرينا الصفا الدولية لكرة القدم',
    neighborhood: 'حي الصفا',
    city: 'جدة',
    type: 'عشب صناعي (جيل رابع)',
    capacity: ['6v6', '7v7', '8v8', '10v10'],
    pricePerHour: 260,
    rating: 4.7,
    isCoveredAirConditioned: true,
    features: ['عازل حراري ومكيف', 'تصوير فيديو عالي الدقة HD', 'مدرج كبار الزوار'],
    imageUrl: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=600&auto=format&fit=crop&q=80',
    verificationStatus: 'verified',
    commercialRegFile: 'CR-4030998124.pdf',
  },
  {
    id: 'pitch-5',
    name: 'ملاعب النجوم - كورنيش المرجان',
    neighborhood: 'حي المرجان',
    city: 'جدة',
    type: 'عشب طبيعي',
    capacity: ['8v8', '9v9', '11v11'],
    pricePerHour: 340,
    rating: 4.9,
    isCoveredAirConditioned: false,
    features: ['إطلالة بحرية ونسيم عليل', 'أرضية قانونية معتمدة', 'كشافات فيليبس عالمية'],
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
    verificationStatus: 'verified',
    commercialRegFile: 'CR-4030887211.pdf',
  },
];

const INITIAL_WALLETS: GroupWallet[] = [
  {
    id: 'w-1',
    groupName: 'قروب كروات الحمدانية الأسبوعي',
    pitchName: 'ملاعب الجوهرة سبورتس',
    neighborhood: 'حي الحمدانية',
    weeklyDay: 'كل أربعاء',
    weeklyTime: '21:00',
    memberCount: 16,
    balance: 1850,
    weeklyDeduction: 250,
    members: [
      { playerId: 'p1', playerName: 'عمر باخشوين', status: 'paid' },
      { playerId: 'p2', playerName: 'سلطان الحربي', status: 'paid' },
      { playerId: 'p3', playerName: 'خالد الصبحي', status: 'pending' },
    ],
  },
];

interface PitchAndInstitutionsSectionProps {
  currentUserRole?: UserRole;
}

export const PitchAndInstitutionsSection: React.FC<PitchAndInstitutionsSectionProps> = ({
  currentUserRole = 'captain',
}) => {
  const [activeTab, setActiveTab] = useState<'booking' | 'kyc_verification' | 'group_wallets' | 'express_store'>(
    currentUserRole === 'pitch_owner' ? 'kyc_verification' : 'booking'
  );
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
  const [pitches, setPitches] = useState<Pitch[]>(MOCK_PITCHES);
  const [wallets, setWallets] = useState<GroupWallet[]>(INITIAL_WALLETS);

  // مودال حجز الملعب وتفصيل العربون الجديد (100 + 10 + 3.75)
  const [bookingPitch, setBookingPitch] = useState<Pitch | null>(null);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  // نموذج رفع الوثائق والتراخيص (أصحاب الملاعب، الكشافين، الأكاديميات، الحكام، المدربين)
  const [kycRole, setKycRole] = useState<InstitutionRole>('pitch_owner');
  const [kycName, setKycName] = useState('');
  const [kycNeighborhood, setKycNeighborhood] = useState(JEDDAH_NEIGHBORHOODS[0]);
  const [kycPhone, setKycPhone] = useState('');
  const [kycEmail, setKycEmail] = useState('');
  const [kycLicenseNo, setKycLicenseNo] = useState('');
  const [kycUploadedDocs, setKycUploadedDocs] = useState<string[]>(['السجل_التجاري_ساري_المفعول.pdf', 'صور_الملعب_الاربعة.jpg']);
  const [kycPlan, setKycPlan] = useState<'starter' | 'pro' | 'elite'>('pro');
  const [kycStatusMsg, setKycStatusMsg] = useState<string | null>(null);

  // تصفية الملاعب
  const filteredPitches = pitches.filter(
    (p) => selectedNeighborhood === 'all' || p.neighborhood === selectedNeighborhood
  );

  // تأكيد الحجز
  const handleConfirmBooking = () => {
    if (!bookingPitch) return;
    setBookingSuccessMsg(
      `تم تأكيد حجز [ ${bookingPitch.name} ] وسداد العربون (100 ريال عربون غير مسترد + 10 ريال عمولة المنصة + 3.75 ريال رسوم بوابة الدفع = الإجمالي 113.75 ريال). تم إصدار الفاتورة وتأكيد الموعد!`
    );
    setBookingPitch(null);
    setTimeout(() => setBookingSuccessMsg(null), 6000);
  };

  // رفع طلب التحقق
  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycName || !kycLicenseNo) return;

    setKycStatusMsg(
      `تم استلام طلب التحقق لـ [ ${kycName} ] بنجاح مع كافة المستندات ورخص العمل. سيقوم فريق إدارة كابتن جدة بمطابقة السجل والموافقة على حسابك وتفعيل اشتراكك خلال 24 ساعة!`
    );
    setKycName('');
    setKycLicenseNo('');
    setTimeout(() => setKycStatusMsg(null), 8000);
  };

  return (
    <div className="space-y-6">
      {/* إشعارات علوية */}
      {bookingSuccessMsg && (
        <div className="p-4 bg-emerald-500 text-slate-950 font-black text-xs md:text-sm rounded-2xl shadow-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{bookingSuccessMsg}</span>
          </div>
          <button onClick={() => setBookingSuccessMsg(null)} className="text-slate-950 font-bold">✕</button>
        </div>
      )}

      {kycStatusMsg && (
        <div className="p-4 bg-amber-500 text-slate-950 font-black text-xs md:text-sm rounded-2xl shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <span>{kycStatusMsg}</span>
          </div>
          <button onClick={() => setKycStatusMsg(null)} className="text-slate-950 font-bold">✕</button>
        </div>
      )}

      {/* شريط التبويبات الرئيسي */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#11141b] p-3.5 rounded-2xl border border-[#222735]">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {[
            { id: 'booking', label: 'حجز الملاعب', icon: MapPin },
            { id: 'kyc_verification', label: 'التوثيق والتراخيص', icon: ShieldCheck },
            { id: 'group_wallets', label: 'المحفظة المشتركة', icon: Wallet },
            { id: 'express_store', label: 'سوق المستلزمات', icon: ShoppingBag },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#d4af37]/15 text-[#f5d77f] border border-[#d4af37]/40 shadow-sm'
                    : 'bg-[#161a23] text-slate-400 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#f5d77f]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. تبويب حجز الملاعب ونظام العربون المعتمد */}
      {activeTab === 'booking' && (
        <div className="space-y-6">
          {/* تنبيه نظام الدفع المعتمد */}
          <div className="bg-[#11141b] border border-emerald-500/30 rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  نظام حجز وتأكيد الملاعب المعتمد في كابتن جدة
                </h3>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                يتم تأكيد الحجز بدفع <strong>عربون 100 ريال غير مسترد</strong> لضمان حضور الفريقين + <strong>10 ريال عمولة المنصة</strong> + <strong>3.75 ريال رسوم بوابة الدفع الإلكتروني</strong> (مدى / Apple Pay / STC Pay). الإجمالي المستحق عند الحجز = <strong className="text-[#f5d77f]">113.75 ريال</strong>، ويُدفع باقي قيمة إيجار الملعب في الاستقبال أو عبر المحفظة.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#08090d] px-4 py-2 rounded-2xl border border-[#222735] shrink-0">
              <span className="text-xs text-slate-400">تصفية حسب الحي:</span>
              <select
                value={selectedNeighborhood}
                onChange={(e) => setSelectedNeighborhood(e.target.value)}
                className="bg-transparent text-[#f5d77f] font-bold text-xs focus:outline-none"
              >
                <option value="all" className="bg-[#08090d]">كافة أحياء جدة</option>
                {JEDDAH_NEIGHBORHOODS.map((n) => (
                  <option key={n} value={n} className="bg-[#08090d]">{n}</option>
                ))}
              </select>
            </div>
          </div>

          {/* شبكة الملاعب بجدة */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPitches.map((pitch) => (
              <div
                key={pitch.id}
                className="bg-[#11141b] rounded-3xl border border-[#222735] overflow-hidden flex flex-col justify-between hover:border-[#d4af37]/45 transition shadow-xl group"
              >
                <div className="space-y-4">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={pitch.imageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold text-white flex items-center gap-1 border border-white/20">
                      <MapPin className="w-3.5 h-3.5 text-[#f5d77f]" />
                      {pitch.neighborhood}
                    </div>
                    {pitch.isCoveredAirConditioned && (
                      <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-white border border-blue-400/40">
                        ❄️ مغطى ومكيف بالكامل
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 bg-emerald-500/90 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-[10px] font-bold text-slate-950 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                      ملعب مرخص ومطابق
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h4 className="text-base font-bold text-white">{pitch.name}</h4>
                      <p className="text-xs text-slate-400">{pitch.type}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {pitch.capacity.map((cap) => (
                        <span
                          key={cap}
                          className="px-2 py-0.5 bg-[#08090d] rounded-md text-[10px] font-mono font-bold text-[#f5d77f] border border-[#222735]"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>

                    <div className="bg-[#08090d] p-3 rounded-2xl border border-[#222735] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>إيجار الساعة:</span>
                        <span className="font-bold text-white font-mono">{pitch.pricePerHour} ر.س / ساعة</span>
                      </div>
                      <div className="flex items-center justify-between text-[#f5d77f] text-[11px]">
                        <span>العربون وتأكيد الحجز الآن:</span>
                        <span className="font-bold font-mono">113.75 ريال شامل الرسوم</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => setBookingPitch(pitch)}
                    className="gold-gradient-btn w-full py-3 rounded-2xl text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg"
                  >
                    <CreditCard className="w-4 h-4 text-slate-950" />
                    <span>حجز وتأكيد العربون (113.75 ريال)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. تبويب رفع الوثائق والتراخيص (أصحاب الملاعب، الكشافين، الأكاديميات، الحكام، المدربين) */}
      {activeTab === 'kyc_verification' && (
        <div className="bg-[#11141b] border border-[#222735] rounded-3xl p-6 md:p-8 space-y-8 max-w-4xl mx-auto shadow-xl">
          <div className="border-b border-[#222735] pb-4 space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#f5d77f]">
                <Lock className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold font-['Changa',sans-serif] text-white">
                بوابة التحقق والترخيص والاشتراكات الشهرية في جدة
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              شرط أمان إلزامي: لا يمكن لأصحاب الملاعب أو الكشافين أو الأكاديميات أو المدربين أو الحكام المعتمدين تفعيل حساباتهم إلا بعد رفع السجلات والتراخيص وموافقة المنصة أولاً.
            </p>
          </div>

          <form onSubmit={handleKycSubmit} className="space-y-5 text-xs">
            {/* اختيار الكيان */}
            <div className="space-y-2">
              <label className="text-slate-300 font-bold block">أنت تسجل بصفتك:</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { role: 'pitch_owner', label: 'صاحب ملعب', icon: '🏟️' },
                  { role: 'scout', label: 'كشاف أندية', icon: '🔍' },
                  { role: 'academy', label: 'أكاديمية رياضية', icon: '⚽' },
                  { role: 'coach', label: 'مدرب معتمد', icon: '📋' },
                  { role: 'certified_referee', label: 'حكم معتمد', icon: '⚖️' },
                ].map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setKycRole(item.role as InstitutionRole)}
                    className={`p-3 rounded-2xl border text-center font-bold transition flex flex-col items-center gap-1.5 ${
                      kycRole === item.role
                        ? 'bg-[#d4af37] text-slate-950 border-[#f5d77f] shadow-md'
                        : 'bg-[#08090d] text-slate-400 border-[#222735] hover:border-[#343d52]'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">الاسم الرسمي أو اسم المنشأة / الملعب:</label>
                <input
                  type="text"
                  required
                  value={kycName}
                  onChange={(e) => setKycName(e.target.value)}
                  placeholder="مثال: مجمع ملاعب الحمدانية الرياضية"
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">رقم السجل التجاري / رخصة البلدية / ترخيص الاتحاد السعودي:</label>
                <input
                  type="text"
                  required
                  value={kycLicenseNo}
                  onChange={(e) => setKycLicenseNo(e.target.value)}
                  placeholder="رقم السجل التجاري (10 أرقام) أو الرخصة"
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white font-mono focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">الحي بجدة:</label>
                <select
                  value={kycNeighborhood}
                  onChange={(e) => setKycNeighborhood(e.target.value)}
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                >
                  {JEDDAH_NEIGHBORHOODS.map((n) => (
                    <option key={n} value={n} className="bg-[#08090d]">{n}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">رقم الجوال التجاري:</label>
                <input
                  type="tel"
                  required
                  value={kycPhone}
                  onChange={(e) => setKycPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white font-mono focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">البريد الإلكتروني:</label>
                <input
                  type="email"
                  required
                  value={kycEmail}
                  onChange={(e) => setKycEmail(e.target.value)}
                  placeholder="admin@business.sa"
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white font-mono focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>

            {/* قسم رفع الملفات وصور الملاعب والتراخيص */}
            <div className="p-4 bg-[#08090d] rounded-2xl border border-dashed border-[#2c3344] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#f5d77f]" />
                  رفع صور الملعب ورخص العمل والسجل التجاري:
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">PDF / JPG / PNG</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {kycRole === 'pitch_owner'
                  ? 'يجب رفع صور زوايا الملعب، شهادة السلامة، والسجل التجاري أو رخصة البلدية الصادرة بجدة.'
                  : 'يجب رفع رخصة التدريب/الكشافة المعتمدة وإثبات الجهة التابع لها.'}
              </p>

              <div className="flex flex-wrap gap-2">
                {kycUploadedDocs.map((doc, idx) => (
                  <div key={idx} className="bg-[#161a23] px-3 py-1.5 rounded-xl border border-[#222735] text-slate-300 text-[11px] flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#f5d77f]" />
                    <span>{doc}</span>
                    <span className="text-emerald-400 font-bold">✓ جاهز للمطابقة</span>
                  </div>
                ))}
              </div>
            </div>

            {/* باقات الاشتراك الشهري (للكشافين والأكاديميات والملاعب) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-bold block">اختر باقة الاشتراك الشهري:</label>
                <span className="text-[10px] text-[#f5d77f]">وصول لقاعدة بطاقات ومواهب جدة</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'starter', name: 'الباقة الأساسية', price: '299 ر.س/شهر', desc: 'إدارة ملعب واحد أو تصفح حتى 50 موهبة شهرياً' },
                  { id: 'pro', name: 'الباقة الاحترافية (الأكثر طلباً)', price: '599 ر.س/شهر', desc: 'محرك بحث متقدم للمواهب + توجيه دعوات تجارب أداء رسمية' },
                  { id: 'elite', name: 'باقة النخبة للأندية والأكاديميات', price: '1,199 ر.س/شهر', desc: 'وصول مفتوح لكافة بطاقات فيفا + تقارير الحكام وفيديوهات المباريات' },
                ].map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setKycPlan(plan.id as any)}
                    className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                      kycPlan === plan.id
                        ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
                        : 'bg-[#08090d] border-[#222735] text-slate-400 hover:border-[#343d52]'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">{plan.name}</div>
                    <div className="text-sm font-black text-[#f5d77f] font-mono">{plan.price}</div>
                    <p className="text-[10px] text-slate-400">{plan.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="gold-gradient-btn w-full py-3.5 text-xs md:text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>رفع المستندات والاشتراك وطلب اعتماد المنشأة</span>
            </button>
          </form>
        </div>
      )}

      {/* 3. تبويب المحفظة المشتركة للمجموعة (Group Wallet) */}
      {activeTab === 'group_wallets' && (
        <div className="space-y-6">
          <div className="bg-[#11141b] border border-[#222735] rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#f5d77f]">
                <Wallet className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-lg font-bold font-['Changa',sans-serif] text-white">
                  المحفظة المشتركة للمجموعة (Group Wallet)
                </h3>
                <p className="text-xs text-slate-400">
                  حل مشكلة "اللاعب الساحب" في مباريات جدة الدورية! يشحن كل لاعب رصيده شهرياً، ويخصم النظام قيمة الحجز تلقائياً كل أسبوع.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wallets.map((wallet) => (
                <div key={wallet.id} className="bg-[#08090d] p-5 rounded-3xl border border-[#222735] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base">{wallet.groupName}</h4>
                      <p className="text-xs text-slate-400">{wallet.pitchName} - {wallet.neighborhood}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-[#d4af37]/15 text-[#f5d77f] border border-[#d4af37]/35 rounded-full text-xs font-bold font-mono">
                      {wallet.weeklyDay} @ {wallet.weeklyTime}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-[#11141b] p-3 rounded-2xl border border-[#222735] text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">رصيد المحفظة المتاح:</span>
                      <span className="font-mono font-black text-emerald-400 text-lg">{wallet.balance} ر.س</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">الخصم التلقائي الأسبوعي:</span>
                      <span className="font-mono font-black text-[#f5d77f] text-lg">{wallet.weeklyDeduction} ر.س</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 block">حالة اشتراك أعضاء القروب:</span>
                    {wallet.members.map((m) => (
                      <div key={m.playerId} className="flex items-center justify-between p-2 rounded-xl bg-[#11141b] text-xs">
                        <span className="text-white font-medium">{m.playerName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {m.status === 'paid' ? 'تم الشحن' : 'متأخر (إرسال تنبيه Nudge)'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button className="gold-gradient-btn w-full py-2.5 rounded-xl text-xs">
                    + شحن محفظة القروب لشهر قادم
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. تبويب سوق المستلزمات السريع بجدة وطاقم المباراة */}
      {activeTab === 'express_store' && (
        <div className="space-y-6">
          <div className="bg-[#11141b] border border-[#222735] rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-['Changa',sans-serif] text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#f5d77f]" />
                  سوق المستلزمات السريع وتوصيل الملعب (خلال 45 دقيقة بجدة)
                </h3>
                <p className="text-xs text-slate-400">
                  نسيت كورة أو واقي ساق أو شراب؟ نوصل لك للملعب مباشرة قبل صافرة البداية!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'كرة فيفا المعتمدة (مقاس 5)', price: 120, time: '35 دقيقة', img: 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=400&auto=format&fit=crop&q=80' },
                { name: 'واقي ساق احترافي كربون', price: 45, time: '25 دقيقة', img: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=400&auto=format&fit=crop&q=80' },
                { name: 'طقم صديري تدريب (10 حبات)', price: 80, time: '40 دقيقة', img: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=400&auto=format&fit=crop&q=80' },
                { name: 'كرتون مياه ومشروبات رياضية', price: 35, time: '20 دقيقة', img: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&auto=format&fit=crop&q=80' },
              ].map((item, i) => (
                <div key={i} className="bg-[#08090d] p-4 rounded-2xl border border-[#222735] space-y-2 text-xs">
                  <img src={item.img} alt="" className="w-full h-28 object-cover rounded-xl" />
                  <div className="font-bold text-white truncate">{item.name}</div>
                  <div className="flex justify-between items-center text-[#f5d77f] font-mono">
                    <span>{item.price} ر.س</span>
                    <span className="text-[10px] text-emerald-400">⚡ {item.time}</span>
                  </div>
                  <button className="w-full py-1.5 bg-[#171b24] hover:bg-[#d4af37] hover:text-slate-950 text-slate-200 font-bold text-[11px] rounded-lg transition">
                    طلب فوري للملعب
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* مودال تأكيد العربون للملعب المحدد */}
      {bookingPitch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#11141b] border border-[#222735] rounded-3xl p-6 md:p-8 max-w-md w-full space-y-5 text-right shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#222735] pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#f5d77f]" />
                <h3 className="text-base font-bold text-white">تفاصيل فاتورة تأكيد الحجز</h3>
              </div>
              <button onClick={() => setBookingPitch(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#08090d] p-4 rounded-2xl border border-[#222735] space-y-2">
                <div className="font-bold text-white text-sm">{bookingPitch.name}</div>
                <div className="text-slate-400">{bookingPitch.neighborhood} | {bookingPitch.type}</div>
              </div>

              {/* تفاصيل الرسوم الصارمة وفق الطلب */}
              <div className="bg-[#08090d] p-4 rounded-2xl border border-emerald-500/30 space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span>العربون (غير مسترد لجدية الحجز):</span>
                  <span className="font-mono text-white font-bold">{FINANCIAL_FEES.NON_REFUNDABLE_DEPOSIT} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>عمولة منصة كابتن جدة:</span>
                  <span className="font-mono text-white font-bold">{FINANCIAL_FEES.PLATFORM_COMMISSION} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>رسوم بوابة الدفع الإلكتروني (مدى / Apple Pay):</span>
                  <span className="font-mono text-white font-bold">{FINANCIAL_FEES.PAYMENT_GATEWAY_FEE} ر.س</span>
                </div>
                <div className="border-t border-[#222735] pt-2 flex justify-between font-black text-sm text-[#f5d77f]">
                  <span>المجموع المستحق سداده الآن:</span>
                  <span className="font-mono">{FINANCIAL_FEES.TOTAL_BOOKING_DEPOSIT} ريال</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed">
                * يتم تأكيد حجز الملعب فورا في نظام المنشأة، وترسل لك رسالة تأكيد نصية وفاتورة إلكترونية ضريبية على جوالك.
              </div>

              <button
                onClick={handleConfirmBooking}
                className="gold-gradient-btn w-full py-3 text-xs md:text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2"
              >
                <span>سداد وتأكيد الحجز فوراً ({FINANCIAL_FEES.TOTAL_BOOKING_DEPOSIT} ر.س)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
