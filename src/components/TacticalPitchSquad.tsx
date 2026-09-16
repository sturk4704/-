import React, { useState } from 'react';
import { Player, Formation, SquadSlot, SquadFormat } from '../types';
import { Share2, Users, Swords, Copy, Check, Sparkles, Plus, Trash2, X, RefreshCw, Zap, ArrowRight, Layers } from 'lucide-react';
import { FcfsSquadQueueManager } from './FcfsSquadQueueManager';

interface TacticalPitchSquadProps {
  players: Player[];
  currentUserPlayerId?: string;
  currentUserRole?: string;
  onUpdatePlayer?: (player: Player) => void;
  onShowToast?: (message: string) => void;
}

// إنشاء خانات الملعب ديناميكياً لجميع الأحجام من 5 إلى 11
function generateFormationSlots(format: SquadFormat, lineConfig?: number[]): SquadSlot[] {
  const count = parseInt(format.replace('v', '').split('')[0] || '5');
  const actualCount = parseInt(format.split('v')[0]);

  // خطوط افتراضية متوازنة حسب عدد اللاعبين
  let lines: number[] = [1, 2, 1, 1]; // لحجم 5: 1 حارس، 2 دفاع، 1 وسط، 1 هجوم
  if (lineConfig && lineConfig.length > 0) {
    lines = [1, ...lineConfig];
  } else {
    switch (actualCount) {
      case 5: lines = [1, 2, 1, 1]; break;      // 5v5
      case 6: lines = [1, 2, 2, 1]; break;      // 6v6
      case 7: lines = [1, 2, 3, 1]; break;      // 7v7
      case 8: lines = [1, 3, 3, 1]; break;      // 8v8
      case 9: lines = [1, 3, 3, 2]; break;      // 9v9
      case 10: lines = [1, 4, 3, 2]; break;     // 10v10
      case 11: lines = [1, 4, 3, 3]; break;     // 11v11 (4-3-3)
      default: lines = [1, 2, 1, 1];
    }
  }

  const slots: SquadSlot[] = [];
  let slotIndex = 1;

  // توزيع الخطوط عمودياً من الحارس (أسفل) إلى الهجوم (أعلى)
  const lineCount = lines.length;
  const yStep = 75 / (lineCount - 1); // نسبة التوزيع العمودي

  lines.forEach((playerCountInLine, lineIdx) => {
    // الحارس في الأسفل (y ~ 90) والهجوم في الأعلى (y ~ 15)
    const yPos = 90 - lineIdx * yStep;
    const xStep = 100 / (playerCountInLine + 1);

    for (let p = 1; p <= playerCountInLine; p++) {
      const xPos = p * xStep;
      let role: any = 'CM';
      if (lineIdx === 0) role = 'GK';
      else if (lineIdx === 1) role = playerCountInLine > 2 && (p === 1 || p === playerCountInLine) ? (p === 1 ? 'LB' : 'RB') : 'CB';
      else if (lineIdx === lineCount - 1) role = playerCountInLine > 1 && (p === 1 || p === playerCountInLine) ? (p === 1 ? 'LW' : 'RW') : 'ST';
      else role = p === 1 || p === playerCountInLine ? 'CAM' : 'CM';

      slots.push({
        slotId: `slot-${slotIndex++}`,
        role,
        x: Math.round(xPos),
        y: Math.round(yPos),
        assignedPlayerId: null,
      });
    }
  });

  return slots;
}

