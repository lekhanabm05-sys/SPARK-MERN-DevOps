import React, { useState, useEffect } from 'react';
import {
  getCurrentUser,
  setCurrentUser,
  getUsers,
  getQuizzes,
  getKnowledgeTopics,
  getPredictionPathway,
  getQuizAttempts,
  savePredictionPathway,
  hydrateFromServer
} from './services/storage.js';
import { Navbar } from './components/Navbar.jsx';
import { AuthPage } from './components/AuthPage.jsx';
import { StudentDashboard } from './components/StudentPortal/StudentDashboard.jsx';
import { AssessmentRunner } from './components/StudentPortal/AssessmentRunner.jsx';
import { KnowledgeAnalytics } from './components/StudentPortal/KnowledgeAnalytics.jsx';
import { LearningPathway } from './components/StudentPortal/LearningPathway.jsx';
import { TeacherDashboard } from './components/TeacherPortal/TeacherDashboard.jsx';
import { AssessmentCreator } from './components/TeacherPortal/AssessmentCreator.jsx';
import { StudentRoster } from './components/TeacherPortal/StudentRoster.jsx';
import { AdminDashboard } from './components/AdminPortal/AdminDashboard.jsx';

export default function App() {
  const [user, setUser] = useState(getCurrentUser());
  const [usersList, setUsersList] = useState(getUsers());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('spark_theme') || 'light');

  useEffect(() => {
    localStorage.setItem('spark_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Quizzes & Analytics State
  const [quizzes, setQuizzes] = useState(getQuizzes());
  const [activeQuizToTake, setActiveQuizToTake] = useState(null);
  const [knowledgeTopics, setKnowledgeTopics] = useState(getKnowledgeTopics());
  const [prediction, setPrediction] = useState(getPredictionPathway());
  const [attempts, setAttempts] = useState(getQuizAttempts());

  // Filter quizzes based on student assignment
  const visibleQuizzes = React.useMemo(() => {
    if (!user || user.role !== 'student') return quizzes;
    return quizzes.filter((q) => {
      if (!q.assignedTo || q.assignedTo === 'all') return true;
      if (q.assignedTo === 'selected' && Array.isArray(q.assignedEmails)) {
        const userEmail = (user.email || '').toLowerCase().trim();
        return q.assignedEmails.some((e) => e.toLowerCase().trim() === userEmail);
      }
      return true;
    });
  }, [quizzes, user]);

  // Reload storage state whenever user changes
  useEffect(() => {
    setUsersList(getUsers());
    setQuizzes(getQuizzes());
    setKnowledgeTopics(getKnowledgeTopics());
    setPrediction(getPredictionPathway());
    setAttempts(getQuizAttempts());
  }, [user]);

  // On first load, pull the latest data from MongoDB (via the Express API)
  // and merge it into local state, so the database — not just this browser's
  // cache — is the real source of truth. Runs once; silently keeps local
  // data if the server/DB is unreachable.
  useEffect(() => {
    let cancelled = false;
    hydrateFromServer().then((result) => {
      if (cancelled || !result) return;
      // Re-read from localStorage now that hydrateFromServer has merged
      // in whatever the DB had.
      setUser(getCurrentUser());
      setUsersList(getUsers());
      setQuizzes(getQuizzes());
      setKnowledgeTopics(getKnowledgeTopics());
      setPrediction(getPredictionPathway());
      setAttempts(getQuizAttempts());
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoginSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setCurrentUser(authenticatedUser);
    setActiveTab('dashboard');
    setActiveQuizToTake(null);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentUser(null);
    setActiveQuizToTake(null);
  };

  const handleStartQuiz = (quiz) => {
    setActiveQuizToTake(quiz);
  };

  const handleFinishQuiz = (attempt) => {
    setActiveQuizToTake(null);
    setAttempts(getQuizAttempts());
    setKnowledgeTopics(getKnowledgeTopics());
    setPrediction(getPredictionPathway());
    setActiveTab('analytics');
  };

  const handleUpdatePathway = (updatedPathway) => {
    setPrediction(updatedPathway);
    savePredictionPathway(updatedPathway);
  };

  // If not logged in, render AuthPage
  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} theme={theme} onToggleTheme={toggleTheme} />;
  }

  // Filter students for Teacher Roster & Admin View
  const studentUsers = usersList.filter((u) => u.role === 'student');

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#2C2C22] flex flex-col font-sans selection:bg-[#4E5738] selection:text-[#FDFCF8]">
      <Navbar
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setActiveQuizToTake(null);
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Quiz Runner */}
        {activeQuizToTake ? (
          <AssessmentRunner
            quiz={activeQuizToTake}
            user={user}
            onFinish={handleFinishQuiz}
            onCancel={() => setActiveQuizToTake(null)}
          />
        ) : (
          <>
            {/* STUDENT PORTAL VIEWS */}
            {user.role === 'student' && (
              <>
                {activeTab === 'dashboard' && (
                  <StudentDashboard
                    user={user}
                    quizzes={visibleQuizzes}
                    knowledgeTopics={knowledgeTopics}
                    prediction={prediction}
                    attempts={attempts}
                    onStartQuiz={handleStartQuiz}
                    onNavigateTab={setActiveTab}
                  />
                )}

                {activeTab === 'assessments' && (
                  <div className="space-y-6">
                    <div className="bg-[#F4F2E8] border border-[#E2DFD2] rounded-2xl p-6 shadow-sm">
                      <h2 className="text-2xl font-serif font-bold text-[#2C2C22]">Smart Assessment Center</h2>
                      <p className="text-xs text-[#585848] mt-1 font-medium">
                        Select a diagnostic test to measure concept mastery and calibrate your predicted exam readiness.
                      </p>
                    </div>

                    {visibleQuizzes.length === 0 ? (
                      <div className="p-12 text-center bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl space-y-3">
                        <p className="text-sm font-semibold text-[#2C2C22]">No assessments assigned to you yet.</p>
                        <p className="text-xs text-[#585848]">Check back later when your teacher assigns a new assessment drill to your email.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {visibleQuizzes.map((q) => (
                          <div
                            key={q.id}
                            className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-[#4E5738] transition-all"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#E8E4D5] text-[#4E5738] border border-[#D8D3C3]">
                                  {q.subject}
                                </span>
                                {q.assignedTo === 'selected' ? (
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                                    Targeted (Assigned to You)
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                    All Students
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg font-serif font-bold text-[#2C2C22]">{q.title}</h3>
                              <p className="text-xs text-[#585848] leading-relaxed">{q.description}</p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-[#ECE9DE] flex items-center justify-between">
                              <span className="text-xs text-[#6B705C] font-mono">{q.timeLimitMinutes} Mins &bull; {q.questions.length} Questions</span>
                              <button
                                onClick={() => handleStartQuiz(q)}
                                className="px-4 py-2 rounded-xl bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] font-semibold text-xs transition-colors shadow-sm"
                              >
                                Launch Assessment
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}


                {activeTab === 'analytics' && (
                  <KnowledgeAnalytics
                    knowledgeTopics={knowledgeTopics}
                    prediction={prediction}
                    attempts={attempts}
                  />
                )}

                {activeTab === 'pathway' && (
                  <LearningPathway
                    prediction={prediction}
                    onUpdatePathway={handleUpdatePathway}
                  />
                )}
              </>
            )}

            {/* TEACHER PORTAL VIEWS */}
            {user.role === 'teacher' && (
              <>
                {activeTab === 'dashboard' && (
                  <TeacherDashboard
                    user={user}
                    students={studentUsers}
                    quizzes={quizzes}
                    onNavigateTab={setActiveTab}
                  />
                )}

                {activeTab === 'creator' && (
                  <AssessmentCreator
                    user={user}
                    onQuizCreated={() => {
                      setQuizzes(getQuizzes());
                      setActiveTab('dashboard');
                    }}
                  />
                )}

                {activeTab === 'roster' && (
                  <StudentRoster students={studentUsers} attempts={attempts} quizzes={quizzes} />
                )}
              </>
            )}

            {/* ADMIN PORTAL VIEWS */}
            {user.role === 'admin' && (
              <AdminDashboard
                currentUser={user}
                users={usersList}
                onUpdateUsers={setUsersList}
                activeAdminTab={activeTab}
                setActiveAdminTab={setActiveTab}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}