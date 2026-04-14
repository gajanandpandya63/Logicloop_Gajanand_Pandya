import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import { GraduationCap, BookOpen, Target, ArrowRight, Check } from 'lucide-react';

const steps = [
  {
    key: 'education',
    title: 'Education Level',
    subtitle: 'Where are you in your learning journey?',
    icon: GraduationCap,
    options: ['High School', '12th Pass', 'Undergraduate', 'Postgraduate', 'Working Professional'],
  },
  {
    key: 'course',
    title: 'Your Field',
    subtitle: 'What are you studying or interested in?',
    icon: BookOpen,
    options: ['Computer Science', 'Engineering (Other)', 'Commerce / MBA', 'Science', 'Arts / Design'],
  },
  {
    key: 'goal',
    title: 'Your Goal',
    subtitle: 'What do you want to achieve?',
    icon: Target,
    options: ['Placement Prep', 'AI / ML Mastery', 'Full Stack Dev', 'Competitive Coding', 'Upskill for Promotion'],
  },
];

const OnboardingPage = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { userId, setOnboarded, setUserProfile } = useAppState();
  const navigate = useNavigate();

  const current = steps[step];

  const select = (option: string) => {
    setAnswers(prev => ({ ...prev, [current.key]: option }));
  };

  const next = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      try {
        const onboardingData = {
          educationLevel: answers.education || '',
          course: answers.course || '',
          goal: answers.goal || '',
        };

        const response = await fetch('http://localhost:5000/api/users/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, onboardingData }),
        });

        if (response.ok) {
          setUserProfile(onboardingData);
          setOnboarded(true);
          navigate('/dashboard');
        } else {
          alert('Failed to save onboarding data');
        }
      } catch (err) {
        alert('Error connecting to server');
      }
    }
  };

  const Icon = current.icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-primary' : 'bg-secondary'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground">{current.title}</h2>
                <p className="text-sm text-muted-foreground">{current.subtitle}</p>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              {current.options.map(option => (
                <button
                  key={option}
                  onClick={() => select(option)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between ${
                    answers[current.key] === option
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-secondary/50 text-secondary-foreground hover:border-primary/50'
                  }`}
                >
                  <span>{option}</span>
                  {answers[current.key] === option && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>

            <button
              onClick={next}
              disabled={!answers[current.key]}
              className="mt-6 w-full py-3 rounded-lg gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {step < steps.length - 1 ? 'Continue' : 'Get Started'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingPage;
