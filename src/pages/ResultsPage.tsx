import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import { TrendingUp, AlertTriangle, Shield, Wrench } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const weakTopics = ['Dynamic Programming', 'Graphs', 'System Design'];

const confidenceData = [
  { topic: 'Arrays', confidence: 90 },
  { topic: 'Strings', confidence: 85 },
  { topic: 'Trees', confidence: 60 },
  { topic: 'Graphs', confidence: 30 },
  { topic: 'DP', confidence: 25 },
  { topic: 'SQL', confidence: 65 },
];

const ResultsPage = () => {
  const { readiness, quizAnswers } = useAppState();
  const navigate = useNavigate();

  const correctCount = quizAnswers.filter(a => a.correct).length;
  const totalTime = quizAnswers.reduce((s, a) => s + a.timeTaken, 0);
  const radialData = [{ name: 'Readiness', value: readiness, fill: 'hsl(168, 76%, 40%)' }];

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Quiz Results</h1>

        {/* Stats Row */}
        <div className="grid sm:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 text-center glow-primary">
            <div className="w-24 h-24 mx-auto mb-2">
              <ResponsiveContainer>
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" startAngle={90} endAngle={-270} data={radialData}>
                  <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'hsl(222, 30%, 16%)' }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-3xl font-heading font-bold text-foreground">{readiness}%</p>
            <p className="text-sm text-muted-foreground">Readiness</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-3xl font-heading font-bold text-foreground">{correctCount}/{quizAnswers.length}</p>
            <p className="text-sm text-muted-foreground">Correct</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-warning" />
            <p className="text-3xl font-heading font-bold text-foreground">{totalTime}s</p>
            <p className="text-sm text-muted-foreground">Total Time</p>
          </motion.div>
        </div>

        {/* Confidence Map */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h3 className="text-lg font-heading font-bold text-foreground mb-4">Confidence Map</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                <XAxis dataKey="topic" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'hsl(222, 41%, 10%)', border: '1px solid hsl(222, 30%, 18%)', borderRadius: '8px', color: 'hsl(210, 40%, 96%)' }} />
                <Bar dataKey="confidence" fill="hsl(168, 76%, 40%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Weak Topics */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <h3 className="text-lg font-heading font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" /> Weak Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {weakTopics.map(t => (
              <span key={t} className="px-4 py-2 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm font-medium">{t}</span>
            ))}
          </div>
        </motion.div>

        <button
          onClick={() => navigate('/study')}
          className="w-full py-3 rounded-lg gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Wrench className="w-5 h-5" />
          Fix My Weakness
        </button>
      </motion.div>
    </div>
  );
};

export default ResultsPage;
