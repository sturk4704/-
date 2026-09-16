import React, { useState } from 'react';
import { TeamDiaryEntry } from '../types';
import { BookOpenCheck, X, CheckCircle2, Tag, Calendar, MapPin, Sparkles } from 'lucide-react';

interface AddDiaryEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: TeamDiaryEntry) => void;
}

export const AddDiaryEntryModal: React.FC<AddDiaryEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TeamDiaryEntry['category']>('training');
  const [date, setDate] = useState('اليوم، 14 سبتمبر 2026');
  const [location, setLocation] = useState('ملعب الفهد الرياضي - حي الروضة');
  const [opponent, setOpponent] = useState('');
  const [score, setScore] = useState('');
  const [content, setContent] = useState('');
  const [highlightsText, setHighlightsText] = useState('');
  const [pinned, setPinned] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const highlights = highlightsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const newEntry: TeamDiaryEntry = {
      id: `diary-${Date.now()}`,
      teamId: 'rawdah_stars',
      title: title.trim(),
      category,
      date: date.trim() || 'اليوم',
      authorName: 'الكابتن عمر باوزير',
      authorRole: 'كابتن الفريق ومسؤول التكتيك',
      location: location.trim(),
      opponent: opponent.trim() || undefined,
      score: score.trim() || undefined,
      content: content.trim(),
      highlights: highlights.length > 0 ? highlights : ['تسجيل حضور مميز وانضباط تكتيكي من جميع أفراد الفريق.'],
      attendanceRate: 95,
      pinned,
    };

    onSave(newEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0d1017] border border-[#222735] rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1c222e] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#f5d77f]">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-['Changa',sans-serif]">
                تدوين قيد جديد في يوميات الفريق
              </h3>
              <p className="text-xs text-slate-400">توثيق تمرين، مراجعة مباراة، أو توجيه تكتيكي رسمي</p>
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
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold block">عنوان التدوينة:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: مراجعة تكتيكية لودية الأسبوع وتوزيع المهام"
              className="w-full bg-[#08090d] border border-[#222735] text-slate-100 rounded-xl px-3.5 py-2.5 focus:border-[#d4af37] focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#f5d77f]" />
                <span>تصنيف اليومية:</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#08090d] border border-[#222735] text-slate-100 rounded-xl px-3 py-2.5 focus:border-[#d4af37] focus:outline-none"
              >
                <option value="training">تمرين إعداد وتدريب</option>
                <option value="match_review">مراجعة ونتائج مباراة</option>
                <option value="tactical_note">توجيه وملاحظة تكتيكية</option>
                <option value="announcement">إعلان إداري للكابتن</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>التاريخ:</span>
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#08090d] border border-[#222735] text-slate-100 rounded-xl px-3 py-2.5 focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>

          {category === 'match_review' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#11141b] rounded-2xl border border-[#222735]">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">الفريق الخصم:</label>
                <input
                  type="text"
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  placeholder="مثال: نمور الكورنيش"
                  className="w-full bg-[#08090d] border border-[#222735] text-slate-100 rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">النتيجة النهائية:</label>
                <input
                  type="text"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="مثال: 3 - 1 لصالحنا"
                  className="w-full bg-[#08090d] border border-[#222735] text-slate-100 rounded-xl px-3 py-2 focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>الموقع أو الملعب:</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="مثال: ملعب الفهد الرياضي - حي الروضة"
              className="w-full bg-[#08090d] border border-[#222735] text-slate-100 rounded-xl px-3.5 py-2.5 focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold block">تفاصيل التدوينة وسرد اليومية:</label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب خلاصة ما تم إنجازه، التوجيهات الفنية، وانطباعات الكابتن..."
              className="w-full bg-[#08090d] border border-[#222735] text-slate-100 rounded-xl px-3.5 py-2.5 focus:border-[#d4af37] focus:outline-none resize-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#f5d77f]" />
              <span>أبرز النقاط والإحصائيات (كل نقطة في سطر):</span>
            </label>
            <textarea
              rows={2}
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
              placeholder="حضور 14 لاعباً&#10;تألق الدفاع في مصيدة التسلل&#10;تسديد رسوم الملعب بالمناصفة"
              className="w-full bg-[#08090d] border border-[#222735] text-slate-100 rounded-xl px-3.5 py-2 focus:border-[#d4af37] focus:outline-none resize-none font-mono text-[11px]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="pinned-entry-check"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="rounded border-[#222735] text-[#d4af37] focus:ring-[#d4af37]"
            />
            <label htmlFor="pinned-entry-check" className="text-slate-300 font-bold cursor-pointer">
              تثبيت هذه التدوينة في أعلى يوميات الفريق (Pinned Entry) 📌
            </label>
          </div>

          <div className="pt-3 border-t border-[#1c222e] flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl gold-gradient-btn text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>حفظ ونشر التدوينة</span>
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
