import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle2, Circle, Lock, ArrowLeft, Brain } from 'lucide-react';
import { useAppState } from '@/context/AppContext';

const statusIcon: Record<string, React.ReactNode> = {
  done: <CheckCircle2 className="w-5 h-5 text-success" />,
  current: <Circle className="w-5 h-5 text-primary fill-primary" />,
  upcoming: <Circle className="w-5 h-5 text-muted-foreground" />,
  locked: <Lock className="w-4 h-4 text-muted-foreground/50" />,
};

const statusStyle: Record<string, string> = {
  done: 'border-success/30 bg-success/5',
  current: 'border-primary bg-primary/10 glow-primary',
  upcoming: 'border-border bg-secondary/30',
  locked: 'border-border/50 bg-muted/30 opacity-60',
};

const PlanPage = () => {
  const [plan, setPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useAppState();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/ai/generate-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, weekCount: 4 }),
        });
        const data = await res.json();
        if (res.ok) {
          setPlan(data.plan || []);
        }
      } catch (err) {
        console.error("Plan Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [userId]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Brain className="w-16 h-16 text-primary animate-pulse" />
      <p className="text-muted-foreground font-black tracking-widest animate-pulse">BUILDING PERSONALIZED ROADMAP...</p>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">AI Generated Roadmap</h1>
          </div>
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
        </div>

        <div className="text-sm text-muted-foreground italic bg-muted/30 p-4 rounded-xl border border-border/50">
          "This plan is dynamically adjusted based on your recent diagnostic quiz results. We've prioritized areas where your confidence score was low."
        </div>

        <div className="space-y-3">
          {plan.length > 0 ? plan.map((item, i) => {
            const status = i === 0 ? 'current' : i < 0 ? 'done' : 'upcoming';
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all ${statusStyle[status]}`}
              >
                <div className="flex flex-col items-center justify-center w-12 text-center border-r border-border/40 mr-2">
                   <span className="text-[10px] font-black uppercase text-muted-foreground">Day</span>
                   <span className="text-lg font-black text-foreground">{item.day || i + 1}</span>
                </div>
                {statusIcon[status]}
                <div className="flex flex-col">
                  <span className={`text-base font-bold ${status === 'locked' ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {item.topic}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">{item.focus || 'Deep Dive Lesson'}</span>
                </div>
                {status === 'current' && (
                  <span className="ml-auto text-[10px] px-3 py-1 rounded-full bg-primary text-primary-foreground font-black uppercase tracking-widest">Active</span>
                )}
              </motion.div>
            );
          }) : (
            <div className="py-20 text-center glass-card border-dashed">
              <p className="text-muted-foreground">COMPLETE YOUR FIRST QUIZ TO GENERATE A PLAN</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PlanPage;
