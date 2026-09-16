import React, { useState } from 'react';
import { Player, TrialInvitation, AcademyProfile } from '../types';
import { 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  Lock, 
  FileText, 
  Phone, 
  Sparkles, 
  Info, 
  X,
  Car,
  AlertTriangle
} from 'lucide-react';
import { JEDDAH_NEIGHBORHOODS } from '../utils/cardRatingEngine';

interface SendTrialInviteModalProps {
  player: Player;
  academy: AcademyProfile;
  isOpen: boolean;
  onClose: () => void;
  onSendInvite: (invitation: TrialInvitation) => void;
}

export const SendTrialInviteModal: React.FC<SendTrialInviteModalProps> = ({
  player,
  academy,
  isOpen,
  onClose,
  onSendInvite,
}) => {
  const isMinor = player.ageCategory === 'under_18' || player.age < 18;

  const [trialDate, setTrialDate] = useState('2026-09-22');
  const [trialTime, setTrialTime] = useState('18:30');
  const [pitchLocation, setPitchLocation] = useState('مجمع ملاعب الجوهرة سبورتس - ملعب الأكاديمية الرئيسي');
  const [trialType, setTrialType] = useState<TrialInvitation['trialType']>(
    isMinor ? 'youth_academy_trial' : 'first_team_scouting'
  );
  const [confidentialNotes, setConfidentialNotes] = useState(
    `تمت متابعة أداء اللاعب في مركز (${player.position}) بمعدل ${player.overall} OVR، ويمتلك مواصفات فنية وبدنية تتوافق مع متطلبات فئاتنا السنية.`
  );
  const [guardianPhone, setGuardianPhone] = useState('');
  const [transportationProvided, setTransportationProvided] = useState(true);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (academy.availableInvitations <= 0) {
      setErrorMsg('لقد استنفدت رصيد الدعوات الشهري لباقة اشتراكك. يرجى ترقية الباقة لإرسال دعوات جديدة.');
      return;
    }

    if (isMinor && !guardianPhone.trim()) {
      setErrorMsg('بموجب أنظمة حماية خصوصية القُصّر بالمملكة، يلزم إدخال هاتف ولي الأمر/كابتن الفريق المعتمد.');
      return;
    }

    if (!privacyAgreed) {
      setErrorMsg('يجب الموافقة على ميثاق حماية خصوصية بيانات اللاعبين وعدم مشاركتها مع أطراف ثالثة.');
      return;
    }

    const newInvite: TrialInvitation = {
      id: `invite-${Date.now()}`,
      academyId: academy.id,
      academyName: academy.academyName,
      scoutName: academy.headScoutName,
      playerId: player.id,
      playerName: player.name,
      playerPosition: player.position,
      playerAge: player.age,
      playerAgeCategory: player.ageCategory,
      playerNeighborhood: player.neighborhood,
      pitchLocation,
      trialDate,
      trialTime,
      trialType,
      status: 'sent',
      sentAt: new Date().toISOString().split('T')[0],
      guardianPhoneRequired: isMinor,
      confidentialNotes,
      transportationProvided,
    };

    onSendInvite(newInvite);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#11141b] border border-[#222735] rounded-3xl p-6 md:p-8 max-w-xl w-full space-y-5 my-8 text-right shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-[#222735] pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-[#d4af37]/15 text-[#f5d77f] border border-[#d4af37]/30">
              <Send className="w-5 h-5 text-[#f5d77f]" />
            </span>
            <div>
              <h3 className="text-base md:text-lg font-bold text-white">
                إرسال دعوة اختبار أداء رسمية (Trial Invitation)
              </h3>
              <p className="text-xs text-[#d4af37]">
                من: {academy.academyName} | الكشاف: {academy.headScoutName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#161a23] text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* بطاقة اللاعب المستهدف */}
        <div className="bg-[#08090d] border border-[#222735] p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={player.avatarUrl}
              alt={player.name}
              className="w-12 h-12 rounded-2xl object-cover border border-[#d4af37]/40"
            />
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <span>{player.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-[#d4af37]/20 text-[#f5d77f] font-mono">
                  {player.overall} OVR
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>مركز: {player.position}</span>
                <span>•</span>
                <span>{player.neighborhood}</span>
                <span>•</span>
                <span>العمر: {player.age} سنة</span>
              </div>
            </div>
          </div>

          <span
            className={`text-[11px] px-2.5 py-1 rounded-full font-bold border ${
              isMinor
                ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {isMinor ? 'فئة الناشئين (<18)' : 'فئة الكبار (18+)'}
          </span>
        </div>

        {/* تنبيه خصوصية القصر والأمان الرياضي */}
        {isMinor && (
          <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-2xl space-y-1.5 text-xs text-blue-300">
            <div className="flex items-center gap-2 font-bold">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              <span>نظام حماية خصوصية القُصّر (أقل من 18 عاماً):</span>
            </div>
            <p className="text-[11px] text-blue-200/90 leading-relaxed">
              وفق سياسة المنصة والاتحاد السعودي، ترسل نسخة رسمية ومشفرة من الدعوة إلى رقم ولي الأمر/كابتن الفريق، ولا يُكشف عن بيانات الاتصال المباشرة للاعب قبل موافقة ولي الأمر الرسمية.
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>تاريخ اختبار الأداء:</span>
              </label>
              <input
                type="date"
                required
                value={trialDate}
                onChange={(e) => setTrialDate(e.target.value)}
                className="w-full bg-[#08090d] border border-[#222735] text-white rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>وقت الاختبار والتجمع:</span>
              </label>
              <input
                type="time"
                required
                value={trialTime}
                onChange={(e) => setTrialTime(e.target.value)}
                className="w-full bg-[#08090d] border border-[#222735] text-white rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-bold block flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>مقر الأكاديمية / الملعب المعتمد للاختبار بجدة:</span>
            </label>
            <input
              type="text"
              required
              value={pitchLocation}
              onChange={(e) => setPitchLocation(e.target.value)}
              placeholder="مثال: أرينا الصفا الدولية - ملعب الأكاديمية الرسمي"
              className="w-full bg-[#08090d] border border-[#222735] text-white rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">نوع الاختبار والتجربة:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'youth_academy_trial', label: 'تجارب فئات سنية' },
                { id: 'first_team_scouting', label: 'معايشة الفريق الأول' },
                { id: 'fitness_evaluation', label: 'تقييم بدني وتكتيكي' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTrialType(t.id as any)}
                  className={`p-2 rounded-xl border text-center transition font-bold ${
                    trialType === t.id
                      ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#f5d77f]'
                      : 'bg-[#08090d] border-[#222735] text-slate-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* حقل هاتف ولي الأمر إذا كان قاصراً */}
          {isMinor && (
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>رقم ولي الأمر / كابتن النادي المعتمد (إلزامي):</span>
              </label>
              <input
                type="tel"
                required
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="05xxxxxxxx"
                className="w-full bg-[#08090d] border border-[#222735] text-white rounded-xl px-3 py-2 font-mono focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          )}

          {/* التقرير الفني والملاحظات السرية */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>رسالة الكشاف والتقرير الفني المرفق مع الدعوة:</span>
            </label>
            <textarea
              rows={3}
              value={confidentialNotes}
              onChange={(e) => setConfidentialNotes(e.target.value)}
              className="w-full bg-[#08090d] border border-[#222735] text-slate-200 rounded-xl p-2.5 focus:border-[#d4af37] focus:outline-none text-xs"
            />
          </div>

          {/* خيار توفير مواصلات */}
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer bg-[#08090d] p-3 rounded-xl border border-[#222735]">
            <input
              type="checkbox"
              checked={transportationProvided}
              onChange={(e) => setTransportationProvided(e.target.checked)}
              className="accent-[#d4af37] w-4 h-4 rounded"
            />
            <Car className="w-4 h-4 text-[#f5d77f]" />
            <span>توفير وسيلة نقل آمنة من وإلى مقر الأكاديمية داخل مدينة جدة</span>
          </label>

          {/* ميثاق الخصوصية الإلزامي */}
          <label className="flex items-start gap-2.5 text-slate-300 cursor-pointer bg-slate-900/60 p-3 rounded-xl border border-[#222735]">
            <input
              type="checkbox"
              required
              checked={privacyAgreed}
              onChange={(e) => setPrivacyAgreed(e.target.checked)}
              className="accent-[#d4af37] w-4 h-4 rounded mt-0.5"
            />
            <div className="text-[11px] text-slate-400 leading-relaxed">
              <span className="font-bold text-white block">ميثاق حماية خصوصية وسرية بيانات اللاعب:</span>
              أتعهد بصفتي ممثل الأكاديمية المرخصة باستخدام بيانات اللاعب بغرض اختبار الأداء الرياضي حصراً، وعدم مشاركتها أو تسريبها لأي جهة غير مصرح لها.
            </div>
          </label>

          <div className="flex items-center justify-between pt-2 border-t border-[#222735]">
            <div className="text-[11px] text-slate-400">
              الرصيد المتاح: <strong className="text-[#f5d77f] font-mono">{academy.availableInvitations}</strong> دعوة متبقية
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#161a23] text-slate-400 hover:text-white"
              >
                إلغاء
              </button>

              <button
                type="submit"
                className="gold-gradient-btn px-5 py-2 rounded-xl font-bold text-slate-950 flex items-center gap-1.5 shadow-lg hover:scale-105 transition"
              >
                <Send className="w-4 h-4" />
                <span>إرسال الدعوة المعتمدة</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
