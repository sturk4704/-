import React, { useState } from 'react';
import { Player, TransferRequest, TransferRequestType } from '../types';
import { JEDDAH_NEIGHBORHOODS } from '../utils/cardRatingEngine';
import { 
  UserPlus, 
  Send, 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Shield, 
  Phone, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  MessageCircle,
  AlertCircle
} from 'lucide-react';

interface TransferRequestModalProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
  onSubmitRequest: (request: TransferRequest) => void;
  onShowToast: (message: string) => void;
}

export const TransferRequestModal: React.FC<TransferRequestModalProps> = ({
  player,
  isOpen,
  onClose,
  onSubmitRequest,
  onShowToast,
}) => {
  // بيانات الفريق والكابتن المُرسل
  const [senderTeamName, setSenderTeamName] = useState('كتيبة صقور جدة');
  const [senderCaptainName, setSenderCaptainName] = useState('كابتن سلطان الزهراني');
  const [senderPhone, setSenderPhone] = useState('0554433221');
  const [senderNeighborhood, setSenderNeighborhood] = useState(player.neighborhood || JEDDAH_NEIGHBORHOODS[0]);
  const [senderPitch, setSenderPitch] = useState('ملعب النخبة الدولي - حي الروضة');

  // تفاصيل العرض
  const [requestType, setRequestType] = useState<TransferRequestType>('permanent_signing');
  
  // المركز المقترح بناءً على مركز اللاعب
  const defaultRole = 
    player.position === 'ST' ? 'رأس حربة أساسي ومهاجم هداف' :
    player.position === 'CAM' ? 'صانع ألعاب ومايسترو خط الوسط' :
    player.position === 'GK' ? 'حارس مرمى أول وأساسي' :
    player.position === 'CB' ? 'قلب دفاع وقائد الخط الخلفي' :
    player.position === 'LW' || player.position === 'RW' ? 'جناح هجومي أساسي' :
    player.position === 'CDM' ? 'محور ارتكاز دفاعي' :
    player.position === 'CM' ? 'لاعب وسط بوكس تو بوكس' :
    player.position === 'LB' || player.position === 'RB' ? 'ظهير أساسي' : 'لاعب أساسي بالتشكيلة';

  const [proposedRole, setProposedRole] = useState(defaultRole);
  const [proposedShirtNumber, setProposedShirtNumber] = useState<number>(player.number || 10);
  const [matchDate, setMatchDate] = useState('2026-09-20');
  const [matchTime, setMatchTime] = useState('20:30');
  const [messageNotes, setMessageNotes] = useState(
    `السلام عليكم كابتن ${player.name}، نود تقديم عرض انضمام رسمي لك لتمثيل فريقنا [${senderTeamName}]. تابعنا تميزك في مركز (${player.position}) بمعدل ${player.overall} OVR، ونرى أنك إضافة نوعية وتكتيكية كبرى لخططنا.`
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // توليد رسالة واتساب منسقة
  const generateWhatsAppMessage = () => {
    const typeLabel = 
      requestType === 'permanent_signing' ? 'طلب انضمام رسمي ودائم' :
      requestType === 'match_trial' ? 'دعوة لخوض مباراة تجريبية واختبار أداء' : 'دعوة للمشاركة في بطولة ودية';

    return encodeURIComponent(
      `⚽ *طلب انضمام واستقطاب لاعب حر - منصة كورة كارد*\n\n` +
      `السلام عليكم كابتن *${player.name}*،\n` +
      `معك *${senderCaptainName}*، كابتن فريق *[${senderTeamName}]*.\n\n` +
      `📌 *نوع العرض:* ${typeLabel}\n` +
      `🎯 *المركز المقترح:* ${proposedRole} (قميص رقم ${proposedShirtNumber})\n` +
      `📍 *ملعب اللقاء والتجمع:* ${senderPitch} (${senderNeighborhood})\n` +
      `🗓️ *الموعد والتوقيت:* ${matchDate} الساعة ${matchTime}\n\n` +
      `💬 *رسالة الكابتن:* ${messageNotes}\n\n` +
      `يسعدنا تواصلك والتنسيق للانضمام، ونتمنى لك التوفيق دائماً!`
    );
  };

  const handleWhatsAppRedirect = () => {
    const text = generateWhatsAppMessage();
    const phoneTarget = player.phone || '0501234567';
    // WhatsApp URL
    window.open(`https://wa.me/966${phoneTarget.replace(/^0/, '')}?text=${text}`, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newRequest: TransferRequest = {
      id: `tr-req-${Date.now()}`,
      playerId: player.id,
      playerName: player.name,
      playerPosition: player.position,
      playerOverall: player.overall,
      playerAvatarUrl: player.avatarUrl,
      playerNeighborhood: player.neighborhood,
      playerAge: player.age,
      playerPhone: player.phone,

      senderCaptainName,
      senderTeamName,
      senderPhone,
      senderPitch,
      senderNeighborhood,

      requestType,
      proposedRole,
      proposedShirtNumber: Number(proposedShirtNumber) || undefined,
      matchOrTrialDate: matchDate,
      matchOrTrialTime: matchTime,
      messageNotes,

      status: 'pending',
      createdAt: 'الآن',
      read: false,
    };

    setTimeout(() => {
      onSubmitRequest(newRequest);
      setIsSubmitting(false);
      onShowToast(`تم إرسال طلب الانضمام إلى الكابتن [ ${player.name} ] وإشعاره بنجاح في سوق الانتقالات!`);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#0e1117] border border-[#d4af37]/40 rounded-3xl shadow-2xl overflow-hidden my-6 text-right"
        dir="rtl"
      >
        {/* شريط الإضاءة الذهبية بالأعلى */}
        <div className="h-1.5 bg-gradient-to-r from-[#8a6d1b] via-[#f5d77f] to-[#8a6d1b]" />

        {/* رأس النافذة */}
        <div className="p-5 sm:p-6 border-b border-[#1c222e] flex items-center justify-between bg-[#11141b]/90">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#d4af37]/20 to-[#f5d77f]/10 border border-[#d4af37]/40 flex items-center justify-center text-[#f5d77f] shadow-lg shadow-[#d4af37]/10">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>تقديم طلب انضمام واستقطاب</span>
                <span className="text-[11px] bg-[#d4af37]/15 text-[#f5d77f] px-2.5 py-0.5 rounded-full border border-[#d4af37]/30 font-bold">
                  سوق الانتقالات
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                أرسل عرضاً رسمياً للاعب الحر أو الكابتن المعني لتحديد موعد التجربة والمركز
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#1c222e] hover:bg-[#252c3b] text-slate-400 hover:text-white flex items-center justify-center transition border border-[#2b3345]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* بطاقة اللاعب المستهدف المختصرة */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-[#141822] to-[#0e1117] border-b border-[#1c222e]">
          <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <img
                  src={player.avatarUrl}
                  alt={player.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#d4af37]/60 shadow-md"
                />
                <span className="absolute -bottom-1 -left-1 bg-[#11141b] border border-[#d4af37] text-[#f5d77f] text-[10px] font-black px-1.5 py-0.2 rounded-md">
                  {player.position}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">{player.name}</h3>
                  <span className="text-xs bg-[#d4af37] text-slate-950 font-black px-2 py-0.5 rounded-md shadow-sm">
                    {player.overall} OVR
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#f5d77f]" />
                    {player.neighborhood}
                  </span>
                  <span>•</span>
                  <span>{player.age} سنة</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">لاعب حر متاح</span>
                </div>
              </div>
            </div>

            {/* نبذة اللاعب وسجل انضباطه */}
            <div className="bg-[#11141b] border border-[#232938] rounded-xl px-3.5 py-2 text-xs text-slate-300 max-w-xs text-right">
              <div className="flex items-center justify-between gap-2 text-[11px] text-[#f5d77f] font-bold mb-1">
                <span>الانضباط الرياضي</span>
                <span>{player.disciplineScore}% ⭐</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                {player.freeAgentBio || 'لاعب مميز يبحث عن فريق بطولات ولقاءات ودية منتظمة.'}
              </p>
            </div>
          </div>
        </div>

        {/* نموذج تقديم الطلب */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[62vh] overflow-y-auto custom-scrollbar">
          
          {/* 1. اختيار نوع الطلب */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#f5d77f]" />
              <span>نوع طلب الانضمام *</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { 
                  id: 'permanent_signing', 
                  title: 'انضمام دائم ورسمي', 
                  desc: 'توقيع مع الفريق والالتزام بالجدول الدوري',
                  badge: 'عقد دائم'
                },
                { 
                  id: 'match_trial', 
                  title: 'مباراة تجريبية (Trial)', 
                  desc: 'مشاركة في تمرين أو لقاء ودي لاختبار الانسجام',
                  badge: 'اختبار فني'
                },
                { 
                  id: 'tournament_guest', 
                  title: 'مشاركة ببطولة ودية', 
                  desc: 'استقطاب اللاعب لخوض بطولة أحياء محددة',
                  badge: 'بطولة'
                },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setRequestType(opt.id as TransferRequestType)}
                  className={`p-3 rounded-2xl border text-right transition flex flex-col justify-between ${
                    requestType === opt.id
                      ? 'bg-[#d4af37]/15 border-[#d4af37] text-white shadow-md shadow-[#d4af37]/10'
                      : 'bg-[#11141b] border-[#222735] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-xs text-white">{opt.title}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                      requestType === opt.id ? 'bg-[#d4af37] text-slate-950' : 'bg-[#1c222e] text-slate-400'
                    }`}>
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. بيانات الفريق والكابتن */}
          <div className="bg-[#11141b] border border-[#222735] rounded-2xl p-4 space-y-4">
            <h4 className="text-xs font-black text-[#f5d77f] flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>بيانات الفريق والكابتن المُرسل للطلب</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">اسم الفريق</label>
                <input
                  type="text"
                  value={senderTeamName}
                  onChange={(e) => setSenderTeamName(e.target.value)}
                  className="w-full bg-[#08090d] border border-[#262c3d] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">اسم الكابتن</label>
                <input
                  type="text"
                  value={senderCaptainName}
                  onChange={(e) => setSenderCaptainName(e.target.value)}
                  className="w-full bg-[#08090d] border border-[#262c3d] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">رقم الجوال للتواصل</label>
                <input
                  type="text"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full bg-[#08090d] border border-[#262c3d] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
                  placeholder="05xxxxxxxx"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">حي الفريق في جدة</label>
                <select
                  value={senderNeighborhood}
                  onChange={(e) => setSenderNeighborhood(e.target.value)}
                  className="w-full bg-[#08090d] border border-[#262c3d] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none cursor-pointer"
                >
                  {JEDDAH_NEIGHBORHOODS.map((nh) => (
                    <option key={nh} value={nh}>{nh}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">ملعب التمارين والمباريات</label>
                <input
                  type="text"
                  value={senderPitch}
                  onChange={(e) => setSenderPitch(e.target.value)}
                  className="w-full bg-[#08090d] border border-[#262c3d] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
                  placeholder="اسم الملعب بجدة..."
                  required
                />
              </div>
            </div>
          </div>

          {/* 3. تفاصيل العرض والمركز */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                المركز المقترح للاعب في التشكيلة *
              </label>
              <input
                type="text"
                value={proposedRole}
                onChange={(e) => setProposedRole(e.target.value)}
                className="w-full bg-[#11141b] border border-[#222735] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                placeholder="مثال: رأس حربة أساسي، صانع ألعاب..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                رقم القميص المقترح (اختياري)
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={proposedShirtNumber}
                onChange={(e) => setProposedShirtNumber(Number(e.target.value))}
                className="w-full bg-[#11141b] border border-[#222735] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                placeholder="مثال: 9، 10، 7..."
              />
            </div>
          </div>

          {/* 4. موعد اللقاء التجريبي أو التجمع */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#f5d77f]" />
                <span>تاريخ اللقاء التجريبي / التجمع الأول</span>
              </label>
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full bg-[#11141b] border border-[#222735] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#f5d77f]" />
                <span>التوقيت المسائي بجدة</span>
              </label>
              <input
                type="time"
                value={matchTime}
                onChange={(e) => setMatchTime(e.target.value)}
                className="w-full bg-[#11141b] border border-[#222735] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                required
              />
            </div>
          </div>

          {/* 5. الرسالة المباشرة */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-[#f5d77f]" />
                <span>رسالة وتفاصيل العرض للكابتن واللاعب *</span>
              </span>
              <span className="text-[11px] text-slate-400">ستصل كإشعار فوري داخل المنصة</span>
            </label>
            <textarea
              rows={3}
              value={messageNotes}
              onChange={(e) => setMessageNotes(e.target.value)}
              className="w-full bg-[#11141b] border border-[#222735] rounded-2xl p-3.5 text-xs text-white focus:border-[#d4af37] outline-none leading-relaxed resize-none"
              placeholder="اكتب تفاصيل إضافية عن أهداف الفريق، خطة اللعب، والبطولة المستهدفة..."
              required
            />
          </div>

          {/* تنبيه شفافية سوق الانتقالات */}
          <div className="bg-[#1a1e28] border border-[#2d3648] rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-slate-300">
            <AlertCircle className="w-4 h-4 text-[#f5d77f] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              بإرسال هذا الطلب، سيتم تسجيل إشعار رسمي في صندوق إشعارات الكابتن وسوق الانتقالات، مع إمكانية التنسيق الفوري عبر واتساب للاتفاق النهائي.
            </p>
          </div>

          {/* أزرار الإجراءات */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-[#1c222e]">
            <button
              type="button"
              onClick={handleWhatsAppRedirect}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>مراسلة وتنسيق واتساب مباشرة</span>
            </button>

            <div className="w-full sm:w-auto flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#1c222e] hover:bg-[#252c3b] text-slate-300 text-xs font-bold transition"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c59b27] via-[#f5d77f] to-[#9e7922] text-slate-950 font-black text-xs shadow-lg shadow-[#d4af37]/20 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>جاري إرسال الإشعار...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>إرسال طلب الانضمام والإشعار</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