export const TacticalPitchSquad: React.FC<TacticalPitchSquadProps> = ({
  players,
  currentUserPlayerId = 'player-1',
  currentUserRole = 'captain',
  onShowToast,
}) => {
  const [currentFormat, setCurrentFormat] = useState<SquadFormat>('8v8');
  const [activeTab, setActiveTab] = useState<'squad_builder' | 'split_match' | 'fcfs_queue'>('squad_builder');

  // تطبيق لاعبي أولوية الحضور FCFS على خانات الملعب التكتيكي
  const handleApplyFcfsStartersToPitch = (starterIds: string[]) => {
    // نحدد حجم التشكيلة بناء على عدد الأساسيين (مثلاً 18 لاعباً = 9v9، 16 = 8v8)
    const count = starterIds.length;
    let targetFormat: SquadFormat = currentFormat;
    if (count <= 10) targetFormat = '5v5';
    else if (count <= 12) targetFormat = '6v6';
    else if (count <= 14) targetFormat = '7v7';
    else if (count <= 16) targetFormat = '8v8';
    else if (count <= 18) targetFormat = '9v9';
    else if (count <= 20) targetFormat = '10v10';
    else targetFormat = '11v11';

    setCurrentFormat(targetFormat);
    const newSlots = generateFormationSlots(targetFormat);
    setSlots(
      newSlots.map((slot, idx) => ({
        ...slot,
        assignedPlayerId: starterIds[idx] || null,
      }))
    );
  };

  // خطط مخصصة محفوظة
  const [customTactics, setCustomTactics] = useState<Array<{ name: string; format: SquadFormat; code: string; lines: number[] }>>([
    { name: 'خطة جدة الهجومية (4-2-3-1)', format: '11v11', code: '4-2-3-1', lines: [4, 2, 3, 1] },
    { name: 'خطة المرتدات السريعة (3-5-2)', format: '11v11', code: '3-5-2', lines: [3, 5, 2] },
    { name: 'خطة السداسي المتوازن (2-2-1)', format: '6v6', code: '2-2-1', lines: [2, 2, 1] },
    { name: 'خطة الثماني الساحلية (3-3-1)', format: '8v8', code: '3-3-1', lines: [3, 3, 1] },
  ]);

  // إنشاء خطة جديدة
  const [isAddingTactic, setIsAddingTactic] = useState(false);
  const [newTacticName, setNewTacticName] = useState('');
  const [newTacticCode, setNewTacticCode] = useState('3-3-1');
  const [newTacticFormat, setNewTacticFormat] = useState<SquadFormat>('8v8');

  // حالة خانات الملعب
  const [slots, setSlots] = useState<SquadSlot[]>(() => {
    const initialSlots = generateFormationSlots('8v8');
    // تعيين تلقائي لأول لاعبين متاحين
    return initialSlots.map((s, idx) => ({
      ...s,
      assignedPlayerId: players[idx]?.id || null,
    }));
  });

  // حالة السحب والإفلات
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);

  // إعدادات التقسيمة الداخلية (Team A vs Team B)
  const [captainAId, setCaptainAId] = useState<string>(players[0]?.id || '');
  const [captainBId, setCaptainBId] = useState<string>(players[1]?.id || '');
  const [temporaryPasscode, setTemporaryPasscode] = useState<string>('JEDDAH-9921');
  const [copiedLink, setCopiedLink] = useState(false);
  const [tempAccessNotification, setTempAccessNotification] = useState<string | null>(null);

  // معرفات اللاعبين في الملعب
  const assignedIds = new Set(slots.map((s) => s.assignedPlayerId).filter(Boolean));
  // قائمة البدلاء (يختفي اللاعب المعين في الملعب فوراً كما طُلب)
  const benchPlayers = players.filter((p) => !assignedIds.has(p.id));

  // تغيير حجم التشكيلة من 5 إلى 11
  const handleFormatChange = (format: SquadFormat) => {
    setCurrentFormat(format);
    const newSlots = generateFormationSlots(format);
    // إرجاع اللاعبين بأمان للدكة وإعادة توزيع الخانات الشاغرة
    setSlots(newSlots);
  };

  // سحب وإفلات
  const handleDragStart = (playerId: string) => {
    setDraggedPlayerId(playerId);
  };

  const handleDropOnSlot = (slotId: string) => {
    if (!draggedPlayerId) return;

    setSlots((prev) =>
      prev.map((slot) => {
        // إذا كان هذا المركز الهدف، نضع فيه اللاعب المسحوب
        if (slot.slotId === slotId) {
          return { ...slot, assignedPlayerId: draggedPlayerId };
        }
        // إذا كان اللاعب المسحوب في مركز آخر، نفرغ ذلك المركز
        if (slot.assignedPlayerId === draggedPlayerId) {
          return { ...slot, assignedPlayerId: null };
        }
        return slot;
      })
    );
    setDraggedPlayerId(null);
  };

  // زر الإزالة (X) باللون الأحمر وإرجاع اللاعب للدكة فوراً
  const handleRemoveFromSlot = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSlots((prev) =>
      prev.map((slot) => (slot.slotId === slotId ? { ...slot, assignedPlayerId: null } : slot))
    );
  };

  // تفريغ الملعب وإعادة الجميع للدكة
  const handleClearPitch = () => {
    setSlots((prev) => prev.map((s) => ({ ...s, assignedPlayerId: null })));
  };

  // حفظ خطة جديدة
  const handleSaveCustomTactic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTacticName.trim()) return;

    // استخراج أرقام الخطوط (مثلاً 4-2-3-1 -> [4, 2, 3, 1])
    const lineParts = newTacticCode.split('-').map((n) => parseInt(n.trim())).filter((n) => !isNaN(n) && n > 0);
    const sum = lineParts.reduce((a, b) => a + b, 0) + 1; // +1 الحارس
    const targetFormat = `${sum}v${sum}` as SquadFormat;

    const newTactic = {
      name: newTacticName.trim(),
      format: targetFormat,
      code: newTacticCode,
      lines: lineParts,
    };

    setCustomTactics((prev) => [newTactic, ...prev]);
    setCurrentFormat(targetFormat);
    setSlots(generateFormationSlots(targetFormat, lineParts));
    setIsAddingTactic(false);
    setNewTacticName('');
  };

  // تطبيق خطة مخصصة
  const handleApplyCustomTactic = (tactic: { format: SquadFormat; lines: number[] }) => {
    setCurrentFormat(tactic.format);
    setSlots(generateFormationSlots(tactic.format, tactic.lines));
  };

  // توليد رابط الصلاحية المؤقتة للكابتن
  const copyCaptainInviteLink = () => {
    const code = Math.floor(1000 + Math.random() * 9000);
    const newPasscode = `JEDDAH-${code}`;
    setTemporaryPasscode(newPasscode);
    navigator.clipboard.writeText(
      `كابتن! تم منحك صلاحية دخول مؤقتة لترتيب تشكيلة فريقك في مباراة جدة الودية عبر الرابط: https://captainjeddah.app/tactics/join?code=${newPasscode}`
    );
    setCopiedLink(true);
    setTempAccessNotification(`تم إنشاء الصلاحية ونسخ رابط الكابتن برمز الدخول [ ${newPasscode} ]! أرسله لكابتن الفريق الثاني.`);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const captainA = players.find((p) => p.id === captainAId);
  const captainB = players.find((p) => p.id === captainBId);

  const onPitchPlayers = slots
    .map((s) => players.find((p) => p.id === s.assignedPlayerId))
    .filter(Boolean) as Player[];

  const teamOvrAverage = onPitchPlayers.length
    ? Math.round(onPitchPlayers.reduce((acc, p) => acc + p.overall, 0) / onPitchPlayers.length)
    : 50;

  return (
    <div className="space-y-6">
      {/* شريط التبديل العلوي */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#11141b] p-3.5 rounded-2xl border border-[#222735]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('squad_builder')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'squad_builder'
                ? 'bg-[#d4af37]/15 text-[#f5d77f] border border-[#d4af37]/40 shadow-sm'
                : 'bg-[#171b24] text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-[#f5d77f]" />
            <span>لوحة التكتيك والتشكيلات</span>
          </button>
          <button
            onClick={() => setActiveTab('split_match')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'split_match'
                ? 'bg-[#d4af37]/15 text-[#f5d77f] border border-[#d4af37]/40 shadow-sm'
                : 'bg-[#171b24] text-slate-400 hover:text-white'
            }`}
          >
            <Swords className="w-4 h-4 text-[#f5d77f]" />
            <span>تقسيمة ودية</span>
          </button>
          <button
            onClick={() => setActiveTab('fcfs_queue')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'fcfs_queue'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-[#171b24] text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>أولوية الحضور والانتظار (FCFS)</span>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-mono font-bold">
              18 أساسي • 3 انتظار
            </span>
          </button>
        </div>

        {/* اختيار عدد اللاعبين من 5 إلى 11 وزر خطة جديدة */}
        {activeTab === 'squad_builder' && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#08090d] px-3 py-1.5 rounded-xl border border-[#222735]">
              <span className="text-[11px] text-slate-400 font-semibold">حجم الفريق:</span>
              <select
                value={currentFormat}
                onChange={(e) => handleFormatChange(e.target.value as SquadFormat)}
                className="bg-transparent text-[#f5d77f] font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="5v5" className="bg-[#08090d]">5 ضد 5</option>
                <option value="6v6" className="bg-[#08090d]">6 ضد 6</option>
                <option value="7v7" className="bg-[#08090d]">7 ضد 7</option>
                <option value="8v8" className="bg-[#08090d]">8 ضد 8</option>
                <option value="9v9" className="bg-[#08090d]">9 ضد 9</option>
                <option value="10v10" className="bg-[#08090d]">10 ضد 10</option>
                <option value="11v11" className="bg-[#08090d]">11 ضد 11</option>
              </select>
            </div>

            <button
              onClick={() => setIsAddingTactic(!isAddingTactic)}
              className="px-3 py-1.5 rounded-xl bg-[#171b24] hover:bg-[#1e2330] border border-[#283142] text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#f5d77f]" />
              <span>خطة مخصصة</span>
            </button>
          </div>
        )}
      </div>

      {/* نموذج إضافة خطة تكتيكية خاصة للكابتن */}
      {isAddingTactic && (
        <form onSubmit={handleSaveCustomTactic} className="bg-[#11141b] border border-[#d4af37]/40 p-4 rounded-2xl flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              required
              value={newTacticName}
              onChange={(e) => setNewTacticName(e.target.value)}
              placeholder="اسم الخطة (مثلاً: تكتيك الحمدانية السريع)"
              className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>
          <div className="w-40">
            <input
              type="text"
              required
              value={newTacticCode}
              onChange={(e) => setNewTacticCode(e.target.value)}
              placeholder="الرسم (مثل: 4-2-3-1)"
              className="w-full bg-[#08090d] border border-[#222735] rounded-xl px-3 py-2 text-xs text-center text-[#f5d77f] font-mono font-bold focus:border-[#d4af37] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="gold-gradient-btn px-4 py-2 text-xs rounded-xl shadow"
          >
            حفظ وتطبيق الخطة
          </button>
          <button
            type="button"
            onClick={() => setIsAddingTactic(false)}
            className="px-3 py-2 text-slate-400 hover:text-white text-xs"
          >
            إلغاء
          </button>
        </form>
      )}

      {/* تنبيه الصلاحية المؤقتة */}
      {tempAccessNotification && (
        <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-2xl p-4 flex items-center justify-between text-[#f5d77f] text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#f5d77f]" />
            <span>{tempAccessNotification}</span>
          </div>
          <button onClick={() => setTempAccessNotification(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* محتوى الشاشة بناء على التبويب */}
      {activeTab === 'split_match' ? (
        <div className="bg-[#11141b] border border-[#222735] rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/25 text-[#f5d77f]">
              <Swords className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold font-['Changa',sans-serif] text-white">
                إدارة التقسيمة الودية بجدة (فريق أ ضد فريق ب)
              </h3>
              <p className="text-xs text-slate-400">
                عيّن كابتن لكل فريق، وشارك الكابتن الثاني رابط الصلاحية المؤقتة ليقوم باختيار تشكيلته من جواله مباشرة!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* كابتن أ */}
            <div className="bg-[#08090d] p-5 rounded-2xl border border-blue-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 text-xs font-bold">
                  الفريق الأول (الأزرق)
                </span>
                <span className="text-xs text-slate-400">كابتن الفريق أ</span>
              </div>
              <select
                value={captainAId}
                onChange={(e) => setCaptainAId(e.target.value)}
                className="w-full bg-[#11141b] border border-[#222735] text-white rounded-xl px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.position}) - {p.overall} OVR</option>
                ))}
              </select>
              {captainA && (
                <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <img src={captainA.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-blue-400" />
                  <div>
                    <div className="text-xs font-bold text-white">{captainA.name}</div>
                    <div className="text-[10px] text-blue-400 font-semibold">{captainA.neighborhood} | #{captainA.number}</div>
                  </div>
                </div>
              )}
            </div>

            {/* كابتن ب */}
            <div className="bg-[#08090d] p-5 rounded-2xl border border-[#d4af37]/35 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-[#d4af37]/20 text-[#f5d77f] text-xs font-bold">
                  الفريق الثاني (الذهبي)
                </span>
                <span className="text-xs text-[#f5d77f] font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> صلاحية دخول سريعة
                </span>
              </div>
              <select
                value={captainBId}
                onChange={(e) => setCaptainBId(e.target.value)}
                className="w-full bg-[#11141b] border border-[#222735] text-white rounded-xl px-3 py-2 text-xs focus:border-[#d4af37] focus:outline-none"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.position}) - {p.overall} OVR</option>
                ))}
              </select>
              {captainB && (
                <div className="flex items-center gap-3 bg-[#11141b] p-3 rounded-xl border border-[#222735]">
                  <img src={captainB.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-[#d4af37]" />
                  <div>
                    <div className="text-xs font-bold text-white">{captainB.name}</div>
                    <div className="text-[10px] text-[#f5d77f] font-semibold">{captainB.neighborhood} | #{captainB.number}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* توليد رابط مؤقت للكابتن الثاني */}
          <div className="bg-gradient-to-r from-[#d4af37]/15 via-[#08090d] to-[#08090d] border border-[#d4af37]/30 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[#f5d77f] font-bold text-xs md:text-sm flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#d4af37]" />
                تفويض الكابتن الثاني وتظبيط التشكيلة
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                توليد رمز صلاحية مؤقت للدخول المباشر من الجوال بدون تسجيل معقد.
              </p>
            </div>
            <button
              onClick={copyCaptainInviteLink}
              className="gold-gradient-btn w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? 'تم نسخ الرابط والكود!' : 'توليد رابط تفويض الكابتن'}
            </button>
          </div>
        </div>
      ) : activeTab === 'fcfs_queue' ? (
        <FcfsSquadQueueManager
          players={players}
          currentFormat={currentFormat}
          onApplyStartersToPitch={handleApplyFcfsStartersToPitch}
          onShowToast={onShowToast}
          currentUserRole={currentUserRole}
          onNavigateToPitch={() => setActiveTab('squad_builder')}
        />
      ) : (
        /* لوحة التكتيك والسحب والإفلات */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* الملعب الأخضر التفاعلي */}
          <div className="lg:col-span-8 bg-[#11141b] p-4 md:p-6 rounded-3xl border border-[#222735] space-y-4 shadow-xl">
            {/* شريط حالة أولوية الحضور السريع داخل لوحة التكتيك */}
            <div className="bg-[#08090d] border border-[#222735] p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white">نظام أولوية الحضور والانتظار (FCFS) مفعّل:</span>
                <span className="text-slate-400">18 أساسياً معتمدين • 3 في قائمة الانتظار</span>
              </div>
              <button
                onClick={() => setActiveTab('fcfs_queue')}
                className="text-xs text-[#f5d77f] hover:underline font-bold flex items-center gap-1"
              >
                <span>فتح قائمة الانتظار والترقية التلقائية</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>

            {/* شريط الخطط السريعة ومعدل الفريق */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">قوة التشكيلة:</span>
                <span className="px-2.5 py-0.5 rounded-md bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#f5d77f] font-black font-['Changa',sans-serif] text-sm">
                  {teamOvrAverage} OVR
                </span>
                <span className="text-[11px] text-slate-400">({onPitchPlayers.length} في الملعب)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearPitch}
                  className="px-3 py-1 text-[11px] rounded-lg bg-[#181c26] hover:bg-[#202634] text-slate-300 transition flex items-center gap-1 border border-[#232a38]"
                  title="إرجاع الجميع للدكة"
                >
                  <RefreshCw className="w-3 h-3" /> تفريغ الملعب
                </button>
              </div>
            </div>

            {/* خطط محفوظة للاختيار السريع */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {customTactics.map((tactic, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyCustomTactic(tactic)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold border whitespace-nowrap transition ${
                    currentFormat === tactic.format
                      ? 'bg-[#d4af37]/15 border-[#d4af37] text-[#f5d77f]'
                      : 'bg-[#08090d] border-[#222735] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {tactic.name} ({tactic.code})
                </button>
              ))}
            </div>

            {/* مجسم الملعب الأخضر بدقة عالية وخطوط واقعية */}
            <div
              className="relative w-full aspect-[3/4] max-h-[600px] rounded-2xl overflow-hidden shadow-2xl border-4 border-emerald-700/60"
              style={{
                background: 'radial-gradient(ellipse at center, #15803d 0%, #14532d 70%, #052e16 100%)',
              }}
            >
              {/* خطوط الملعب */}
              <div className="absolute inset-3 border-2 border-white/40 rounded pointer-events-none">
                <div className="absolute top-1/2 inset-x-0 h-[2px] bg-white/40 -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-28 h-28 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-1/2 w-48 h-24 border-t-2 border-x-2 border-white/40 -translate-x-1/2"></div>
                <div className="absolute top-0 left-1/2 w-48 h-24 border-b-2 border-x-2 border-white/40 -translate-x-1/2"></div>
              </div>

              {/* مراكز اللاعبين القابلة للإفلات */}
              {slots.map((slot) => {
                const assignedPlayer = players.find((p) => p.id === slot.assignedPlayerId);

                return (
                  <div
                    key={slot.slotId}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDropOnSlot(slot.slotId)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200 cursor-pointer"
                    style={{
                      left: `${slot.x}%`,
                      top: `${slot.y}%`,
                    }}
                  >
                    {assignedPlayer ? (
                      /* بطاقة اللاعب مع اسمه وصورته الكاملة وعلامة الإزالة الحمراء X */
                      <div className="group relative flex flex-col items-center">
                        <div
                          draggable
                          onDragStart={() => handleDragStart(assignedPlayer.id)}
                          className="relative w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-[#d4af37] p-0.5 bg-[#08090d] shadow-xl transition transform group-hover:scale-105"
                        >
                          <img
                            src={assignedPlayer.avatarUrl}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#08090d] border border-[#d4af37] text-[#f5d77f] font-bold text-[11px] flex items-center justify-center font-['Changa',sans-serif]">
                            {assignedPlayer.overall}
                          </div>

                          {/* علامة الحذف (X) الحمراء الفعالة لإرجاع اللاعب للدكة فوراً */}
                          <button
                            type="button"
                            onClick={(e) => handleRemoveFromSlot(slot.slotId, e)}
                            className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shadow-lg transition border border-white/40"
                            title="إرجاع اللاعب للدكة فوراً"
                          >
                            ✕
                          </button>
                        </div>

                        {/* إظهار الاسم الكامل للاعب دون اختفاء */}
                        <div className="mt-1 bg-black/85 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/20 text-center max-w-[95px]">
                          <span className="text-[10px] font-bold text-white block truncate">
                            {assignedPlayer.name}
                          </span>
                          <span className="text-[9px] font-black text-[#f5d77f] uppercase">
                            {slot.role}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* مركز شاغر */
                      <div className="flex flex-col items-center">
                        <div className="w-11 h-11 md:w-13 md:h-13 rounded-full border-2 border-dashed border-white/60 bg-black/40 backdrop-blur-xs flex items-center justify-center text-white/90 hover:border-[#d4af37] hover:bg-[#d4af37]/20 transition">
                          <span className="font-extrabold text-[11px] uppercase">{slot.role}</span>
                        </div>
                        <span className="text-[9px] text-white/80 bg-black/60 px-1 rounded mt-0.5">
                          شاغر
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* دكة البدلاء: يختفي اللاعب فوراً عند سحبه للملعب */}
          <div className="lg:col-span-4 bg-[#11141b] p-5 rounded-3xl border border-[#222735] space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#222735]">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#f5d77f]" />
                دكة البدلاء ({benchPlayers.length} متاح)
              </div>
              <span className="text-[10px] text-slate-400">اسحب للملعب 👇</span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {players.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                  <Users className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
                  <p className="font-bold text-slate-300">لا يوجد لاعبون مسجلون في الفريق بعد</p>
                  <p className="text-[11px] text-slate-500">سجل أول بطاقات اللاعبين لتتمكن من توزيعهم في مراكز التشكيلة التكتيكية.</p>
                </div>
              ) : benchPlayers.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  جميع اللاعبين تم توزيعهم في الملعب!
                </div>
              ) : (
                benchPlayers.map((player) => (
                  <div
                    key={player.id}
                    draggable
                    onDragStart={() => handleDragStart(player.id)}
                    className="p-3 bg-[#08090d] hover:bg-[#151922] border border-[#222735] hover:border-[#d4af37]/50 rounded-2xl flex items-center justify-between cursor-grab active:cursor-grabbing transition shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={player.avatarUrl}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border border-[#222735]"
                        />
                        <span className="absolute -bottom-1 -right-1 text-[9px] bg-[#08090d] text-[#f5d77f] font-bold px-1 rounded border border-[#222735]">
                          {player.position}
                        </span>
                      </div>
                      <div>
                        {/* إظهار الاسم كاملاً */}
                        <div className="text-xs font-bold text-white">{player.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {player.neighborhood} | #{player.number}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-[#f5d77f] font-['Changa',sans-serif]">
                        {player.overall}
                      </div>
                      <div className="text-[9px] text-slate-500">OVR</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
