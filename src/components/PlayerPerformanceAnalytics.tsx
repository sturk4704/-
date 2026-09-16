import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';
import { Player, SkillMatchHistoryPoint } from '../types';
import { calculatePerformanceAnalytics } from '../utils/performanceAnalytics';
import {
  Zap,
  Send,
  Shield,
  Sparkles,
  Flame,
  Activity,
  TrendingUp,
  Award,
  Calendar,
  MapPin,
  Users,
  Eye,
  BarChart3,
  Layers,
  CheckCircle2,
  Sliders,
  FileSearch,
  BadgeCheck,
  ChevronRight,
  Info,
} from 'lucide-react';

interface PlayerPerformanceAnalyticsProps {
  player: Player;
}

type ChartViewType = 'timeline' | 'area' | 'radar' | 'breakdown';
type SkillFilter = 'trio' | 'all' | 'speed' | 'passing' | 'defense';

const SKILL_CONFIG = {
  speed: {
    label: 'السرعة والتسارع (PAC)',
    shortLabel: 'السرعة',
    code: 'PAC',
    color: '#f59e0b', // عنبر ذهبي
    glow: 'rgba(245, 158, 11, 0.4)',
    icon: Zap,
    description: 'الانطلاق وسرعة التحرك بدون كرة وتجاوز الخصوم في المساحات المفتوحة',
  },
  passing: {
    label: 'دقة التمرير وصناعة اللعب (PAS)',
    shortLabel: 'التمرير',
    code: 'PAS',
    color: '#10b981', // زمردي
    glow: 'rgba(16, 185, 129, 0.4)',
    icon: Send,
    description: 'دقة التمريرات البينية والقطرية، رؤية الملعب وصناعة الفرص المحققة',
  },
  defense: {
    label: 'الافتكاك والتمركز الدفاعي (DEF)',
    shortLabel: 'الدفاع',
    code: 'DEF',
    color: '#0ea5e9', // سماوي
    glow: 'rgba(14, 165, 233, 0.4)',
    icon: Shield,
    description: 'استعادة الكرة، قطع مسارات التمرير، والصلابة في التغطية الدفاعية',
  },
  skill: {
    label: 'المهارة والمراوغة (DRI)',
    shortLabel: 'المهارة',
    code: 'DRI',
    color: '#a855f7', // بنفسجي
    glow: 'rgba(168, 85, 247, 0.4)',
    icon: Sparkles,
    description: 'التحكم بالكرة تحت الضغط والمراوغة في المساحات الضيقة',
  },
  strength: {
    label: 'القوة والبدنية (PHY)',
    shortLabel: 'القوة',
    code: 'PHY',
    color: '#f43f5e', // وردي ناري
    glow: 'rgba(244, 63, 94, 0.4)',
    icon: Flame,
    description: 'اللياقة البدنية، كسب الصراعات الثنائية والالتحامات المباشرة',
  },
};

