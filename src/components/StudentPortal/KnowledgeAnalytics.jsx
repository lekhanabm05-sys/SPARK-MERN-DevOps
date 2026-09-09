import React from 'react';
import { Brain, TrendingUp, Target, AlertTriangle, CheckCircle2, Award, Clock } from 'lucide-react';

export const KnowledgeAnalytics = ({
  knowledgeTopics,
  prediction,
  attempts
}) => {
  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div className="bg-[#F4F2E8] border border-[#E2DFD2] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8E4D5] text-[#4E5738] text-xs font-semibold mb-2 border border-[#D8D3C3]">
              <Brain className="w-3.5 h-3.5 text-[#4E5738]" /> Real-time Predictive Analytics Engine
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#2C2C22]">Knowledge Prediction & Mastery Analytics</h2>
            <p className="text-xs text-[#585848] mt-1 font-medium">
              AI continuously recalibrates your expected performance based on response accuracy, confidence levels, and topic difficulty curves.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2DFD2] text-right shrink-0">
            <span className="text-xs uppercase text-[#6B705C] font-bold block">Predicted Exam Score</span>
            <span className="text-3xl font-serif font-bold text-[#2C2C22]">{prediction.predictedExamScore}%</span>
            <span className="text-[10px] text-emerald-800 font-bold block">{prediction.readinessLevel}</span>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses Diagnosis Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths Card */}
        <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#2C2C22]">Validated Conceptual Strengths</h3>
              <p className="text-xs text-[#585848]">High mastery topics with consistent answer velocity</p>
            </div>
          </div>

          <div className="space-y-2">
            {prediction.topStrengths.map((str, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] text-xs font-semibold text-[#2C2C22] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-700 shrink-0" />
                <span>{str}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses / Critical Focus Card */}
        <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#2C2C22]">Target Weakness Diagnosis</h3>
              <p className="text-xs text-[#585848]">Key knowledge gaps impacting your predicted exam readiness</p>
            </div>
          </div>

          <div className="space-y-2">
            {prediction.keyWeaknesses.map((weak, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] text-xs font-semibold text-[#2C2C22] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-700 shrink-0" />
                <span>{weak}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comprehensive Knowledge Topic Radar / Bars */}
      <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-serif font-bold text-[#2C2C22] flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#4E5738]" /> Comprehensive Topic Mastery Scores
        </h3>

        <div className="space-y-4">
          {knowledgeTopics.map((topic) => (
            <div key={topic.id} className="p-4 rounded-2xl bg-[#F4F2E8] border border-[#E2DFD2] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="text-[#2C2C22] font-bold">{topic.topicName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-[#E8E4D5] text-[#4E5738]">
                    {topic.subject}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                      topic.status === 'Mastered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : topic.status === 'Proficient'
                        ? 'bg-blue-100 text-blue-800'
                        : topic.status === 'Needs Practice'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {topic.status}
                  </span>
                  <span className="text-base font-serif font-bold text-[#2C2C22]">{topic.masteryPercentage}%</span>
                </div>
              </div>

              <div className="w-full bg-[#E2DFD2] h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    topic.masteryPercentage >= 85
                      ? 'bg-emerald-600'
                      : topic.masteryPercentage >= 70
                      ? 'bg-[#4E5738]'
                      : topic.masteryPercentage >= 55
                      ? 'bg-amber-600'
                      : 'bg-red-600'
                  }`}
                  style={{ width: `${topic.masteryPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#585848] pt-1">
                <span>Last evaluated: {topic.lastEvaluated}</span>
                <span className="text-[#4E5738] font-mono font-semibold">Impact on Exam Score: {topic.predictedScoreImpact > 0 ? `+${topic.predictedScoreImpact}%` : `${topic.predictedScoreImpact}%`}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
