import React, { useState } from 'react';
import { Sparkles, CheckCircle2, PlayCircle, BookOpen, Brain, Clock, ChevronRight, X, ArrowRight, ExternalLink } from 'lucide-react';

export const LearningPathway = ({
  prediction,
  onUpdatePathway
}) => {
  const [activeStep, setActiveStep] = useState(null);

  const toggleStepCompletion = (stepId) => {
    const updatedSteps = prediction.recommendedSteps.map((step) => {
      if (step.id === stepId) {
        return { ...step, completed: !step.completed };
      }
      return step;
    });

    const completedCount = updatedSteps.filter(s => s.completed).length;
    const boost = completedCount * 3;

    const updatedPathway = {
      ...prediction,
      predictedExamScore: Math.min(99, prediction.predictedExamScore + (updatedSteps.find(s=>s.id===stepId)?.completed ? 2 : -2)),
      recommendedSteps: updatedSteps
    };

    onUpdatePathway(updatedPathway);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-[#F4F2E8] border border-[#E2DFD2] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-[#E8E4D5] text-[#4E5738] border border-[#D8D3C3]">
            <Sparkles className="w-6 h-6 text-[#4E5738]" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#2C2C22]">Personalized AI Learning Pathway</h2>
            <p className="text-xs text-[#585848] font-medium">Custom tailored by SPARK Predictive AI to bridge your target knowledge gaps</p>
          </div>
        </div>
        <p className="text-xs text-[#2C2C22] mt-2 leading-relaxed bg-[#FFFFFF] p-3 rounded-xl border border-[#E2DFD2] font-medium">
          {prediction.aiAnalysisSummary}
        </p>
      </div>

      {/* Pathway Steps List */}
      <div className="space-y-4">
        <h3 className="text-base font-serif font-bold text-[#2C2C22] flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#4E5738]" /> Recommended Action Steps
        </h3>

        {prediction.recommendedSteps.map((step, idx) => (
          <div
            key={step.id}
            className={`p-5 rounded-2xl border transition-all duration-200 ${
              step.completed
                ? 'bg-[#F4F2E8]/60 border-emerald-300 text-[#6B705C]'
                : 'bg-[#FFFFFF] border-[#E2DFD2] text-[#2C2C22] hover:border-[#4E5738] shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleStepCompletion(step.id)}
                  title={step.completed ? 'Mark incomplete' : 'Mark complete'}
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    step.completed
                      ? 'bg-emerald-700 text-[#FDFCF8] font-bold'
                      : 'border-2 border-[#D8D3C3] hover:border-[#4E5738] text-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#4E5738] uppercase">Step {idx + 1}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-[#F4F2E8] text-[#4E5738] border border-[#E2DFD2]">
                      {step.type}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-[#E8E4D5] text-[#2C2C22] border border-[#D8D3C3] font-semibold">
                      {step.topic}
                    </span>
                  </div>

                  <h4 className={`text-base font-serif font-bold ${step.completed ? 'line-through text-[#6B705C]' : 'text-[#2C2C22]'}`}>
                    {step.title}
                  </h4>
                  <p className="text-xs text-[#585848]">{step.summary}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <span className="text-xs text-[#6B705C] flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#6B705C]" /> {step.durationMinutes} mins
                </span>

                <button
                  onClick={() => setActiveStep(step)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] font-semibold text-xs flex items-center gap-1 transition-colors"
                >
                  <span>Launch Module</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Micro-lesson Modal */}
      {activeStep && (
        <div className="fixed inset-0 z-50 bg-[#2C2C22]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ECE9DE] pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#4E5738] uppercase">{activeStep.type}</span>
                <h3 className="text-xl font-serif font-bold text-[#2C2C22] mt-1">{activeStep.title}</h3>
              </div>
              <button
                onClick={() => setActiveStep(null)}
                className="p-2 rounded-xl bg-[#F4F2E8] hover:bg-[#E8E4D5] text-[#585848] hover:text-[#2C2C22]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-[#2C2C22] leading-relaxed">
              <div className="p-4 rounded-2xl bg-[#F4F2E8] border border-[#E2DFD2] space-y-2">
                <h4 className="text-xs font-bold uppercase text-[#4E5738] tracking-wider">Concept Summary</h4>
                <p className="text-[#585848]">{activeStep.summary}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#E8E4D5] border border-[#D8D3C3] space-y-2">
                <h4 className="text-xs font-bold uppercase text-[#2C2C22] tracking-wider flex items-center gap-1">
                  <Brain className="w-4 h-4 text-[#4E5738]" /> Recommended Practice Drill
                </h4>
                <p className="text-xs text-[#585848]">
                  Focus on understanding the mathematical bounds or algorithmic flow. Work through sample inputs step-by-step.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#ECE9DE]">
              <button
                onClick={() => {
                  toggleStepCompletion(activeStep.id);
                  setActiveStep(null);
                }}
                className={`px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 ${
                  activeStep.completed
                    ? 'bg-[#F4F2E8] text-[#2C2C22] hover:bg-[#E8E4D5]'
                    : 'bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] shadow-sm'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{activeStep.completed ? 'Mark Incomplete' : 'Complete Module (+2% Predicted Score)'}</span>
              </button>

              <button
                onClick={() => setActiveStep(null)}
                className="px-4 py-2.5 rounded-xl bg-[#F4F2E8] text-[#2C2C22] font-semibold text-xs hover:bg-[#E8E4D5]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
