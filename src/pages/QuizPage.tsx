import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import { Clock, AlertCircle, CheckCircle2, ArrowRight, Lightbulb, Brain } from 'lucide-react';

const SESSION_LENGTH = 5;

const QuizPage = () => {
  const [sessionStep, setSessionStep] = useState(0);
  const [q, setQ] = useState<any>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [changes, setChanges] = useState(0);
  const [loading, setLoading] = useState(true);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [repeatedAlert, setRepeatedAlert] = useState<string | null>(null);
  
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const { userId, setQuizAnswers, setReadiness } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchQuestion = async () => {
    setLoading(true);
    setExplanation(null);
    setSelected(null);
    setSubmitted(false);
    setTimer(0);
    setChanges(0);

    try {
      const topic = location.state?.topic || 'Coding and Aptitude';
      const response = await fetch('http://localhost:5000/api/quiz/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, topic, difficulty: 'Medium' }),
      });
      const data = await response.json();
      if (response.ok) {
        setQ(data);
      } else {
        alert("Failed to generate AI question");
        navigate('/dashboard');
      }
    } catch (err) {
      alert("Error connecting to AI service");
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
    return () => clearInterval(timerRef.current);
  }, [sessionStep]);

  useEffect(() => {
    if (!loading && !submitted) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [loading, submitted]);

  const handleSelect = (opt: string) => {
    if (submitted) return;
    if (selected && selected !== opt) setChanges(c => c + 1);
    setSelected(opt);
  };

  const handleSubmit = async () => {
    if (!selected) return;
    clearInterval(timerRef.current);
    
    try {
      const response = await fetch('http://localhost:5000/api/quiz/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          question: q.question,
          topic: q.topic,
          userAnswer: selected,
          correctAnswer: q.correctAnswer,
          timeTaken: timer,
          answerChanges: changes
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setSubmitted(true);
        setExplanation(q.explanation); // AI generated explanation

        // Check for repeated mistakes
        if (!isCorrect) {
          const mistakeRes = await fetch('http://localhost:5000/api/mistakes/check-repeated', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, topic: q.topic }),
          });
          const mistakeData = await mistakeRes.json();
          if (mistakeData.repeated) {
            setRepeatedAlert(mistakeData.message);
          }
        }
      }
    } catch (err) {
      alert("Error submitting answer");
    }
  };

  const handleNext = () => {
    if (sessionStep < SESSION_LENGTH - 1) {
      setSessionStep(prev => prev + 1);
    } else {
      navigate('/results');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Brain className="w-16 h-16 text-primary animate-pulse" />
      <p className="text-muted-foreground font-bold tracking-widest animate-pulse uppercase">AI GENERATING NEXT CHALLENGE...</p>
    </div>
  );

  const isCorrect = selected === q.correctAnswer;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Progress + Timer */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1.5 flex-1 max-w-[200px]">
            {Array.from({ length: SESSION_LENGTH }).map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
                i < sessionStep ? 'bg-primary' : i === sessionStep ? 'bg-primary animate-pulse' : 'bg-secondary'
              }`} />
            ))}
          </div>
          <div className="flex items-center gap-2 glass-card px-4 py-2 text-sm border-primary/20">
            <Clock className="w-4 h-4 text-primary animate-pulse" />
            <span className="font-mono text-foreground font-bold leading-none">
              {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={sessionStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="glass-card p-10 border-white/5 relative overflow-hidden"
          >
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
             
            <p className="text-[10px] font-black uppercase text-primary/60 tracking-[0.2em] mb-4">
              Diagnostic Level: {q.difficulty || 'Adaptive'}
            </p>
            <h2 className="text-2xl font-heading font-black text-foreground mb-8 leading-tight tracking-tight">
              {q.question}
            </h2>

            <div className="space-y-4">
              {q.options.map((opt: string) => {
                let style = 'border-white/10 bg-secondary/30 text-secondary-foreground hover:bg-secondary/50 hover:border-primary/40';
                if (submitted) {
                  if (opt === q.correctAnswer) style = 'border-success bg-success/10 text-success font-bold scale-[1.02]';
                  else if (opt === selected && !isCorrect) style = 'border-danger bg-danger/10 text-danger font-bold';
                  else style = 'border-white/5 bg-secondary/10 text-muted-foreground opacity-50 cursor-not-allowed';
                } else if (opt === selected) {
                  style = 'border-primary bg-primary/20 text-primary-foreground font-bold scale-[1.02] shadow-lg shadow-primary/10';
                }
                return (
                  <motion.button
                    key={opt}
                    whileHover={!submitted ? { x: 5 } : {}}
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all flex items-center justify-between group ${style}`}
                  >
                    <span className="text-base">{opt}</span>
                    {submitted && opt === q.correctAnswer && <CheckCircle2 className="w-5 h-5 text-success" />}
                    {submitted && opt === selected && !isCorrect && <AlertCircle className="w-5 h-5 text-danger" />}
                  </motion.button>
                );
              })}
            </div>

            {/* Repeated Mistake Alert */}
            <AnimatePresence>
              {repeatedAlert && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-4 rounded-xl border border-danger/50 bg-danger/10 flex items-center gap-3 text-danger font-bold text-sm shadow-lg shadow-danger/20"
                >
                  <AlertCircle className="w-5 h-5 animate-pulse" />
                  <span>{repeatedAlert}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Explanation */}
            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 rounded-2xl bg-muted/30 border border-white/10 shadow-inner"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest text-foreground">AI Intelligence Report</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    {explanation || q.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-10 pt-6 border-t border-white/5 flex gap-4">
              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={!selected}
                  className="flex-1 py-4 rounded-xl gradient-primary text-primary-foreground font-black text-sm tracking-widest disabled:opacity-30 hover:shadow-2xl hover:shadow-primary/30 transition-all uppercase"
                >
                  Analyze Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex-1 py-4 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-black text-sm tracking-widest flex items-center justify-center gap-3 transition-all uppercase"
                >
                  {sessionStep < SESSION_LENGTH - 1 ? 'Next Logic Step' : 'View Full Report'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizPage;
