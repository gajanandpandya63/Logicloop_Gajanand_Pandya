import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import { 
  Brain, Flame, Zap, PlayCircle, TrendingUp, 
  Sparkles, ShieldCheck, AlertCircle, Info, ArrowRight,
  Target
} from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const levelConfig: Record<string, { color: string, icon: any }> = {
  strong: { color: 'text-success border-success/30 bg-success/10', icon: ShieldCheck },
  medium: { color: 'text-warning border-warning/30 bg-warning/10', icon: Zap },
  weak: { color: 'text-danger border-danger/30 bg-danger/10', icon: AlertCircle },
};

const CountUp = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1000;
    if (end === 0) {
      setDisplayValue(0);
      return;
    }
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
};

const DashboardPage = () => {
  const { userId, readiness, setReadiness, streak, setStreak } = useAppState();
  const navigate = useNavigate();
  const [showTooltips, setShowTooltips] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/dashboard/data?userId=${userId}`);
        const data = await res.json();
        if (res.ok) {
          setDashboardData(data);
          setReadiness(data.readinessScore);
          setStreak(data.streak || 0); // Assuming streak is in data
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [userId]);

  const radialData = [{ name: 'Readiness', value: readiness, fill: 'hsl(var(--primary))' }];
  
  const topics = dashboardData?.performanceByTopic?.map((p: any) => ({
    name: p.topic,
    level: p.accuracy > 80 ? 'strong' : p.accuracy > 50 ? 'medium' : 'weak',
    accuracy: p.accuracy,
    confidence: p.confidenceScore
  })) || [];

  const knowledgeData = topics.map((t: any) => ({
    name: t.name,
    Knowledge: Math.round(t.accuracy),
    Confidence: Math.round(t.confidence)
  }));

  const weakestTopic = topics.sort((a: any, b: any) => a.accuracy - b.accuracy)[0];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Brain className="w-12 h-12 text-primary animate-pulse" />
        <p className="text-muted-foreground animate-pulse font-bold tracking-widest">INITIALIZING AI COMMAND CENTER...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto pb-24">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center glow-primary animate-pulse-glow">
              <Brain className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-black text-foreground tracking-tight">Learn<span className="text-primary text-glow">ova</span></h1>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">AI Command Center</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2 glass-card px-5 py-2.5 border-warning/20"
          >
            <Flame className="w-5 h-5 text-warning animate-bounce" />
            <div className="flex flex-col">
              <span className="font-bold text-foreground leading-none">{streak} Days</span>
              <span className="text-[10px] text-muted-foreground uppercase">Streak</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 relative overflow-hidden group lg:col-span-1"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target className="w-24 h-24" />
            </div>
            
            <p className="text-sm font-semibold text-muted-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              PLACEMENT READINESS
            </p>
            
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 relative">
                <ResponsiveContainer>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="80%" outerRadius="100%" startAngle={180} endAngle={-180} data={radialData}>
                    <RadialBar dataKey="value" cornerRadius={20} background={{ fill: 'rgba(255,255,255,0.05)' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-black text-foreground text-glow leading-none">
                    <CountUp value={readiness} />%
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold mt-2 tracking-widest">Mastery</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Insight Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 border-primary/30 relative flex flex-col justify-between lg:col-span-1"
          >
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground">AI Insight</h3>
              </div>
              
              <div className="space-y-4">
                <p className="text-lg font-medium text-foreground leading-relaxed">
                  {weakestTopic ? (
                    <>Your <span className="text-success font-bold">overall progress</span> is steady, but <span className="text-danger font-bold">{weakestTopic.name}</span> is pulling you back. Focus on this pattern recognition today.</>
                  ) : (
                    <>Welcome! Let's start with an <span className="text-primary font-bold">Initial Assessment</span> to build your AI profile and detect weak spots.</>
                  )}
                </p>
              </div>
            </div>

            <button 
              className="mt-6 flex items-center gap-2 text-primary font-bold text-sm group"
              onClick={() => navigate('/plan')}
            >
              View Personalized Plan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Action Center */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 flex flex-col items-center justify-center gap-6 lg:col-span-1"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/quiz')}
              className="group relative w-48 h-48 rounded-full gradient-primary glow-primary flex flex-col items-center justify-center overflow-hidden"
            >
              <PlayCircle className="w-16 h-16 text-primary-foreground mb-2" />
              <span className="text-xl font-black text-primary-foreground">START QUIZ</span>
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-40 group-hover:animate-shimmer" />
            </motion.button>
            <p className="text-xs text-muted-foreground text-center font-medium uppercase tracking-widest">
              Launch Diagnostic Session
            </p>
          </motion.div>
        </div>

        {/* Middle Section: Heatmap + Knowledge/Confidence */}
        <div className="grid lg:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-8 lg:col-span-3"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-foreground tracking-tight">TOPIC HEATMAP</h3>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success" /> Strong</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning" /> Medium</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-danger" /> Weak</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {topics.length > 0 ? topics.map((t: any, idx: number) => {
                const Config = levelConfig[t.level];
                const Icon = Config.icon;
                return (
                  <motion.div
                    key={t.name}
                    onMouseEnter={() => setShowTooltips(t.name)}
                    onMouseLeave={() => setShowTooltips(null)}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`relative p-4 rounded-xl border transition-all cursor-help flex flex-col gap-2 ${Config.color}`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="w-4 h-4 opacity-70" />
                      <span className="text-[10px] font-black uppercase opacity-60">{t.level}</span>
                    </div>
                    <span className="text-sm font-bold tracking-tight">{t.name}</span>
                  </motion.div>
                );
              }) : (
                <div className="col-span-full py-12 text-center glass-card bg-muted/20 border-dashed">
                  <p className="text-muted-foreground text-sm font-medium">NO DATA COLLECTED YET</p>
                </div>
              )}
            </div>

            {weakestTopic && (
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-8 py-4 rounded-xl gradient-accent flex items-center justify-center gap-2 text-accent-foreground font-black text-sm tracking-widest shadow-xl shadow-accent/20 group"
                onClick={() => navigate('/quiz', { state: { topic: weakestTopic.name } })}
              >
                <Zap className="w-4 h-4 animate-pulse" />
                🔥 FIX MY {weakestTopic.name.toUpperCase()}
              </motion.button>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-8 lg:col-span-2 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-8">
              <Info className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-black text-foreground tracking-tight uppercase">Performance GAP</h3>
            </div>
            
            <div className="flex-1 min-h-[250px] w-full">
              {knowledgeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={knowledgeData} layout="vertical" margin={{ left: -20 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={80} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                    <Bar dataKey="Knowledge" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={10} />
                    <Bar dataKey="Confidence" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} barSize={10} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground text-xs uppercase tracking-widest">Awaiting assessment data</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
};

export default DashboardPage;