export const PlayerPerformanceAnalytics: React.FC<PlayerPerformanceAnalyticsProps> = ({ player }) => {
  const [viewType, setChartViewType] = useState<ChartViewType>('timeline');
  const [activeSkill, setActiveSkill] = useState<SkillFilter>('trio');
  const [showBenchmark, setShowBenchmark] = useState(true);

  // حساب التحليلات المتقدمة للمهارات والـ 10 مباريات
  const analytics = useMemo(() => calculatePerformanceAnalytics(player), [player]);

  // المباراة المحددة حالياً للفحص الدقيق من قبل الكشاف (الافتراضي: المباراة الأخيرة #10)
  const [selectedMatchIndex, setSelectedMatchIndex] = useState<number>(10);

  const selectedMatch = useMemo(() => {
    return analytics.timeline.find((m) => m.matchIndex === selectedMatchIndex) || analytics.timeline[analytics.timeline.length - 1];
  }, [analytics.timeline, selectedMatchIndex]);

  // إعداد بيانات مخطط الرادار لمقارنة بصمة الكشافين (قبل 10 مباريات vs الآن)
  const radarData = useMemo(() => {
    return [
      {
        skill: 'السرعة (PAC)',
        initial: analytics.initialStats.speed,
        current: analytics.currentStats.speed,
        growth: analytics.growth.speed,
        fullMark: 99,
      },
      {
        skill: 'التمرير (PAS)',
        initial: analytics.initialStats.passing,
        current: analytics.currentStats.passing,
        growth: analytics.growth.passing,
        fullMark: 99,
      },
      {
        skill: 'الدفاع (DEF)',
        initial: analytics.initialStats.defense,
        current: analytics.currentStats.defense,
        growth: analytics.growth.defense,
        fullMark: 99,
      },
      {
        skill: 'المهارة (DRI)',
        initial: analytics.initialStats.skill,
        current: analytics.currentStats.skill,
        growth: analytics.growth.skill,
        fullMark: 99,
      },
      {
        skill: 'القوة (PHY)',
        initial: analytics.initialStats.strength,
        current: analytics.currentStats.strength,
        growth: analytics.growth.strength,
        fullMark: 99,
      },
    ];
  }, [analytics]);

  // مخصص لتوليد Tooltip احترافي متوافق مع المظهر الداكن
  const CustomTimelineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const matchData = payload[0].payload as SkillMatchHistoryPoint;
      return (
        <div className="bg-[#0c0f16]/95 border border-[#d4af37]/50 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md text-right text-xs max-w-xs space-y-2.5 z-50">
          <div className="flex items-center justify-between border-b border-[#222735] pb-2">
            <div>
              <span className="font-bold text-white font-['Changa',sans-serif] block">
                {matchData.matchLabel} ({matchData.matchDate})
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-2.5 h-2.5 text-[#d4af37]" />
                {matchData.pitchName}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#f5d77f] font-bold border border-[#d4af37]/30 font-mono">
              تقييم: {matchData.matchRating} / 10
            </span>
          </div>

          {/* مؤشرات المهارات الثلاث الرئيسية */}
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between bg-amber-950/25 border border-amber-500/20 px-2 py-1 rounded-lg">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3" />
                السرعة (PAC):
              </span>
              <span className="font-mono text-white font-bold">{matchData.speed}</span>
            </div>
            <div className="flex items-center justify-between bg-emerald-950/25 border border-emerald-500/20 px-2 py-1 rounded-lg">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Send className="w-3 h-3" />
                التمرير (PAS):
              </span>
              <span className="font-mono text-white font-bold">{matchData.passing}</span>
            </div>
            <div className="flex items-center justify-between bg-sky-950/25 border border-sky-500/20 px-2 py-1 rounded-lg">
              <span className="text-sky-400 font-bold flex items-center gap-1">
                <Shield className="w-3 h-3" />
                الدفاع (DEF):
              </span>
              <span className="font-mono text-white font-bold">{matchData.defense}</span>
            </div>
          </div>

          {/* ملاحظة الكشاف */}
          {matchData.scoutNote && (
            <div className="pt-1.5 border-t border-[#1c222e] text-[10px] text-slate-300 leading-tight">
              <span className="text-[#f5d77f] font-bold block mb-0.5">رأي الكشاف:</span>
              <p className="line-clamp-2">{matchData.scoutNote}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-300">
      {/* 1. لوحة مؤشرات الأداء الحيوية (KPIs) لآخر 10 مباريات مع التركيز على السرعة والتمرير والدفاع */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* السرعة (Speed) */}
        <div className="bg-[#11141b] border border-amber-500/30 p-3.5 rounded-2xl relative overflow-hidden group hover:border-amber-400/60 transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              تطور السرعة (PAC)
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
              +{analytics.growth.speed}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-white font-mono">{analytics.currentStats.speed}</span>
            <span className="text-[10px] text-slate-400">كانت {analytics.initialStats.speed}</span>
          </div>
          <div className="mt-2 w-full bg-[#08090d] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, analytics.currentStats.speed)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            نمو {Math.round((analytics.growth.speed / (analytics.initialStats.speed || 1)) * 100)}% عبر 10 مباريات
          </span>
        </div>

        {/* التمرير (Passing) */}
        <div className="bg-[#11141b] border border-emerald-500/30 p-3.5 rounded-2xl relative overflow-hidden group hover:border-emerald-400/60 transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-emerald-300 font-bold flex items-center gap-1">
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              تطور التمرير (PAS)
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
              +{analytics.growth.passing}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-white font-mono">{analytics.currentStats.passing}</span>
            <span className="text-[10px] text-slate-400">كانت {analytics.initialStats.passing}</span>
          </div>
          <div className="mt-2 w-full bg-[#08090d] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, analytics.currentStats.passing)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            دقة بناء اللعب وصناعة الفرص
          </span>
        </div>

        {/* الدفاع (Defense) */}
        <div className="bg-[#11141b] border border-sky-500/30 p-3.5 rounded-2xl relative overflow-hidden group hover:border-sky-400/60 transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-sky-300 font-bold flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              تطور الدفاع (DEF)
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">
              +{analytics.growth.defense}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-white font-mono">{analytics.currentStats.defense}</span>
            <span className="text-[10px] text-slate-400">كانت {analytics.initialStats.defense}</span>
          </div>
          <div className="mt-2 w-full bg-[#08090d] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, analytics.currentStats.defense)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            افتكاك الكرات والانضباط
          </span>
        </div>

        {/* مؤشر التقييم الأعمى ومعادلة النقاط */}
        <div className="bg-[#11141b] border border-[#222735] p-3.5 rounded-2xl relative overflow-hidden group hover:border-[#d4af37]/40 transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-[#f5d77f]" />
              متوسط التقييم الأعمى
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              +{analytics.totalDeltaLast10} نقطة
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-[#f5d77f] font-mono">{analytics.avgRatingLast10}</span>
            <span className="text-xs text-slate-400">/ 10</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span>جاهزية الكشافين:</span>
            <span className="font-bold text-emerald-400 font-['Changa',sans-serif]">
              {analytics.avgRatingLast10 >= 8.0 ? 'موهبة ممتازة ★' : 'موهبة صاعدة'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. شريط التبديل بين أنماط الرسوم البيانية التفاعلية والفلاتر */}
      <div className="bg-[#11141b] p-3 rounded-2xl border border-[#222735] space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* نوع المخطط */}
          <div className="flex items-center gap-1.5 w-full md:w-auto flex-wrap sm:flex-nowrap">
            <button
              type="button"
              id="btn-chart-timeline"
              onClick={() => setChartViewType('timeline')}
              className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                viewType === 'timeline'
                  ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/50 shadow-sm'
                  : 'bg-[#08090d] text-slate-400 border border-[#222735] hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>منحنى التطور (Line Chart)</span>
            </button>

            <button
              type="button"
              id="btn-chart-area"
              onClick={() => setChartViewType('area')}
              className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                viewType === 'area'
                  ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/50 shadow-sm'
                  : 'bg-[#08090d] text-slate-400 border border-[#222735] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>المساحات المتراكمة (Area)</span>
            </button>

            <button
              type="button"
              id="btn-chart-radar"
              onClick={() => setChartViewType('radar')}
              className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                viewType === 'radar'
                  ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/50 shadow-sm'
                  : 'bg-[#08090d] text-slate-400 border border-[#222735] hover:text-white'
              }`}
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>بصمة الرادار المقارنة</span>
            </button>

            <button
              type="button"
              id="btn-chart-breakdown"
              onClick={() => setChartViewType('breakdown')}
              className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                viewType === 'breakdown'
                  ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/50 shadow-sm'
                  : 'bg-[#08090d] text-slate-400 border border-[#222735] hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>تقييم المباريات والـ 6.0</span>
            </button>
          </div>

          {/* خيار خط المقارنة المرجعي */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBenchmark(!showBenchmark)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 border ${
                showBenchmark
                  ? 'bg-[#d4af37]/15 text-[#f5d77f] border-[#d4af37]/40'
                  : 'bg-[#08090d] text-slate-500 border-[#222735]'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>خط معيار الكشافين (75+)</span>
            </button>
          </div>
        </div>

        {/* أزرار تصفية المهارات المستهدفة (السرعة، التمرير، الدفاع) */}
        {(viewType === 'timeline' || viewType === 'area') && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#1c222e]">
            <span className="text-[11px] text-slate-400 ml-1 font-bold">عرض المهارات:</span>

            <button
              type="button"
              id="btn-filter-trio"
              onClick={() => setActiveSkill('trio')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeSkill === 'trio'
                  ? 'bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-sky-500/20 text-white border border-[#d4af37]/50 shadow-sm'
                  : 'bg-[#08090d] text-slate-400 hover:text-white border border-[#222735]'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#f5d77f]" />
              <span>الثلاثي المستهدف (سرعة + تمرير + دفاع)</span>
            </button>

            <button
              type="button"
              id="btn-filter-speed"
              onClick={() => setActiveSkill('speed')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeSkill === 'speed'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'bg-[#08090d] text-slate-400 hover:text-amber-300 border border-[#222735]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>السرعة (PAC)</span>
            </button>

            <button
              type="button"
              id="btn-filter-passing"
              onClick={() => setActiveSkill('passing')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeSkill === 'passing'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'bg-[#08090d] text-slate-400 hover:text-emerald-300 border border-[#222735]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>التمرير (PAS)</span>
            </button>

            <button
              type="button"
              id="btn-filter-defense"
              onClick={() => setActiveSkill('defense')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeSkill === 'defense'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-sm'
                  : 'bg-[#08090d] text-slate-400 hover:text-sky-300 border border-[#222735]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>الدفاع (DEF)</span>
            </button>

            <button
              type="button"
              id="btn-filter-all"
              onClick={() => setActiveSkill('all')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition text-slate-400 hover:text-slate-200 ${
                activeSkill === 'all'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'bg-[#08090d] border border-[#222735]'
              }`}
            >
              كافة المهارات (5)
            </button>
          </div>
        )}
      </div>

      {/* 3. حاوية المخططات التفاعلية Recharts */}
      <div className="bg-[#11141b] border border-[#222735] p-4 sm:p-6 rounded-3xl relative space-y-4">
        {/* 3.1: منحنى تطور المهارات عبر آخر 10 مباريات (LineChart) */}
        {viewType === 'timeline' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <div>
                <h4 className="font-bold text-white text-sm font-['Changa',sans-serif] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#d4af37]" />
                  <span>تطور المهارات الأساسية (السرعة، التمرير، الدفاع) عبر آخر 10 مباريات</span>
                </h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  بيانات حية محسوبة ومحدّثة بعد كل تقييم أعمى بملاعب جدة
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>السرعة</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>التمرير</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  <span>الدفاع</span>
                </span>
              </div>
            </div>

            <div className="w-full h-80 sm:h-96" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={analytics.timeline}
                  margin={{ top: 20, right: 25, left: -10, bottom: 5 }}
                  onClick={(state: any) => {
                    if (state?.activePayload?.length) {
                      const item = state.activePayload[0].payload as SkillMatchHistoryPoint;
                      setSelectedMatchIndex(item.matchIndex);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#222735" vertical={false} />
                  <XAxis
                    dataKey="matchLabel"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#222735' }}
                  />
                  <YAxis
                    domain={[40, 99]}
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#222735' }}
                  />
                  <Tooltip content={<CustomTimelineTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="center"
                    wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
                  />

                  {showBenchmark && (
                    <ReferenceLine
                      y={75}
                      stroke="#d4af37"
                      strokeDasharray="4 4"
                      label={{
                        value: 'معيار الكشافين المعتمد (75 OVR)',
                        fill: '#d4af37',
                        fontSize: 10,
                        position: 'insideTopRight',
                      }}
                    />
                  )}

                  {/* السرعة (Speed) */}
                  {(activeSkill === 'trio' || activeSkill === 'all' || activeSkill === 'speed') && (
                    <Line
                      type="monotone"
                      name="السرعة (PAC)"
                      dataKey="speed"
                      stroke={SKILL_CONFIG.speed.color}
                      strokeWidth={activeSkill === 'speed' ? 4 : 2.5}
                      dot={{ r: 4, fill: SKILL_CONFIG.speed.color, stroke: '#08090d', strokeWidth: 1.5 }}
                      activeDot={{ r: 7, fill: '#fef08a', stroke: SKILL_CONFIG.speed.color, strokeWidth: 2 }}
                    />
                  )}

                  {/* التمرير (Passing) */}
                  {(activeSkill === 'trio' || activeSkill === 'all' || activeSkill === 'passing') && (
                    <Line
                      type="monotone"
                      name="التمرير (PAS)"
                      dataKey="passing"
                      stroke={SKILL_CONFIG.passing.color}
                      strokeWidth={activeSkill === 'passing' ? 4 : 2.5}
                      dot={{ r: 4, fill: SKILL_CONFIG.passing.color, stroke: '#08090d', strokeWidth: 1.5 }}
                      activeDot={{ r: 7, fill: '#a7f3d0', stroke: SKILL_CONFIG.passing.color, strokeWidth: 2 }}
                    />
                  )}

                  {/* الدفاع (Defense) */}
                  {(activeSkill === 'trio' || activeSkill === 'all' || activeSkill === 'defense') && (
                    <Line
                      type="monotone"
                      name="الدفاع (DEF)"
                      dataKey="defense"
                      stroke={SKILL_CONFIG.defense.color}
                      strokeWidth={activeSkill === 'defense' ? 4 : 2.5}
                      dot={{ r: 4, fill: SKILL_CONFIG.defense.color, stroke: '#08090d', strokeWidth: 1.5 }}
                      activeDot={{ r: 7, fill: '#bae6fd', stroke: SKILL_CONFIG.defense.color, strokeWidth: 2 }}
                    />
                  )}

                  {/* المهارة والقوة إذا تم اختيار عرض الكل */}
                  {activeSkill === 'all' && (
                    <>
                      <Line
                        type="monotone"
                        name="المهارة (DRI)"
                        dataKey="skill"
                        stroke={SKILL_CONFIG.skill.color}
                        strokeWidth={2}
                        dot={{ r: 3, fill: SKILL_CONFIG.skill.color }}
                      />
                      <Line
                        type="monotone"
                        name="القوة (PHY)"
                        dataKey="strength"
                        stroke={SKILL_CONFIG.strength.color}
                        strokeWidth={2}
                        dot={{ r: 3, fill: SKILL_CONFIG.strength.color }}
                      />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 3.2: المساحات المتراكمة لتطور المهارات (AreaChart) */}
        {viewType === 'area' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <div>
                <h4 className="font-bold text-white text-sm font-['Changa',sans-serif] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>تدرج النمو الفني للمهارات عبر الـ 10 مباريات</span>
                </h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  رؤية متدرجة لحجم الكتلة المهارية للاعب وتراكم التطور
                </p>
              </div>
            </div>

            <div className="w-full h-80 sm:h-96" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analytics.timeline}
                  margin={{ top: 20, right: 25, left: -10, bottom: 5 }}
                  onClick={(state: any) => {
                    if (state?.activePayload?.length) {
                      const item = state.activePayload[0].payload as SkillMatchHistoryPoint;
                      setSelectedMatchIndex(item.matchIndex);
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="passingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="defenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222735" vertical={false} />
                  <XAxis dataKey="matchLabel" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis domain={[40, 99]} stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTimelineTooltip />} />
                  <Legend verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }} />

                  {(activeSkill === 'trio' || activeSkill === 'all' || activeSkill === 'speed') && (
                    <Area
                      type="monotone"
                      name="السرعة (PAC)"
                      dataKey="speed"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#speedGradient)"
                    />
                  )}

                  {(activeSkill === 'trio' || activeSkill === 'all' || activeSkill === 'passing') && (
                    <Area
                      type="monotone"
                      name="التمرير (PAS)"
                      dataKey="passing"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#passingGradient)"
                    />
                  )}

                  {(activeSkill === 'trio' || activeSkill === 'all' || activeSkill === 'defense') && (
                    <Area
                      type="monotone"
                      name="الدفاع (DEF)"
                      dataKey="defense"
                      stroke="#0ea5e9"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#defenseGradient)"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 3.3: مخطط الرادار المقارن (RadarChart) */}
        {viewType === 'radar' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <div>
                <h4 className="font-bold text-white text-sm font-['Changa',sans-serif] flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-[#d4af37]" />
                  <span>بصمة الكشافين المقارنة: قبل 10 مباريات مقابل المستوى الحالي</span>
                </h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  رؤية هندسية واضحة لقوة التوسع في المهارات الخمس وعلى رأسها السرعة والتمرير والدفاع
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  <span>قبل 10 مباريات</span>
                </span>
                <span className="flex items-center gap-1 text-[#f5d77f] font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />
                  <span>المستوى الحالي</span>
                </span>
              </div>
            </div>

            <div className="w-full h-80 sm:h-96 flex items-center justify-center" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="70%">
                  <PolarGrid stroke="#222735" />
                  <PolarAngleAxis dataKey="skill" stroke="#94a3b8" fontSize={12} />
                  <PolarRadiusAxis domain={[40, 99]} stroke="#475569" fontSize={10} />
                  <Radar
                    name="قبل 10 مباريات"
                    dataKey="initial"
                    stroke="#64748b"
                    fill="#64748b"
                    fillOpacity={0.25}
                  />
                  <Radar
                    name="المستوى الحالي"
                    dataKey="current"
                    stroke="#d4af37"
                    fill="#d4af37"
                    fillOpacity={0.45}
                  />
                  <Tooltip
                    content={({ payload }) => {
                      if (payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-[#08090d]/95 border border-[#d4af37]/40 p-3 rounded-2xl text-xs space-y-1 text-right">
                            <span className="font-bold text-white block text-sm">{item.skill}</span>
                            <div className="text-slate-400 text-[11px]">
                              قبل 10 مباريات: <strong className="text-slate-200">{item.initial}</strong>
                            </div>
                            <div className="text-[#f5d77f] text-[11px]">
                              المستوى الحالي: <strong>{item.current}</strong>
                            </div>
                            <div className="text-emerald-400 font-bold text-[11px]">
                              القفزة المحققة: +{item.growth} نقطة
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 3.4: مخطط أعمدة تقييمات المباريات والـ 6.0 (BarChart) */}
        {viewType === 'breakdown' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <div>
                <h4 className="font-bold text-white text-sm font-['Changa',sans-serif] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#f5d77f]" />
                  <span>تقييم الأداء الأعمى في كل مواجهة وفارق النقاط (معادلة ×3)</span>
                </h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  خط التعادل 6.0 هو الفاصل بين حصد النقاط المضاعفة أو الخصم
                </p>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20 font-mono font-bold">
                نقطة التعادل: 6.0 / 10
              </span>
            </div>

            <div className="w-full h-80 sm:h-96" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.timeline}
                  margin={{ top: 20, right: 20, left: -15, bottom: 5 }}
                  onClick={(state: any) => {
                    if (state?.activePayload?.length) {
                      const item = state.activePayload[0].payload as SkillMatchHistoryPoint;
                      setSelectedMatchIndex(item.matchIndex);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#222735" vertical={false} />
                  <XAxis dataKey="matchLabel" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 10]} stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    content={({ payload }) => {
                      if (payload && payload.length) {
                        const m = payload[0].payload as SkillMatchHistoryPoint;
                        return (
                          <div className="bg-[#08090d]/95 border border-[#d4af37]/40 p-3 rounded-xl text-xs space-y-1 text-right">
                            <span className="font-bold text-white block">{m.matchLabel} - {m.pitchName}</span>
                            <div className="text-slate-300">
                              التقييم الأعمى: <strong className="text-[#f5d77f] font-mono">{m.matchRating} / 10</strong>
                            </div>
                            <div className="text-emerald-400 font-bold">
                              فارق النقاط المكتسبة: +{m.delta} نقطة
                            </div>
                            <div className="text-slate-400 text-[10px] mt-1 border-t border-[#1c222e] pt-1">
                              سرعة: {m.speed} | تمرير: {m.passing} | دفاع: {m.defense}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={6}
                    stroke="#f43f5e"
                    strokeDasharray="4 4"
                    label={{ value: 'نقطة التعادل 6.0', fill: '#f43f5e', fontSize: 10 }}
                  />
                  <Bar dataKey="matchRating" name="التقييم الأعمى" fill="#d4af37" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 4. شريط اختيار المباراة للمعاينة التكتيكية للكشاف */}
        <div className="pt-3 border-t border-[#222735] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>فاحص المباريات التكتيكي (اختر مباراة لعرض التقرير الفني للكشاف):</span>
            </span>
            <span className="text-[10px] text-[#f5d77f] font-mono">
              المباراة المحددة: #{selectedMatch.matchIndex}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {analytics.timeline.map((m) => (
              <button
                key={m.matchIndex}
                type="button"
                onClick={() => setSelectedMatchIndex(m.matchIndex)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1 ${
                  selectedMatchIndex === m.matchIndex
                    ? 'bg-[#d4af37] text-slate-950 shadow-md font-black'
                    : 'bg-[#08090d] text-slate-400 hover:text-white border border-[#222735]'
                }`}
              >
                <span>#{m.matchIndex}</span>
                <span className="text-[10px] opacity-80">({m.matchRating}★)</span>
              </button>
            ))}
          </div>

          {/* بطاقة فحص المباراة المحددة */}
          {selectedMatch && (
            <div className="bg-[#08090d] border border-[#222735] p-3.5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white font-['Changa',sans-serif] text-sm">
                    {selectedMatch.matchLabel}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#f5d77f] font-bold border border-[#d4af37]/30">
                    {selectedMatch.matchDate}
                  </span>
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#d4af37]" />
                    {selectedMatch.pitchName}
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  <strong className="text-[#f5d77f]">ملاحظة الكشاف الميداني:</strong> {selectedMatch.scoutNote}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center font-mono">
                <div className="text-center px-2.5 py-1 rounded-xl bg-amber-950/40 border border-amber-500/30">
                  <span className="text-[9px] text-amber-400 block font-sans">السرعة</span>
                  <span className="font-bold text-white text-xs">{selectedMatch.speed}</span>
                </div>
                <div className="text-center px-2.5 py-1 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                  <span className="text-[9px] text-emerald-400 block font-sans">التمرير</span>
                  <span className="font-bold text-white text-xs">{selectedMatch.passing}</span>
                </div>
                <div className="text-center px-2.5 py-1 rounded-xl bg-sky-950/40 border border-sky-500/30">
                  <span className="text-[9px] text-sky-400 block font-sans">الدفاع</span>
                  <span className="font-bold text-white text-xs">{selectedMatch.defense}</span>
                </div>
                <div className="text-center px-2.5 py-1 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40">
                  <span className="text-[9px] text-[#f5d77f] block font-sans">التقييم</span>
                  <span className="font-bold text-[#f5d77f] text-xs">{selectedMatch.matchRating}★</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. بطاقات التطور المعمقة للمهارات الثلاث (السرعة، التمرير، الدفاع) */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm text-white flex items-center gap-2 font-['Changa',sans-serif]">
          <Award className="w-4 h-4 text-[#d4af37]" />
          <span>الرؤية الفنية لتطور مهارات اللاعب الثلاث (السرعة، التمرير، الدفاع):</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* السرعة (Speed - PAC) */}
          <div className="bg-[#11141b] border border-[#222735] p-4 rounded-2xl space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 font-bold">
                  <Zap className="w-4 h-4" />
                </span>
                <div>
                  <h5 className="font-bold text-xs text-white">السرعة والتسارع (PAC)</h5>
                  <span className="text-[10px] text-slate-400">الانطلاق والتحول الحركي</span>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/30">
                +{analytics.growth.speed} نقطة
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">البداية: {analytics.initialStats.speed}</span>
                <span className="text-white font-bold">الحالي: {analytics.currentStats.speed}</span>
              </div>
              <div className="w-full bg-[#08090d] h-2 rounded-full overflow-hidden border border-[#222735]">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, analytics.currentStats.speed)}%` }}
                />
              </div>
            </div>

            <div className="bg-[#08090d] p-2.5 rounded-xl border border-[#1c222e] text-[11px] text-slate-300 space-y-1">
              <span className="text-amber-400 font-bold block text-[10px]">تقييم كشاف السرعة:</span>
              <p className="leading-relaxed">
                {analytics.growth.speed >= 4
                  ? 'قفزة سريعة ملحوظة؛ تفوق حاسم في سباقات السرعة على الخط والوصول للكرات البينية.'
                  : 'مستوى سرعة مستقر يمنحه أفضلية في تغطية المساحات والمحافظة على النسق البدني.'}
              </p>
            </div>
          </div>

          {/* التمرير (Passing - PAS) */}
          <div className="bg-[#11141b] border border-[#222735] p-4 rounded-2xl space-y-3 relative overflow-hidden group hover:border-emerald-500/40 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold">
                  <Send className="w-4 h-4" />
                </span>
                <div>
                  <h5 className="font-bold text-xs text-white">دقة التمرير والصناعة (PAS)</h5>
                  <span className="text-[10px] text-slate-400">الكرات المفتاحية وبناء اللعب</span>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                +{analytics.growth.passing} نقطة
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">البداية: {analytics.initialStats.passing}</span>
                <span className="text-white font-bold">الحالي: {analytics.currentStats.passing}</span>
              </div>
              <div className="w-full bg-[#08090d] h-2 rounded-full overflow-hidden border border-[#222735]">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, analytics.currentStats.passing)}%` }}
                />
              </div>
            </div>

            <div className="bg-[#08090d] p-2.5 rounded-xl border border-[#1c222e] text-[11px] text-slate-300 space-y-1">
              <span className="text-emerald-400 font-bold block text-[10px]">تقييم كشاف صناعة اللعب:</span>
              <p className="leading-relaxed">
                {analytics.growth.passing >= 4
                  ? 'رؤية ميدانية متطورة، دقة عالية في إرسال الكرات القطرية وكسر خطوط ضغط الخصم.'
                  : 'توزيع كرات متزن تحت الضغط مع نسبة نجاح تمريرات قصيرة تتجاوز 85%.'}
              </p>
            </div>
          </div>

          {/* الدفاع (Defense - DEF) */}
          <div className="bg-[#11141b] border border-[#222735] p-4 rounded-2xl space-y-3 relative overflow-hidden group hover:border-sky-500/40 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-sky-500/20 text-sky-300 font-bold">
                  <Shield className="w-4 h-4" />
                </span>
                <div>
                  <h5 className="font-bold text-xs text-white">الافتكاك والدفاع (DEF)</h5>
                  <span className="text-[10px] text-slate-400">التمركز واستعادة الاستحواذ</span>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded-lg border border-sky-500/30">
                +{analytics.growth.defense} نقطة
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">البداية: {analytics.initialStats.defense}</span>
                <span className="text-white font-bold">الحالي: {analytics.currentStats.defense}</span>
              </div>
              <div className="w-full bg-[#08090d] h-2 rounded-full overflow-hidden border border-[#222735]">
                <div
                  className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, analytics.currentStats.defense)}%` }}
                />
              </div>
            </div>

            <div className="bg-[#08090d] p-2.5 rounded-xl border border-[#1c222e] text-[11px] text-slate-300 space-y-1">
              <span className="text-sky-400 font-bold block text-[10px]">تقييم كشاف المنظومة الدفاعية:</span>
              <p className="leading-relaxed">
                {analytics.growth.defense >= 4
                  ? 'انضباط تكتيكي صلب؛ تفوق في قراءة نوايا مهاجمي الخصم وقطع الكرات بدون أخطاء.'
                  : 'تغطية دفاعية جيدة والتزام بالواجبات التكتيكية في الارتداد السريع.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. صندوق توصية الكشافين الرسمي للأكاديميات */}
      <div className="bg-gradient-to-r from-[#11141b] via-[#161a24] to-[#11141b] border border-[#d4af37]/40 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center shrink-0">
            <BadgeCheck className="w-5 h-5 text-[#f5d77f]" />
          </div>
          <div>
            <span className="text-[10px] text-[#f5d77f] font-bold block uppercase tracking-wider">
              تقرير الكشاف المعتمد (SCOUTING VERDICT)
            </span>
            <p className="text-xs text-white font-bold mt-0.5 leading-relaxed">
              {analytics.scoutRecommendation}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <span className="text-[10px] text-slate-400 font-mono">
            المستوى العام: {player.overall} OVR
          </span>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold">
            جاهز للاختبارات الرسمية ✓
          </span>
        </div>
      </div>

      {/* 7. جدول السجل التراكمي الشامل للمباريات الـ 10 للكشافين */}
      <div className="bg-[#11141b] border border-[#222735] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2 font-['Changa',sans-serif]">
            <Calendar className="w-4 h-4 text-[#d4af37]" />
            <span>سجل المواجهات الـ 10 التراكمية في ملاعب جدة:</span>
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">
            10 / 10 مواجهات مكتملة
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-[#222735] text-[11px]">
                <th className="pb-2.5 pr-2">المباراة</th>
                <th className="pb-2.5">الملعب والحي</th>
                <th className="pb-2.5">الفريق الخصم</th>
                <th className="pb-2.5 text-center">التقييم الأعمى</th>
                <th className="pb-2.5 text-center text-amber-400">سرعة (PAC)</th>
                <th className="pb-2.5 text-center text-emerald-400">تمرير (PAS)</th>
                <th className="pb-2.5 text-center text-sky-400">دفاع (DEF)</th>
                <th className="pb-2.5 text-center">فارق النقاط</th>
                <th className="pb-2.5 text-center">معاينة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c222e]">
              {analytics.timeline.slice().reverse().map((match) => (
                <tr
                  key={match.matchIndex}
                  onClick={() => setSelectedMatchIndex(match.matchIndex)}
                  className={`cursor-pointer transition text-[11px] ${
                    selectedMatchIndex === match.matchIndex ? 'bg-[#d4af37]/10' : 'hover:bg-[#161a24]'
                  }`}
                >
                  <td className="py-2.5 pr-2 font-bold text-white font-mono">
                    #{match.matchIndex}
                  </td>
                  <td className="py-2.5 text-slate-300">
                    {match.pitchName}
                  </td>
                  <td className="py-2.5 text-slate-400">
                    {match.opponentTeam}
                  </td>
                  <td className="py-2.5 text-center font-bold text-[#f5d77f] font-['Changa',sans-serif]">
                    {match.matchRating} / 10
                  </td>
                  <td className="py-2.5 text-center font-mono text-amber-300 font-bold">
                    {match.speed}
                  </td>
                  <td className="py-2.5 text-center font-mono text-emerald-300 font-bold">
                    {match.passing}
                  </td>
                  <td className="py-2.5 text-center font-mono text-sky-300 font-bold">
                    {match.defense}
                  </td>
                  <td className="py-2.5 text-center font-mono font-bold text-emerald-400">
                    +{match.delta}
                  </td>
                  <td className="py-2.5 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMatchIndex(match.matchIndex);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#222735] hover:bg-[#d4af37] hover:text-slate-950 text-slate-300 transition"
                    >
                      فحص
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
