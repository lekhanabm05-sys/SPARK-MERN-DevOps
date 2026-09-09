import React from 'react';
import { Sparkles, Brain, Award, PlayCircle, TrendingUp, Target, CheckCircle2, ArrowRight, Clock, ChevronRight } from 'lucide-react';

export const StudentDashboard = ({
  user,
  quizzes,
  knowledgeTopics,
  prediction,
  attempts,
  onStartQuiz,
  onNavigateTab
}) => {
  const avgMastery = Math.round(
    knowledgeTopics.reduce((acc, t) => acc + t.masteryPercentage, 0) / (knowledgeTopics.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Top Welcome Hero */}
      <div className="bg-[#F4F2E8] border border-[#E2DFD2] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8E4D5] border border-[#D8D3C3] text-[#4E5738] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#4E5738]" /> Real-time Analytics Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2C22] tracking-tight">
              Welcome back, <span className="text-[#4E5738]">{user.name}</span>!
            </h1>
            <p className="text-[#585848] text-sm leading-relaxed font-medium">
              Your real-time AI knowledge model predicts an exam readiness score of{' '}
              <strong className="text-[#2C2C22] font-bold">{prediction.predictedExamScore}%</strong>.
              Complete today's diagnostic drill to boost your pathway progress.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => onNavigateTab('assessments')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start Diagnostic Assessment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Predicted Exam Score */}
        <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-[#6B705C] tracking-wider">Predicted Exam Score</span>
            <div className="p-2 rounded-xl bg-[#F4F2E8] text-[#4E5738]">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-[#2C2C22]">{prediction.predictedExamScore}%</span>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +4% this week
            </span>
          </div>
          <p className="text-[11px] text-[#585848] mt-2 font-medium">{prediction.readinessLevel}</p>
        </div>

        {/* Metric 2: Overall Knowledge Mastery */}
        <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-[#6B705C] tracking-wider">Topic Mastery Index</span>
            <div className="p-2 rounded-xl bg-[#F4F2E8] text-[#4E5738]">
              <Brain className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-[#2C2C22]">{avgMastery}%</span>
            <span className="text-xs text-[#6B705C]">{knowledgeTopics.length} topics</span>
          </div>
          <div className="w-full bg-[#E2DFD2] h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#4E5738] h-full rounded-full transition-all duration-500"
              style={{ width: `${avgMastery}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Assessments Completed */}
        <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-[#6B705C] tracking-wider">Assessments Taken</span>
            <div className="p-2 rounded-xl bg-[#F4F2E8] text-[#4E5738]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-[#2C2C22]">{attempts.length}</span>
            <span className="text-xs text-[#6B705C]">completed</span>
          </div>
          <p className="text-[11px] text-[#585848] mt-2">
            {attempts.length > 0
              ? `Last score: ${attempts[0].scorePercentage}%`
              : 'No tests completed yet.'}
          </p>
        </div>

        {/* Metric 4: Active Learning Streak */}
        <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-[#6B705C] tracking-wider">Learning Streak</span>
            <div className="p-2 rounded-xl bg-[#F4F2E8] text-[#4E5738]">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-[#2C2C22]">5 Days</span>
            <span className="text-xs text-emerald-700 font-semibold">Active Streak</span>
          </div>
          <p className="text-[11px] text-[#585848] mt-2">AI pathway updated in real time</p>
        </div>
      </div>

      {/* Recent Assessment History */}
      <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#2C2C22] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#4E5738]" /> Recent Assessment History
            </h3>
            <p className="text-xs text-[#585848] mt-0.5">Your record of completed diagnostic quizzes and performance feedback</p>
          </div>

          <button
            onClick={() => onNavigateTab('assessments')}
            className="px-4 py-2 rounded-xl bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Take New Assessment</span>
          </button>
        </div>

        {attempts.length === 0 ? (
          <div className="p-8 text-center bg-[#F4F2E8] border border-[#E2DFD2] rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#E8E4D5] text-[#4E5738] flex items-center justify-center mx-auto">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#2C2C22]">No assessment history recorded yet</p>
            <p className="text-xs text-[#585848]">Complete a diagnostic assessment to start tracking your historical progress.</p>
            <button
              onClick={() => onNavigateTab('assessments')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] text-xs font-semibold transition-colors"
            >
              <span>Explore Smart Assessments</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="p-4 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] hover:border-[#4E5738] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E8E4D5] text-[#4E5738] border border-[#D8D3C3]">
                      {attempt.subject}
                    </span>
                    <span className="text-xs text-[#6B705C] font-mono">{attempt.completedAt}</span>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-[#2C2C22]">{attempt.quizTitle}</h4>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-xl font-serif font-bold text-[#2C2C22]">{attempt.scorePercentage}%</span>
                    <span className="text-xs text-[#585848] block font-mono">
                      {attempt.correctAnswers}/{attempt.totalQuestions} correct
                    </span>
                  </div>
                  {attempt.autoSubmitted && (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                      Auto-Submitted (Tab Switch)
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                      attempt.scorePercentage >= 80
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : attempt.scorePercentage >= 60
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {attempt.scorePercentage >= 80 ? 'Mastered' : attempt.scorePercentage >= 60 ? 'Passed' : 'Needs Practice'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
