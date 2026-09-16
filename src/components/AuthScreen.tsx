import React, { useState } from 'react';
import { UserRole, PlayerPosition, Player } from '../types';
import { JEDDAH_NEIGHBORHOODS, createDefaultStats } from '../utils/cardRatingEngine';
import { processImageFile } from '../utils/imageUploadHelper';
import { 
  registerWithEmail, 
  loginWithEmail, 
  loginWithGoogle, 
  loginWithApple, 
  UserAccountProfile 
} from '../services/authService';
import { FifaCard } from './FifaCard';
import { 
  Trophy, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  ShieldCheck, 
  Camera, 
  UploadCloud, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  Crown, 
  MapPin, 
  GraduationCap, 
  Scale, 
  ArrowRight,
  Phone,
  Mail,
  Lock,
  User as UserIcon,
  Shirt
} from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: UserAccountProfile) => void;
  onExplorePublic?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('player');

  // حقول تسجيل الدخول
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // حقول إنشاء الحساب المشتركة
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [neighborhood, setNeighborhood] = useState(JEDDAH_NEIGHBORHOODS[0]);

  // حقول اللاعب المحددة
  const [position, setPosition] = useState<PlayerPosition>('ST');
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(21);
  const [preferredFoot, setPreferredFoot] = useState<'right' | 'left' | 'both'>('right');
  const [number, setNumber] = useState(10);
  const [clubName, setClubName] = useState('لاعب حر');
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string>('');
  const [allowScoutVisibility, setAllowScoutVisibility] = useState(true);

  // حالات المعالجة والخطأ
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // معالجة رفع صورة اللاعب
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const dataUrl = await processImageFile(file, 400, 0.85);
      setUploadedAvatarUrl(dataUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء معالجة الصورة.');
    } finally {
      setIsLoading(false);
    }
  };

  // بطاقة المعاينة للاعب (دائماً 50 OVR للجميع عند البداية وبدون شارات مسبقة)
  const previewPlayer: Player = {
    id: 'preview-new-player',
    name: name.trim() || 'اسم اللاعب',
    height: Number(height),
    age: Number(age),
    ageCategory: age < 18 ? 'under_18' : 'adults',
    preferredFoot,
    position,
    number: Number(number),
    avatarUrl: uploadedAvatarUrl || '',
    neighborhood,
    clubName: clubName.trim() || 'لاعب حر',
    overall: 50, // بداية موحدة 50 OVR للجميع
    stats: createDefaultStats(position),
    matchesPlayed: 0,
    allowScoutVisibility,
    ratingHistory: [],
    cardTier: 'bronze',
    badges: [], // الشارات تكتسب بالمباريات والمهارات فقط
    disciplineScore: 100,
  };

  // معالجة تسجيل الدخول عبر Google
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const profile = await loginWithGoogle(selectedRole, neighborhood);
      setSuccessMessage(`تم تسجيل الدخول بنجاح عبر حساب Google! مرحباً بك كابتن ${profile.name}`);
      setTimeout(() => {
        onAuthSuccess(profile);
      }, 500);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('تم إغلاق نافذة Google من قبلك.');
      } else {
        setErrorMessage(err.message || 'تعذر تسجيل الدخول عبر Google. يرجى التأكد من اتصالك.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // معالجة تسجيل الدخول عبر Apple
  const handleAppleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const profile = await loginWithApple(selectedRole, neighborhood);
      setSuccessMessage(`تم تسجيل الدخول بنجاح عبر حساب Apple! مرحباً بك كابتن ${profile.name}`);
      setTimeout(() => {
        onAuthSuccess(profile);
      }, 500);
    } catch (err: any) {
      console.error('Apple Sign-In Error:', err);
      setErrorMessage(err.message || 'تعذر تسجيل الدخول عبر Apple.');
    } finally {
      setIsLoading(false);
    }
  };

  // معالجة تسجيل الدخول بالبريد
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const profile = await loginWithEmail(loginEmail, loginPassword);
      setSuccessMessage(`أهلاً بك مجدداً كابتن ${profile.name}! جاري الدخول...`);
      setTimeout(() => {
        onAuthSuccess(profile);
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'تعذر تسجيل الدخول. يرجى التحقق من البريد وكلمة المرور.');
    } finally {
      setIsLoading(false);
    }
  };

  // معالجة إنشاء الحساب
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('يرجى إدخال الاسم الكامل.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('يرجى إدخال بريد إلكتروني صالح.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('كلمة المرور يجب ألا تقل عن 6 خانات.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('يرجى إدخال رقم الجوال للتواصل.');
      return;
    }

    setIsLoading(true);

    try {
      const profile = await registerWithEmail({
        email,
        password,
        name,
        role: selectedRole,
        phone,
        neighborhood,
        avatarUrl: uploadedAvatarUrl,
        position,
        number,
        height,
        age,
        preferredFoot,
        clubName,
        allowScoutVisibility,
      });

      setSuccessMessage(`تم إنشاء حسابك بنجاح! مرحباً بك كابتن ${profile.name}`);
      setTimeout(() => {
        onAuthSuccess(profile);
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-['Tajawal',sans-serif]">
      {/* خلفيات جمالية هادئة */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl relative z-10 space-y-6">
        {/* ترويسة المنصة الفخمة */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#121622] border border-[#d4af37]/40 text-[#f5d77f] text-xs font-black shadow-lg">
            <Trophy className="w-4 h-4 text-[#f5d77f]" />
            <span>منصة كابتن جدة الرسمية | Captain Jeddah</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-['Changa',sans-serif]">
            كل كورة جدة في منصة واحدة <br className="hidden sm:inline" />
            <span className="gold-gradient-text">بطاقات فيفا، تحديات، وملاعب معتمدة</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            سجل دخولك أو أنشئ حسابك الرسمي لتبدأ ببطاقتك (50 OVR)، استمتع بتحديات الملاعب الودية وتقسيم العربون 50/50.
          </p>
        </div>

        {/* حاوية بطاقة المصادقة الرئيسية */}
        <div className="bg-[#0e121a] border border-[#22293a] shadow-2xl rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
          {/* تبويبات التبديل بين تسجيل الدخول وإنشاء الحساب */}
          <div className="flex rounded-2xl bg-[#07090e] p-1.5 border border-[#1b2130] mb-6 max-w-md mx-auto">
            <button
              id="tab-login"
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-3 text-xs sm:text-sm font-black rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'login'
                  ? 'bg-[#d4af37] text-black shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </button>

            <button
              id="tab-register"
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-3 text-xs sm:text-sm font-black rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-[#d4af37] text-black shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>إنشاء حساب جديد</span>
            </button>
          </div>

          {/* تنبيهات الخطأ والنجاح */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ================= 1. نموذج تسجيل الدخول ================= */}
          {activeTab === 'login' && (
            <div className="max-w-md mx-auto space-y-5">
              {/* أزرار الدخول السريع عبر Google و Apple */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg active:scale-95 transition disabled:opacity-50 border border-slate-200"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.28 21.36 7.35 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.13z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.28 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
                  </svg>
                  <span>تسجيل الدخول بحساب Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleAppleSignIn}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-black hover:bg-slate-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg active:scale-95 transition disabled:opacity-50 border border-slate-700"
                >
                  <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12-14.43-6-9.13-10.73-19.7-14.19-31.71-3.46-12.02-5.19-23.23-5.19-33.64 0-14.34 3.73-26.07 11.19-35.19 7.46-9.12 16.73-13.78 27.81-13.99 4.89 0 10.37 1.25 16.44 3.76 6.07 2.5 10.15 3.81 12.24 3.92 1.63 0 5.92-1.37 12.87-4.11 6.95-2.74 13.06-3.97 18.33-3.69 13.69.65 24.39 5.37 32.1 14.17-11.96 7.27-17.72 17.2-17.28 29.77.44 10.22 4.35 18.59 11.73 25.11 7.38 6.52 16.2 10.21 26.47 11.07-2.18 6.74-4.8 13.15-7.82 19.23zM119.22 31.86c0-6.73 2.45-13.1 7.35-19.11 4.9-6.02 11.13-10.27 18.69-12.75 1.09 5.86.76 11.62-1 17.27-1.76 5.65-4.89 10.59-9.39 14.82-4.34 4.13-9.06 6.79-14.16 7.99-.44-2.61-.88-5.35-1.49-8.22z"/>
                  </svg>
                  <span>تسجيل الدخول بحساب Apple</span>
                </button>
              </div>

              {/* خط فاصل */}
              <div className="relative py-1 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#22293a]" />
                </div>
                <span className="relative px-3 bg-[#0e121a] text-slate-400 text-xs font-bold">
                  أو الدخول بالبريد وكلمة المرور
                </span>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#d4af37]" />
                    البريد الإلكتروني:
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="example@captainjeddah.com"
                    className="w-full bg-[#07090e] border border-[#22293a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
                    كلمة المرور:
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#07090e] border border-[#22293a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37] font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    id="btn-submit-login"
                    type="submit"
                    disabled={isLoading}
                    className="gold-gradient-btn w-full py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-xl active:scale-95 transition disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 text-black" />
                        <span>تسجيل الدخول إلى حسابي</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-slate-400 hover:text-[#f5d77f] text-xs transition"
                  >
                    ليس لديك حساب بعد؟ <span className="font-bold underline">أنشئ بطاقتك وابدأ من 50 OVR الآن</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= 2. نموذج إنشاء حساب جديد ================= */}
          {activeTab === 'register' && (
            <div className="space-y-6">
              {/* اختيار نوع الحساب / الدور */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  اختر صفتك ونوع حسابك في ملاعب جدة:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('player')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      selectedRole === 'player'
                        ? 'bg-[#d4af37]/15 border-[#d4af37] text-white shadow-md'
                        : 'bg-[#07090e] border-[#1f2637] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Trophy className="w-5 h-5 text-[#f5d77f]" />
                    <span className="text-xs font-bold">لاعب كرة قدم</span>
                    <span className="text-[10px] text-slate-500">بطاقة 50 OVR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('captain')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      selectedRole === 'captain'
                        ? 'bg-[#d4af37]/15 border-[#d4af37] text-white shadow-md'
                        : 'bg-[#07090e] border-[#1f2637] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Crown className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold">كابتن ومنظم</span>
                    <span className="text-[10px] text-slate-500">تكتيك وتحديات</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('pitch_owner')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      selectedRole === 'pitch_owner'
                        ? 'bg-[#d4af37]/15 border-[#d4af37] text-white shadow-md'
                        : 'bg-[#07090e] border-[#1f2637] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <MapPin className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold">صاحب منشأة</span>
                    <span className="text-[10px] text-slate-500">حجوزات وعربون</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('academy_scout')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      selectedRole === 'academy_scout'
                        ? 'bg-[#d4af37]/15 border-[#d4af37] text-white shadow-md'
                        : 'bg-[#07090e] border-[#1f2637] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-bold">كشاف أكاديمية</span>
                    <span className="text-[10px] text-slate-500">استكشاف المواهب</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('referee')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 col-span-2 sm:col-span-1 ${
                      selectedRole === 'referee'
                        ? 'bg-[#d4af37]/15 border-[#d4af37] text-white shadow-md'
                        : 'bg-[#07090e] border-[#1f2637] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Scale className="w-5 h-5 text-purple-400" />
                    <span className="text-xs font-bold">حكم معتمد</span>
                    <span className="text-[10px] text-slate-500">تكليفات وبدلات</span>
                  </button>
                </div>
              </div>

              {/* نموذج التسجيل */}
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* الحقول الأساسية */}
                  <div className={`space-y-4 text-xs ${selectedRole === 'player' ? 'md:col-span-7' : 'md:col-span-12'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-[#d4af37]" />
                          الاسم الكامل:
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="مثلاً: سامي أحمد الحربي"
                          className="w-full bg-[#07090e] border border-[#22293a] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                          رقم الجوال:
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="05XXXXXXXX"
                          className="w-full bg-[#07090e] border border-[#22293a] rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#d4af37]" />
                          البريد الإلكتروني (لتسجيل الدخول):
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="player@example.com"
                          className="w-full bg-[#07090e] border border-[#22293a] rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
                          كلمة المرور:
                        </label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="•••••••• (6 خانات على الأقل)"
                          className="w-full bg-[#07090e] border border-[#22293a] rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                          الحي السكني بجدة:
                        </label>
                        <select
                          value={neighborhood}
                          onChange={(e) => setNeighborhood(e.target.value)}
                          className="w-full bg-[#07090e] border border-[#22293a] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                        >
                          {JEDDAH_NEIGHBORHOODS.map((n) => (
                            <option key={n} value={n} className="bg-[#07090e]">{n}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold flex items-center gap-1.5">
                          <Shirt className="w-3.5 h-3.5 text-[#d4af37]" />
                          النادي أو الفريق الحالي:
                        </label>
                        <input
                          type="text"
                          value={clubName}
                          onChange={(e) => setClubName(e.target.value)}
                          placeholder="مثلاً: لاعب حر، أو أبطال السامر"
                          className="w-full bg-[#07090e] border border-[#22293a] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    {/* حقول إضافية للاعب فقط */}
                    {selectedRole === 'player' && (
                      <div className="space-y-4 pt-2 border-t border-[#1c2232]">
                        <div className="grid grid-cols-3 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-slate-300 font-bold">المركز الأساسي:</label>
                            <select
                              value={position}
                              onChange={(e) => setPosition(e.target.value as PlayerPosition)}
                              className="w-full bg-[#07090e] border border-[#22293a] rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                            >
                              <option value="GK">حارس مرمى (GK)</option>
                              <option value="CB">قلب دفاع (CB)</option>
                              <option value="LB">ظهير أيسر (LB)</option>
                              <option value="RB">ظهير أيمن (RB)</option>
                              <option value="CDM">محور دفاعي (CDM)</option>
                              <option value="CM">وسط ميدان (CM)</option>
                              <option value="CAM">صانع ألعاب (CAM)</option>
                              <option value="LW">جناح أيسر (LW)</option>
                              <option value="RW">جناح أيمن (RW)</option>
                              <option value="ST">مهاجم صريح (ST)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-slate-300 font-bold">القدم المفضلة:</label>
                            <select
                              value={preferredFoot}
                              onChange={(e) => setPreferredFoot(e.target.value as any)}
                              className="w-full bg-[#07090e] border border-[#22293a] rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                            >
                              <option value="right">اليمنى</option>
                              <option value="left">اليسرى</option>
                              <option value="both">كلاهما</option>
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
                              className="w-full bg-[#07090e] border border-[#22293a] rounded-xl px-2.5 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-slate-300 font-bold">العمر:</label>
                            <input
                              type="number"
                              min="12"
                              max="55"
                              value={age}
                              onChange={(e) => setAge(Number(e.target.value))}
                              className="w-full bg-[#07090e] border border-[#22293a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-slate-300 font-bold">الطول (سم):</label>
                            <input
                              type="number"
                              min="130"
                              max="220"
                              value={height}
                              onChange={(e) => setHeight(Number(e.target.value))}
                              className="w-full bg-[#07090e] border border-[#22293a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]"
                            />
                          </div>
                        </div>

                        {/* قسم رفع الصورة الحقيقية للبطاقة */}
                        <div className="p-3.5 bg-[#07090e] border border-[#22293a] rounded-2xl space-y-2.5">
                          <label className="text-slate-200 font-bold flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Camera className="w-4 h-4 text-[#d4af37]" />
                              صورتك الشخصية لبطاقة فيفا:
                            </span>
                            <span className="text-[10px] text-emerald-400 font-normal">رفع مباشر من الجوال/الكمبيوتر</span>
                          </label>

                          <div className="flex items-center gap-3">
                            <label className="flex-1 cursor-pointer bg-[#121724] hover:bg-[#1a2133] border border-dashed border-[#d4af37]/60 rounded-xl p-3 text-center transition flex flex-col items-center justify-center gap-1 group">
                              <UploadCloud className="w-5 h-5 text-[#f5d77f] group-hover:scale-110 transition" />
                              <span className="text-xs font-bold text-slate-200">اختر صورة من ألبوم الصور أو الكاميرا</span>
                              <span className="text-[10px] text-slate-500">JPG, PNG, WebP (تُعالج وتُضبط للبطاقة تلقائياً)</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        {/* موافقة ظهور للكشافين */}
                        <div className="p-3 bg-[#07090e] border border-[#22293a] rounded-2xl">
                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={allowScoutVisibility}
                              onChange={(e) => setAllowScoutVisibility(e.target.checked)}
                              className="w-4 h-4 rounded accent-[#d4af37] cursor-pointer"
                            />
                            <span className="text-white font-bold text-xs">
                              أوافق على ظهور بطاقتي لكشافي الأندية والأكاديميات المعتمدة بجدة
                            </span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* معاينة بطاقة FIFA الحية عند التسجيل كلاعب */}
                  {selectedRole === 'player' && (
                    <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-[#07090e] rounded-3xl border border-[#22293a] space-y-3">
                      <div className="flex items-center gap-2 text-xs text-[#f5d77f] font-bold">
                        <Sparkles className="w-4 h-4 text-[#d4af37]" />
                        معاينة بطاقتك الابتدائية (50 OVR):
                      </div>

                      <FifaCard 
                        player={previewPlayer} 
                        size="md" 
                        interactive={true} 
                        showBadges={false} 
                        onUpdatePhoto={(newUrl) => setUploadedAvatarUrl(newUrl)}
                      />

                      <div className="p-3 rounded-xl bg-[#121622] border border-[#20273a] text-center text-[11px] text-slate-300 leading-relaxed max-w-[260px]">
                        <span className="font-bold text-emerald-400 block mb-1">✓ انطلاقة عادلة وموحدة</span>
                        تبدأ جميع البطاقات بتقييم 50 OVR، وترتفع طاقاتك بالتقييم التراكمي العادل (×3) في مباريات جدة!
                      </div>
                    </div>
                  )}
                </div>

                {/* زر تأكيد إنشاء الحساب */}
                <div className="pt-3">
                  <button
                    id="btn-submit-register"
                    type="submit"
                    disabled={isLoading}
                    className="gold-gradient-btn w-full py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-xl active:scale-95 transition disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 text-black" />
                        <span>
                          {selectedRole === 'player'
                            ? 'إصدار بطاقة فيفا الفورية وبدء مشواري (50 OVR)'
                            : 'إنشاء الحساب الرسمي والدخول'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* شريط حالة المزامنة مع Firebase */}
          <div className="mt-8 pt-4 border-t border-[#1b2130] flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-300">
                مربوط سحابياً بقاعدة بيانات Firebase (Firestore & Auth)
              </span>
            </div>
            <div className="text-slate-500 text-[10px] font-mono">
              Project: methodical-botany-glcf1 • حفظ فوري لبيانات اللاعبين
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
