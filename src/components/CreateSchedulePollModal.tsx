import React, { useState } from 'react';
import { ChatPollData } from '../types';
import { JEDDAH_NEIGHBORHOODS } from '../utils/cardRatingEngine';
import { Calendar, Clock, MapPin, Users, Swords, X, CheckCircle2 } from 'lucide-react';

interface CreateSchedulePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pollData: ChatPollData, initialNote: string) => void;
}

const SAMPLE_PITCHES = [
  { name: 'ملعب الفهد الرياضي المعتمد', neighborhood: 'الروضة' },
  { name: 'ملعب الكابتن الذهبي', neighborhood: 'الصفا' },
  { name: 'ملاعب النجوم العالمية', neighborhood: 'الزهراء' },
  { name: 'ملعب النخبة الدولي', neighborhood: 'أبحر الشمالية' },
  { name: 'ملعب درة العروس الخماسي', neighborhood: 'المرجان' },
  { name: 'ملعب الحمراء الأولمبي', neighborhood: 'الحمراء' },
];

export const CreateSchedulePollModal: React.FC<CreateSchedulePollModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [matchType, setMatchType] = useState<'internal_scrimmage' | 'friendly_rival'>('internal_scrimmage');
  const [eventTitle, setEventTitle] = useState('مباراة تقسيمة داخلية بين لاعبي الفريق (9 ضد 9)');
  const [format, setFormat] = useState<'5x5' | '7x7' | '8x8' | '9x9' | '11x11'>('9x9');
  const [pitchName, setPitchName] = useState(SAMPLE_PITCHES[0].name);
  const [neighborhood, setNeighborhood] = useState(SAMPLE_PITCHES[0].neighborhood);
  const [date, setDate] = useState('الجمعة القادم');
  const [time, setTime] = useState('08:30 مساءً - 10:00 مساءً');
  const [requiredPlayers, setRequiredPlayers] = useState(18);
  const [initialNote, setInitialNote] = useState('يا أبطال، استطلاع مباراتنا الداخلية (9 ضد 9 - 18 لاعب مطلوب). الأولوية لمن يسجل أولاً بنزاهة تامة، ومن يتأخر يدخل قائمة الانتظار للترقية التلقائية!');

  if (!isOpen) return null;

  const handleMatchTypeChange = (type: 'internal_scrimmage' | 'friendly_rival') => {
    setMatchType(type);
    if (type === 'internal_scrimmage') {
      const multiplier = 2; // فريقين داخلين
      let base = 9;
      if (format === '5x5') base = 5;
      else if (format === '7x7') base = 7;
      else if (format === '8x8') base = 8;
      else if (format === '9x9') base = 9;
      else if (format === '11x11') base = 11;
      const total = base * multiplier;
      setRequiredPlayers(total);
      setEventTitle(`مباراة تقسيمة داخلية بين لاعبي الفريق (${format})`);
      setInitialNote(`يا أبطال، استطلاع مباراتنا الداخلية (${format} - ${total} لاعب مطلوب). الأولوية لمن يسجل أولاً بنزاهة تامة، ومن يتأخر يدخل قائمة الانتظار للترقية التلقائية!`);
    } else {
      let total = 8;
      if (format === '5x5') total = 5;
      else if (format === '7x7') total = 7;
      else if (format === '8x8') total = 8;
      else if (format === '9x9') total = 9;
      else if (format === '11x11') total = 11;
      setRequiredPlayers(total);
      setEventTitle(`مباراة ودية رسمية ضد فريق منافس (${format})`);
      setInitialNote('يا كباتن، نحتاج تأكيد الحضور لتشكيلة فريقنا لحجز الملعب ومناصفة العربون عبر المنصة!');
    }
  };

  const handleFormatChange = (newFormat: '5x5' | '7x7' | '8x8' | '9x9' | '11x11') => {
    setFormat(newFormat);
    let base = 9;
    if (newFormat === '5x5') base = 5;
    else if (newFormat === '7x7') base = 7;
    else if (newFormat === '8x8') base = 8;
    else if (newFormat === '9x9') base = 9;
    else if (newFormat === '11x11') base = 11;

    const total = matchType === 'internal_scrimmage' ? base * 2 : base;
    setRequiredPlayers(total);

    if (matchType === 'internal_scrimmage') {
      setEventTitle(`مباراة تقسيمة داخلية بين لاعبي الفريق (${newFormat})`);
      setInitialNote(`يا أبطال، استطلاع مباراتنا الداخلية (${newFormat} - ${total} لاعب مطلوب). الأولوية لمن يسجل أولاً بنزاهة تامة، ومن يتأخر يدخل قائمة الانتظار للترقية التلقائية!`);
    } else {
      setEventTitle(`مباراة ودية رسمية ضد فريق منافس (${newFormat})`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pollData: ChatPollData = {
      matchType,
      eventTitle: eventTitle.trim() || (matchType === 'internal_scrimmage' ? 'مباراة تقسيمة داخلية' : 'تنسيق موعد مباراة جديدة'),
      format,
      pitchName,
      neighborhood,
      date,
      time,
      requiredPlayers: Number(requiredPlayers) || (matchType === 'internal_scrimmage' ? 18 : 8),
      confirmedPlayerIds: [],
      waitingListPlayerIds: [],
      declinedPlayerIds: [],
      tentativePlayerIds: [],
    };

    onSubmit(pollData, initialNote.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0d1017] border border-[#222735] rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1c222e] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#f5d77f]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-['Changa',sans-serif]">
                إنشاء استطلاع موعد مباراة / تمرين
              </h3>
              <p className="text-xs text-slate-400">
                بث فوري لأعضاء الفريق للتصويت وحصر الحضور بنظام النزاهة التلقائي (FIFO)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#161a23] text-slate-400 hover:text-white border border-[#222735]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* اختيار نوع المباراة: تقسيمة داخلية أو ودية خارجية */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold block">نوع المباراة:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleMatchTypeChange('internal_scrimmage')}
                className={`p-3 rounded-2xl border text-right transition flex flex-col justify-between ${
                  matchType === 'internal_scrimmage'
                    ? 'bg-[#d4af37]/15 border-[#d4af37] text-white shadow-lg'
                    : 'bg-[#08090d] border-[#222735] text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm flex items-center gap-1.5 text-[#f5d77f]">
                    <Users className="w-4 h-4" />
                    <span>تقسيمة داخلية</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                    بين لاعبي الفريق
                  </span>
                </div>
                <span className="text-[10px] text-slate-300 mt-1 leading-normal">
                  تفعيل النزاهة (من حضر أولاً يلعب) + قائمة انتظار وترقية تلقائية فورية
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleMatchTypeChange('friendly_rival')}
                className={`p-3 rounded-2xl border text-right transition flex flex-col justify-between ${
                  matchType === 'friendly_rival'
                    ? 'bg-blue-500/15 border-blue-400 text-white shadow-lg'
                    : 'bg-[#08090d] border-[#222735] text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm flex items-center gap-1.5 text-blue-300">
                    <Swords className="w-4 h-4" />
                    <span>ودية ضد منافس</span>
                  </span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold border border-blue-500/30">
                    فريق خارجي
                  </span>
                </div>
                <span className="text-[10px] text-slate-300 mt-1 leading-normal">
                  حصر لاعبي تشكيلة الفريق لمواجهة فريق منافس في أحياء جدة
                </span>
              </button>
            </div>
          </div>

          {/* عنوان الحدث */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold block">عنوان اللقاء أو التمرين:</label>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="مثال: مباراة تقسيمة داخلية بين لاعبي الفريق (9x9)"
              className="w-full bg-[#08090d] border border-[#222735] text-slate-100 rounded-xl px-3.5 py-2.5 focus:border-[#d4af37] focus:outline-none"
              required
            />
          </div>

          {/* نوع التشكيلة والعدد المطلوب */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold flex items-center gap-1">
                <Swords className="w-3.5 h-3.5 text-[#f5d77f]" />
                <span>نظام التشكيلة:</span>
              </label>
              <select
                value={format}
                onChange={(e) => handleFormatChange(e.target.value as any)}
                className="w-full bg-[#08090d] border border-[#222735] text-slate-100 rounded-xl px-3 py-2.5 focus:border-[#d4af37] focus:outline-none"
              >
                <option value="5x5">5 ضد 5 {matchType === 'internal_scrimmage' ? '(10 لاعبين)' : '(خماسي)'}</option>
                <option value="7x7">7 ضد 7 {matchType === 'internal_scrimmage' ? '(14 لاعباً)' : '(سباعي)'}</option>
                <option value="8x8">8 ضد 8 {matchType === 'internal_scrimmage' ? '(16 لاعباً)' : '(ثماني)'}</option>
                <option value="9x9">9 ضد 9 {matchType === 'internal_scrimmage' ? '(18 لاعباً)' : '(تساعي)'}</option>
                <option value="11x11">11 ضد 11 {matchType === 'internal_scrimmage' ? '(22 لاعباً)' : '(قانوني)'}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>العدد المطلوب لاكتمال القائمة:</span>
              </label>
              <input
                type="number"
                min={3}
                max={30}
                value={requiredPlayers}
                onChange={(e) => setRequiredPlayers(Number(e.target.value))}
                className="w-full bg-[#08090d] border border-[#222735] text-slate-100 rounded-xl px-3 py-2.5 focus:border-[#d4af37] focus:outline-none font-mono font-bold text-center text-emerald-400"
              />
            </div>
          </div>

          {/* الملعب والحي */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#f5d77f]" />
                <span>الملعب المعتمد:</span>
              </label>
              <select
                value={pitchName}
                onChange={(e) => {
                  setPitchName(e.target.value);
                  const found = SAMPLE_PITCHES.find((p) => p.name === e.target.value);
                  if (found) setNeighborhood(found.neighborhood);
                }}
                className="w-full bg-[#08090d] border border-[#222735] text-slate-100 rounded-xl px-3 py-2.5 focus:border-[#d4af37] focus:outline-none"
              >
                {SAMPLE_PITCHES.map((pitch) => (
                  <option key={pitch.name} value={pitch.name}>
                    {pitch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">الحي في جدة:</label>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full bg-[#08090d] border border-[#222735] text-slate-100 rounded-xl px-3 py-2.5 focus:border-[#d4af37] focus:outline-none"
              >
                {JEDDAH_NEIGHBORHOODS.map((n) => (
                  <option key={n} value={n}>
                    حي {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* التاريخ والوقت */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>اليوم والتاريخ:</span>
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="مثال: الخميس 17 سبتمبر"
                className="w-full bg-[#08090d] border border-[#222735] text-slate-100 rounded-xl px-3 py-2.5 focus:border-[#d4af37] focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>التوقيت والمدة:</span>
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="مثال: 09:00 م - 10:30 م"
                className="w-full bg-[#08090d] border border-[#222735] text-slate-100 rounded-xl px-3 py-2.5 focus:border-[#d4af37] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* ملاحظة الكابتن المرفقة */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold">ملاحظة الكابتن المرفقة في الدردشة:</label>
            <input
              type="text"
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              placeholder="اكتب ملاحظة أو توجيهات للاعبين..."
              className="w-full bg-[#08090d] border border-[#222735] text-slate-100 rounded-xl px-3 py-2.5 focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          {/* أزرار الإجراء */}
          <div className="pt-3 border-t border-[#1c222e] flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl gold-gradient-btn text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>نشر الاستطلاع المباشر في الدردشة</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#161a23] hover:bg-[#202634] text-slate-300 font-bold text-xs border border-[#222735]"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
