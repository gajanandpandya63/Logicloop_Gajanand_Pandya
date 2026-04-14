import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

const lesson = {
  title: 'Dynamic Programming — Foundations',
  sections: [
    {
      heading: 'What is DP?',
      content: 'Dynamic Programming is an optimization technique that solves complex problems by breaking them into simpler, overlapping subproblems. Instead of solving the same subproblem repeatedly, DP stores results (memoization) or builds solutions bottom-up (tabulation).',
    },
    {
      heading: 'When to Use DP',
      content: '1. **Optimal Substructure** — the optimal solution contains optimal solutions to subproblems.\n2. **Overlapping Subproblems** — the same subproblems are solved multiple times.\n\nCommon patterns: Fibonacci, Knapsack, Longest Common Subsequence, Matrix Chain Multiplication.',
    },
    {
      heading: 'Top-Down vs Bottom-Up',
      content: '**Top-Down (Memoization):** Start from the main problem, recursively solve subproblems, cache results.\n\n**Bottom-Up (Tabulation):** Build a table starting from the smallest subproblems up to the final answer. Generally more space-efficient.',
    },
  ],
};

const practiceQs = [
  { q: 'Fibonacci(5) using DP = ?', options: ['3', '5', '8', '13'], correct: '5' },
  { q: 'What does memoization store?', options: ['Function calls', 'Subproblem results', 'Input data', 'Output format'], correct: 'Subproblem results' },
];

const StudyPage = () => {
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [practiceAnswer, setPracticeAnswer] = useState<string | null>(null);
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);
  const navigate = useNavigate();

  const currentPractice = practiceQs[practiceIdx];

  const handlePracticeSubmit = () => {
    if (!practiceAnswer) return;
    setPracticeSubmitted(true);
  };

  const handlePracticeNext = () => {
    if (practiceIdx < practiceQs.length - 1) {
      setPracticeIdx(practiceIdx + 1);
      setPracticeAnswer(null);
      setPracticeSubmitted(false);
    } else {
      navigate('/plan');
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">AI-Generated Micro-Lesson</p>
            <h1 className="text-2xl font-heading font-bold text-foreground">{lesson.title}</h1>
          </div>
        </div>

        {/* Lesson Content */}
        {lesson.sections.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              {s.heading}
            </h3>
            <p className="text-sm text-secondary-foreground leading-relaxed whitespace-pre-line">{s.content}</p>
          </motion.div>
        ))}

        {/* Practice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 glow-accent"
        >
          <h3 className="text-lg font-heading font-bold text-foreground mb-4">Mini Re-Quiz</h3>
          <p className="text-sm text-muted-foreground mb-1">Question {practiceIdx + 1} of {practiceQs.length}</p>
          <p className="text-foreground font-medium mb-4">{currentPractice.q}</p>

          <div className="space-y-2">
            {currentPractice.options.map(opt => {
              let style = 'border-border bg-secondary/50 text-secondary-foreground hover:border-primary/50';
              if (practiceSubmitted) {
                if (opt === currentPractice.correct) style = 'border-success bg-success/10 text-foreground';
                else if (opt === practiceAnswer) style = 'border-danger bg-danger/10 text-foreground';
                else style = 'border-border bg-secondary/30 text-muted-foreground';
              } else if (opt === practiceAnswer) {
                style = 'border-primary bg-primary/10 text-foreground';
              }
              return (
                <button
                  key={opt}
                  onClick={() => !practiceSubmitted && setPracticeAnswer(opt)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border transition-all flex items-center justify-between text-sm ${style}`}
                >
                  <span>{opt}</span>
                  {practiceSubmitted && opt === currentPractice.correct && <CheckCircle2 className="w-4 h-4 text-success" />}
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            {!practiceSubmitted ? (
              <button onClick={handlePracticeSubmit} disabled={!practiceAnswer} className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground font-semibold disabled:opacity-40">
                Check Answer
              </button>
            ) : (
              <button onClick={handlePracticeNext} className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2">
                {practiceIdx < practiceQs.length - 1 ? 'Next' : 'View 30-Day Plan'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StudyPage;
