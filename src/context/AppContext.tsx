import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserProfile {
  educationLevel: string;
  course: string;
  goal: string;
}

interface QuizAnswer {
  questionId: number;
  selected: string;
  correct: boolean;
  timeTaken: number;
  changes: number;
}

interface AppState {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  userProfile: UserProfile | null;
  userId: string | null;
  token: string | null;
  readiness: number;
  streak: number;
  quizAnswers: QuizAnswer[];
  setAuthenticated: (v: boolean) => void;
  setOnboarded: (v: boolean) => void;
  setUserProfile: (p: UserProfile) => void;
  setUserId: (id: string | null) => void;
  setToken: (t: string | null) => void;
  setReadiness: (r: number) => void;
  setStreak: (s: number) => void;
  setQuizAnswers: (a: QuizAnswer[]) => void;
}

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isOnboarded, setOnboarded] = useState(!!localStorage.getItem('onboarded'));
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [readiness, setReadiness] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    if (userId) localStorage.setItem('userId', userId);
    else localStorage.removeItem('userId');
  }, [userId]);

  useEffect(() => {
    if (isOnboarded) localStorage.setItem('onboarded', 'true');
    else localStorage.removeItem('onboarded');
  }, [isOnboarded]);

  return (
    <AppContext.Provider value={{
      isAuthenticated, isOnboarded, userProfile, userId, token, readiness, streak, quizAnswers,
      setAuthenticated, setOnboarded, setUserProfile, setUserId, setToken, setReadiness, setStreak, setQuizAnswers,
    }}>
      {children}
    </AppContext.Provider>
  );
};
