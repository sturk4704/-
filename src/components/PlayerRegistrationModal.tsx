import React, { useState } from 'react';
import { Player, PlayerPosition, AgeCategory } from '../types';
import { createDefaultStats, JEDDAH_NEIGHBORHOODS } from '../utils/cardRatingEngine';
import { syncPlayerBadges } from '../utils/dynamicBadgeEngine';
import { 
  User, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  Building2, 
  GraduationCap, 
  Scale, 
  UploadCloud, 
  FileCheck2, 
  Award,
  CheckCircle2,
  Camera
} from 'lucide-react';
import { FifaCard } from './FifaCard';
import { processImageFile } from '../utils/imageUploadHelper';

interface PlayerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePlayer: (player: Player) => void;
  onShowToast?: (msg: string) => void;
  playerToEdit?: Player | null;
}

type RegistrationRole = 'player' | 'pitch_owner' | 'academy_scout' | 'coach' | 'certified_referee';

export const PlayerRegistrationModal: React.FC<PlayerRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSavePlayer,
  onShowToast,
  playerToEdit,
}) => {
  const [selectedRole, setSelectedRole] = useState<RegistrationRole>('player');

  // بيانات اللاعب
  const [name, setName] = useState('');
  const [position, setPosition] = useState<PlayerPosition>('ST');
  const [height, setHeight] = useState(176);
  const [age, setAge] = useState(21);
  const [preferredFoot, setPreferredFoot] = useState<'right' | 'left' | 'both'>('right');
  const [neighborhood, setNeighborhood] = useState(JEDDAH_NEIGHBORHOODS[0]);
  const [number, setNumber] = useState(10);
  const [clubName, setClubName] = useState('أبطال جدة');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [allowScoutVisibility, setAllowScoutVisibility] = useState(true);

  // تحديث الحقول تلقائياً عند فتح النافذة في وضع التعديل
  React.useEffect(() => {
    if (playerToEdit) {
      setName(playerToEdit.name || '');
      setPosition(playerToEdit.position || 'ST');
      setHeight(playerToEdit.height || 176);
      setAge(playerToEdit.age || 21);
      setPreferredFoot(playerToEdit.preferredFoot || 'right');
      setNeighborhood(playerToEdit.neighborhood || JEDDAH_NEIGHBORHOODS[0]);
      setNumber(playerToEdit.number ?? 10);
      setClubName(playerToEdit.clubName || 'لاعب حر');
      setAvatarUrl(playerToEdit.avatarUrl || '');
      setAllowScoutVisibility(playerToEdit.allowScoutVisibility ?? true);
      setSelectedRole('player');
    } else {
      setName('');
      setPosition('ST');
      setHeight(176);
      setAge(21);
      setPreferredFoot('right');
      setNeighborhood(JEDDAH_NEIGHBORHOODS[0]);
      setNumber(10);
      setClubName('أبطال جدة');
      setAvatarUrl('');
      setAllowScoutVisibility(true);
      setSelectedRole('player');
    }
  }, [playerToEdit, isOpen]);

  // بيانات صاحب الملعب (يتطلب وثائق ورخصة عمل)
  const [pitchName, setPitchName] = useState('');
  const [pitchOwnerName, setPitchOwnerName] = useState('');
  const [pitchCrNumber, setPitchCrNumber] = useState('');
  const [pitchLicenseUploaded, setPitchLicenseUploaded] = useState(false);
  const [pitchPhotosUploaded, setPitchPhotosUploaded] = useState(false);

  // بيانات الكشاف والأكاديمية
  const [academyName, setAcademyName] = useState('');
  const [scoutCrNumber, setScoutCrNumber] = useState('');
  const [sportsLicenseUploaded, setSportsLicenseUploaded] = useState(false);

  // بيانات المدرب
  const [coachName, setCoachName] = useState('');
  const [coachLicenseType, setCoachLicenseType] = useState('SAFF-B');
  const [coachCertUploaded, setCoachCertUploaded] = useState(false);

  // بيانات الحكم المعتمد
  const [refereeOfficialName, setRefereeOfficialName] = useState('');
  const [refereeGrade, setRefereeGrade] = useState('حكم ساحة معتمد');
  const [refereeCertUploaded, setRefereeCertUploaded] = useState(false);

  // حالة نجاح تقديم الاعتماد للجهات
  const [submittedInstitutionSuccess, setSubmittedInstitutionSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const ageCategory: AgeCategory = age < 18 ? 'under_18' : 'adults';

  // بطاقة المعاينة للاعب - تبدأ من 50 أو تحتفظ ببيانات اللاعب الحالي
  const previewPlayer: Player = {
    id: playerToEdit ? playerToEdit.id : 'temp-preview',
    name: name.trim() || 'اسم اللاعب',
    height: Number(height),
    age: Number(age),
    ageCategory,
    preferredFoot,
    position,
    number: Number(number),
    avatarUrl,
    neighborhood,
    clubName: clubName.trim() || 'لاعب حر',
    overall: playerToEdit ? playerToEdit.overall : 50,
    stats: playerToEdit ? playerToEdit.stats : createDefaultStats(position),
    matchesPlayed: playerToEdit ? playerToEdit.matchesPlayed : 0,
    allowScoutVisibility,
    ratingHistory: playerToEdit ? playerToEdit.ratingHistory : [],
    cardTier: playerToEdit ? playerToEdit.cardTier : 'bronze',
    badges: playerToEdit ? playerToEdit.badges : [],
    disciplineScore: playerToEdit ? playerToEdit.disciplineScore : 100,
  };

  const handlePlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // إذا كان تعديلاً على بطاقة قائمة، نحافظ على نفس المعرّف والإحصائيات
    const finalPlayer: Player = syncPlayerBadges({
      ...(playerToEdit || {}),
      ...previewPlayer,
      id: playerToEdit ? playerToEdit.id : `player-${Date.now()}`,
    });

    onSavePlayer(finalPlayer);
    onClose();
  };

  const handleInstitutionSubmit = (e: React.FormEvent, roleTitle: string) => {
    e.preventDefault();
    const msg = `تم بنجاح رفع وتوثيق ملف [${roleTitle}]. تم إرسال السجل التجاري والوثائق للمراجعة والاعتماد النظامي خلال 24 ساعة!`;
    setSubmittedInstitutionSuccess(msg);
    if (onShowToast) onShowToast(msg);
    setTimeout(() => {
      setSubmittedInstitutionSuccess(null);
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#11141b] border border-[#222735] rounded-3xl p-5 md:p-8 shadow-2xl space-y-6 my-8 text-right">
        {/* رأس النافذة */}
        <div className="flex items-center justify-between border-b border-[#222735] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/35 flex items-center justify-center text-[#f5d77f]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-['Changa',sans-serif] text-white">
                  {playerToEdit ? `تعديل بيانات بطاقة [ ${playerToEdit.name} ]` : 'بوابة التسجيل والتوثيق الموحدة | كابتن جدة'}
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                {playerToEdit
                  ? 'تعديل بيانات بطاقتك وتحديثها مباشرة في قاعدة البيانات السحابية مع الحفاظ على التقييم والشارات'
                  : 'تسجيل فوري للاعبين بدون وثائق • وتوثيق نظامي معتمد للمنشآت والملاعب والكشافين'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#161a23] text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* أشرطة التبويب حسب الدور لاختيار فئة التسجيل (تظهر فقط عند إنشاء جديد) */}
        {!playerToEdit && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#1c222e]">
            {[
              { id: 'player', label: 'لاعب كروي (بدون وثائق)', icon: User, note: 'تسجيل فوري' },
              { id: 'pitch_owner', label: 'صاحب ملعب (وثائق وسجل تجاري)', icon: Building2, note: 'يتطلب ترخيص' },
              { id: 'academy_scout', label: 'أكاديمية / كشاف أندية', icon: GraduationCap, note: 'يتطلب اعتماد' },
              { id: 'coach', label: 'مدرب معتمد', icon: Award, note: 'رخصة تدريب' },
              { id: 'certified_referee', label: 'حكم معتمد رسمياً', icon: Scale, note: 'شهادة تحكيم' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedRole === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedRole(tab.id as RegistrationRole)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/50 shadow-sm'
                      : 'bg-[#0d1017] text-slate-400 hover:text-white border border-[#1e2433]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#f5d77f]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* تنبيه النظام الصريح بخصوص عدم طلب وثائق للاعبين مقابل إلزامية الوثائق لغيرهم */}
        {selectedRole === 'player' ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center gap-3 text-xs text-emerald-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong>تسجيل فوري بدون وثائق للاعبين:</strong> يبدأ اللاعب مباشرة ببطاقة فيفا مبدئية 50 OVR دون الحاجة لرفع بطاقة هوية أو سجل تجاري لسهولة وسرعة الانطلاق!
            </span>
          </div>
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-center gap-3 text-xs text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong>التزام نظامي صارم:</strong> وفق الأنظمة واللوائح، لا يُقبل تسجيل أصحاب الملاعب، الأكاديميات، الكشافين، الحكام المعتمدين، أو المدربين إلا بعد رفع وتوثيق رخص العمل والسجلات الرسمية لضمان سلامة وأمان اللاعبين.
            </span>
          </div>
        )}

        {submittedInstitutionSuccess && (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{submittedInstitutionSuccess}</span>
          </div>
        )}

        {/* 1. تسجيل اللاعب */}
        {selectedRole === 'player' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* نموذج تعبئة البيانات */}
            <form onSubmit={handlePlayerSubmit} className="md:col-span-7 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">الاسم الكامل:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثلاً: سامي الجدعاني"
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">المركز الأساسي:</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as PlayerPosition)}
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="GK" className="bg-[#08090d]">حارس مرمى (GK)</option>
                    <option value="CB" className="bg-[#08090d]">قلب دفاع (CB)</option>
                    <option value="LB" className="bg-[#08090d]">ظهير أيسر (LB)</option>
                    <option value="RB" className="bg-[#08090d]">ظهير أيمن (RB)</option>
                    <option value="CDM" className="bg-[#08090d]">محور دفاعي (CDM)</option>
                    <option value="CM" className="bg-[#08090d]">وسط ميدان (CM)</option>
                    <option value="CAM" className="bg-[#08090d]">صانع ألعاب (CAM)</option>
                    <option value="LW" className="bg-[#08090d]">جناح أيسر (LW)</option>
                    <option value="RW" className="bg-[#08090d]">جناح أيمن (RW)</option>
                    <option value="ST" className="bg-[#08090d]">مهاجم صريح (ST)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">الطول بالسنتيمتر (سم):</label>
                  <input
                    type="number"
                    required
                    min="130"
                    max="220"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">العمر:</label>
                  <input
                    type="number"
                    required
                    min="10"
                    max="55"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">القدم المفضلة:</label>
                  <select
                    value={preferredFoot}
                    onChange={(e) => setPreferredFoot(e.target.value as any)}
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="right" className="bg-[#08090d]">اليمنى</option>
                    <option value="left" className="bg-[#08090d]">اليسرى</option>
                    <option value="both" className="bg-[#08090d]">كلتا القدمين</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">رقم القميص:</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={number}
                    onChange={(e) => setNumber(Number(e.target.value))}
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">الحي السكني بجدة:</label>
                  <select
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    {JEDDAH_NEIGHBORHOODS.map((n) => (
                      <option key={n} value={n} className="bg-[#08090d]">{n}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">فريقك أو ناديك الحالي:</label>
                  <input
                    type="text"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    placeholder="مثال: نجوم المرجان"
                    className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-[#08090d] border border-[#222735] rounded-2xl space-y-2">
                <label className="text-slate-300 font-bold flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#d4af37]" />
                    الصورة الشخصية لبطاقة فيفا:
                  </span>
                  <span className="text-[10px] text-emerald-400">رفع مباشر من الجوال / الجهاز</span>
                </label>
                <label className="flex flex-col items-center justify-center p-3 border border-dashed border-[#d4af37]/50 rounded-xl bg-[#121622] hover:bg-[#181d2c] cursor-pointer transition text-center gap-1">
                  <UploadCloud className="w-5 h-5 text-[#f5d77f]" />
                  <span className="text-xs font-bold text-slate-200">اختر صورة للبطاقة</span>
                  <span className="text-[10px] text-slate-500">JPG, PNG, WebP (تُعالج وتُضبط تلقائياً)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const dataUrl = await processImageFile(file, 400, 0.85);
                        setAvatarUrl(dataUrl);
                      } catch (err: any) {
                        alert(err.message || 'تعذر معالجة الصورة');
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {/* شرط موافقة اللاعب على الظهور للكشافين والأكاديميات */}
              <div className="p-3.5 bg-[#08090d] border border-[#222735] rounded-2xl space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowScoutVisibility}
                    onChange={(e) => setAllowScoutVisibility(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#d4af37] cursor-pointer"
                  />
                  <span className="text-white font-bold text-xs">
                    أوافق على إتاحة بطاقتي وبياناتي للكشافين والأكاديميات الرياضية بجدة
                  </span>
                </label>
                <p className="text-[10px] text-slate-400 pr-6">
                  إذا قمت بإلغاء هذا الخيار، لن تتمكن الأكاديميات أو كشافو الأندية من رؤية ملفك حتى لو كان لديهم اشتراك مدفوع.
                </p>
              </div>

              <button
                type="submit"
                className="gold-gradient-btn w-full py-3 text-xs md:text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>{playerToEdit ? '💾 حفظ وتثبيت التعديلات على البطاقة' : 'إنشاء بطاقة فيفا الفورية (50 OVR)'}</span>
              </button>
            </form>

            {/* معاينة حية لبطاقة FIFA */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-[#08090d] rounded-3xl border border-[#222735] space-y-3">
              <span className="text-xs text-slate-400 font-bold">
                {playerToEdit ? 'معاينة التعديلات على بطاقتك:' : 'معاينة بطاقتك الابتدائية:'}
              </span>
              <FifaCard player={previewPlayer} size="md" interactive={false} showBadges={true} />
              <div className="text-center text-[11px] text-slate-500 max-w-[240px]">
                {playerToEdit
                  ? `طاقتك الحالية: ${playerToEdit.overall} OVR | تحتفظ بكافة مبارياتك وشاراتك السابقة`
                  : 'طاقة أولية 50 لكافة الإحصائيات، تتضاعف نقاطك (×3) في المباريات!'}
              </div>
            </div>
          </div>
        )}

        {/* 2. تسجيل صاحب ملعب (يتطلب رخصة وسجل وصور) */}
        {selectedRole === 'pitch_owner' && (
          <form onSubmit={(e) => handleInstitutionSubmit(e, 'صاحب ملعب ومجمع رياضي')} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">اسم المجمع أو الملعب:</label>
                <input
                  type="text"
                  required
                  value={pitchName}
                  onChange={(e) => setPitchName(e.target.value)}
                  placeholder="مثال: مجمع ملاعب الجوهرة سبورتس"
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">اسم المالك أو المسؤول المعتمد:</label>
                <input
                  type="text"
                  required
                  value={pitchOwnerName}
                  onChange={(e) => setPitchOwnerName(e.target.value)}
                  placeholder="الاسم الثلاثي للمسؤول"
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">رقم السجل التجاري / رخصة البلدية:</label>
                <input
                  type="text"
                  required
                  value={pitchCrNumber}
                  onChange={(e) => setPitchCrNumber(e.target.value)}
                  placeholder="مثال: 4030XXXXXX"
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">الحي بجدة:</label>
                <select className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]">
                  {JEDDAH_NEIGHBORHOODS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* رفع الوثائق المطلوبة إجبارياً */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#08090d] border border-[#222735] rounded-2xl space-y-2">
                <span className="font-bold text-slate-200 block">1. رخصة العمل البلدية والسجل التجاري:</span>
                <p className="text-[11px] text-slate-400">إثبات نظامية تشغيل المنشأة الرياضية بجدة.</p>
                <button
                  type="button"
                  onClick={() => setPitchLicenseUploaded(!pitchLicenseUploaded)}
                  className={`w-full py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    pitchLicenseUploaded
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-[#141822] text-slate-300 border-[#2b3345] hover:border-[#d4af37]'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{pitchLicenseUploaded ? '✓ تم إرفاق وثيقة السجل التجاري' : 'إرفاق صورة السجل التجاري / الرخصة (PDF/IMG)'}</span>
                </button>
              </div>

              <div className="p-4 bg-[#08090d] border border-[#222735] rounded-2xl space-y-2">
                <span className="font-bold text-slate-200 block">2. صور الملاعب والمرافق الملحقة:</span>
                <p className="text-[11px] text-slate-400">صور العشب، الإنارة الليلية، غرف التبديل، والمواقف.</p>
                <button
                  type="button"
                  onClick={() => setPitchPhotosUploaded(!pitchPhotosUploaded)}
                  className={`w-full py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    pitchPhotosUploaded
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-[#141822] text-slate-300 border-[#2b3345] hover:border-[#d4af37]'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{pitchPhotosUploaded ? '✓ تم إرفاق صور الملاعب والمرافق' : 'رفع ألبوم صور الملعب والمرافق (ZIP/PNG)'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="gold-gradient-btn w-full py-3 text-xs md:text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 mt-4"
            >
              <FileCheck2 className="w-4 h-4 text-slate-950" />
              <span>إرسال طلب توثيق الملعب للمراجعة والاعتماد</span>
            </button>
          </form>
        )}

        {/* 3. تسجيل أكاديمية أو كشاف أندية */}
        {selectedRole === 'academy_scout' && (
          <form onSubmit={(e) => handleInstitutionSubmit(e, 'أكاديمية وكشاف معتمد')} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">اسم الأكاديمية أو النادي الرياضي:</label>
                <input
                  type="text"
                  required
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  placeholder="مثال: أكاديمية مواهب الغربية لكرة القدم"
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">رقم ترخيص وزارة الرياضة / السجل التجاري:</label>
                <input
                  type="text"
                  required
                  value={scoutCrNumber}
                  onChange={(e) => setScoutCrNumber(e.target.value)}
                  placeholder="رقم الترخيص الرياضي المعتمد"
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            <div className="p-4 bg-[#08090d] border border-[#222735] rounded-2xl space-y-2">
              <span className="font-bold text-slate-200 block">إرفاق ترخيص العمل الرياضي المعتمد:</span>
              <p className="text-[11px] text-slate-400">مطلوب للتحقق من هوية الكشافين وتفعيل باقات الاشتراك المدفوعة لاستكشاف اللاعبين.</p>
              <button
                type="button"
                onClick={() => setSportsLicenseUploaded(!sportsLicenseUploaded)}
                className={`w-full py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  sportsLicenseUploaded
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-[#141822] text-slate-300 border-[#2b3345] hover:border-[#d4af37]'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>{sportsLicenseUploaded ? '✓ تم إرفاق ترخيص الأكاديمية' : 'إرفاق وثيقة الاعتماد الرياضي (PDF)'}</span>
              </button>
            </div>

            <button
              type="submit"
              className="gold-gradient-btn w-full py-3 text-xs md:text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-slate-950" />
              <span>تقديم طلب توثيق الكشاف / الأكاديمية</span>
            </button>
          </form>
        )}

        {/* 4. تسجيل مدرب */}
        {selectedRole === 'coach' && (
          <form onSubmit={(e) => handleInstitutionSubmit(e, 'مدرب كروي معتمد')} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">اسم المدرب الكامل:</label>
                <input
                  type="text"
                  required
                  value={coachName}
                  onChange={(e) => setCoachName(e.target.value)}
                  placeholder="مثال: كابتن أحمد الغامدي"
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">المؤهل والرخصة التدريبية:</label>
                <select
                  value={coachLicenseType}
                  onChange={(e) => setCoachLicenseType(e.target.value)}
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="SAFF-A">رخصة الاتحاد السعودي / الآسيوي (A) - محترفين</option>
                  <option value="SAFF-B">رخصة الاتحاد السعودي / الآسيوي (B) - فئات سنية</option>
                  <option value="SAFF-C">رخصة الاتحاد السعودي / الآسيوي (C) - براعم وأشبال</option>
                  <option value="SAFF-D">رخصة الاتحاد السعودي (D) - تنمية مهارات أساسية</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-[#08090d] border border-[#222735] rounded-2xl space-y-2">
              <span className="font-bold text-slate-200 block">إرفاق شهادة الرخصة التدريبية المعتمدة:</span>
              <button
                type="button"
                onClick={() => setCoachCertUploaded(!coachCertUploaded)}
                className={`w-full py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  coachCertUploaded
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-[#141822] text-slate-300 border-[#2b3345] hover:border-[#d4af37]'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>{coachCertUploaded ? '✓ تم إرفاق الشهادة التدريبية' : 'إرفاق شهادة الرخصة التدريبية (PDF/IMG)'}</span>
              </button>
            </div>

            <button
              type="submit"
              className="gold-gradient-btn w-full py-3 text-xs md:text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>تقديم طلب اعتماد المدرب</span>
            </button>
          </form>
        )}

        {/* 5. تسجيل حكم معتمد رسمي */}
        {selectedRole === 'certified_referee' && (
          <form onSubmit={(e) => handleInstitutionSubmit(e, 'حكم معتمد رسمياً')} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">اسم الحكم الرسمي:</label>
                <input
                  type="text"
                  required
                  value={refereeOfficialName}
                  onChange={(e) => setRefereeOfficialName(e.target.value)}
                  placeholder="الاسم الرباعي الرسمي"
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">درجة التحكيم والصفة:</label>
                <select
                  value={refereeGrade}
                  onChange={(e) => setRefereeGrade(e.target.value)}
                  className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="حكم ساحة معتمد">حكم ساحة معتمد</option>
                  <option value="حكم درجة أولى">حكم درجة أولى</option>
                  <option value="حكم درجة ثانية">حكم درجة ثانية</option>
                  <option value="حكم درجة ثالثة">حكم درجة ثالثة</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-[#08090d] border border-[#222735] rounded-2xl space-y-2">
              <span className="font-bold text-slate-200 block">إرفاق بطاقة / شهادة التحكيم الرسمية المعتمدة:</span>
              <p className="text-[11px] text-slate-400">تنويه: الحكام الوديون من اللاعبين يديرون المباريات ودياً بسرية، أما الحكام المعتمدون رسمياً فيظهرون علناً في المنصة.</p>
              <button
                type="button"
                onClick={() => setRefereeCertUploaded(!refereeCertUploaded)}
                className={`w-full py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  refereeCertUploaded
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-[#141822] text-slate-300 border-[#2b3345] hover:border-[#d4af37]'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>{refereeCertUploaded ? '✓ تم إرفاق بطاقة التحكيم' : 'إرفاق صورة بطاقة التحكيم الرسمية (IMG/PDF)'}</span>
              </button>
            </div>

            <button
              type="submit"
              className="gold-gradient-btn w-full py-3 text-xs md:text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2"
            >
              <Scale className="w-4 h-4 text-slate-950" />
              <span>تقديم طلب اعتماد الحكم الرسمي</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

