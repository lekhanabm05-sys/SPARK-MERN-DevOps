import React from 'react';
import { INITIAL_CLASS_ANALYTICS } from '../../data/mockData.js';
import { Users, AlertTriangle, TrendingUp, Award, Brain, Plus, ArrowRight, Shield, CheckCircle2, UserCheck, Globe, Mail } from 'lucide-react';

export const TeacherDashboard = ({
  user,
  students,
  quizzes = [],
  onNavigateTab
}) => {
  const analytics = INITIAL_CLASS_ANALYTICS;

  return (
    <div className="space-y-6">
      {/* Top Welcome Hero */}
      <div className="bg-[#F4F2E8] border border-[#E2DFD2] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8E4D5] border border-[#D8D3C3] text-[#4E5738] text-xs font-semibold">
              <Brain className="w-3.5 h-3.5 text-[#4E5738]" /> Educator Control & Predictive Analytics
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2C22] tracking-tight">
              Welcome back, <span className="text-[#4E5738]">{user.name}</span>
            </h1>
            <p className="text-[#585848] text-sm leading-relaxed font-medium">
              Monitoring <strong className="text-[#2C2C22] font-bold">{students.length} students</strong> across {analytics.subject}. Real-time analytics predict a class pass rate of {analytics.predictedPassRate}%.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('creator')}
            className="px-6 py-3.5 rounded-2xl bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create AI Assessment</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-[#6B705C] tracking-wider">Total Enrolled</span>
            <div className="p-2 rounded-xl bg-[#F4F2E8] text-[#4E5738]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#2C2C22]">{students.length}</div>
          <p className="text-[11px] text-[#585848] mt-2 font-medium">Active Students in Roster</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-[#6B705C] tracking-wider">Average Class Mastery</span>
            <div className="p-2 rounded-xl bg-[#F4F2E8] text-[#4E5738]">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#2C2C22]">{analytics.averageMastery}%</div>
          <p className="text-[11px] text-emerald-800 font-medium mt-2">+3% improvement after last drill</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-[#6B705C] tracking-wider">Predicted Pass Rate</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-amber-800">{analytics.predictedPassRate}%</div>
          <p className="text-[11px] text-[#585848] mt-2">Based on Gemini AI evaluation</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-[#6B705C] tracking-wider">Students Needing Support</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-red-700">{analytics.atRiskCount}</div>
          <p className="text-[11px] text-red-800 font-medium mt-2">Flagged for targeted remediation</p>
        </div>
      </div>

      {/* Class Topic Heatmap */}
      <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-serif font-bold text-[#2C2C22] flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#4E5738]" /> Class Topic Mastery Heatmap
        </h3>

        <div className="space-y-4">
          {analytics.topicBreakdown.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#2C2C22] font-bold">{item.topicName}</span>
                <span className="text-sm font-bold text-[#2C2C22]">{item.avgMastery}%</span>
              </div>
              <div className="w-full bg-[#E2DFD2] h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.avgMastery >= 80 ? 'bg-emerald-600' : item.avgMastery >= 65 ? 'bg-amber-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${item.avgMastery}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Published Assessments & Student Assignment Overview */}
      <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#2C2C22] flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#4E5738]" /> Published Assessments & Student Assignments ({quizzes.length})
            </h3>
            <p className="text-xs text-[#585848] mt-0.5">
              Review target audience access controls (All Enrolled vs. Selected Student Emails) for active assessments.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('creator')}
            className="px-4 py-2 rounded-xl bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Assessment</span>
          </button>
        </div>

        {quizzes.length === 0 ? (
          <div className="p-6 text-center bg-[#F4F2E8] border border-[#E2DFD2] rounded-xl text-xs text-[#585848]">
            No assessments published yet. Click 'New Assessment' to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quiz) => {
              const isTargeted = quiz.assignedTo === 'selected';
              const emailList = Array.isArray(quiz.assignedEmails) ? quiz.assignedEmails : [];
              return (
                <div
                  key={quiz.id}
                  className="p-4 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E8E4D5] text-[#4E5738] border border-[#D8D3C3]">
                        {quiz.subject}
                      </span>
                      {isTargeted ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-blue-700" />
                          Targeted ({emailList.length} Emails)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-600" />
                          All Students
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-serif font-bold text-[#2C2C22]">{quiz.title}</h4>
                    <p className="text-xs text-[#585848] line-clamp-2">{quiz.description}</p>
                  </div>

                  {isTargeted && (
                    <div className="pt-2 border-t border-[#E2DFD2]">
                      <span className="text-[11px] font-bold text-[#4E5738] block mb-1">Assigned Student Emails:</span>
                      {emailList.length === 0 ? (
                        <span className="text-[11px] text-amber-800 italic">No specific emails attached</span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                          {emailList.map((em) => (
                            <span
                              key={em}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFFFFF] border border-[#D8D3C3] text-[#2C2C22] text-[10px] font-mono"
                            >
                              <Mail className="w-2.5 h-2.5 text-[#4E5738]" />
                              {em}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
