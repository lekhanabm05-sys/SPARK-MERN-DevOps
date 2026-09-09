import React, { useState, useEffect, useRef, useCallback } from 'react';
import { saveQuizAttempt, savePredictionPathway, getKnowledgeTopics, addActivityLog } from '../../services/storage.js';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Brain,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Camera,
  Video,
  VideoOff,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Eye,
  Maximize2,
  Minimize2,
  AlertTriangle,
  MonitorCheck
} from 'lucide-react';

export const AssessmentRunner = ({
  quiz,
  user,
  onFinish,
  onCancel
}) => {
  // Test Lifecycle & State
  const [isStarted, setIsStarted] = useState(false);
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);
  const [fullscreenError, setFullscreenError] = useState('');
  const [autoSubmitReason, setAutoSubmitReason] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [confidenceMap, setConfidenceMap] = useState({});
  const [questionTimeMap, setQuestionTimeMap] = useState({});

  const [timeLeftSeconds, setTimeLeftSeconds] = useState(quiz.timeLimitMinutes * 60);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedAttempt, setCompletedAttempt] = useState(null);
  const [isAiUpdating, setIsAiUpdating] = useState(false);

  const hasSubmittedRef = useRef(false);
  const currentQuestion = quiz.questions[currentIndex];

  const getQuestionLimit = (idx) => {
    const q = quiz.questions[idx];
    if (q && q.timeLimitSeconds && q.timeLimitSeconds > 0) {
      return q.timeLimitSeconds;
    }
    return 120;
  };

  const [questionTimeLeft, setQuestionTimeLeft] = useState(() => getQuestionLimit(0));
  const [autoAdvanceAlert, setAutoAdvanceAlert] = useState(null);

  // Camera Proctoring States
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('connecting');
  const [cameraErrorMsg, setCameraErrorMsg] = useState('');
  const [isCameraMinimized, setIsCameraMinimized] = useState(false);

  const startCamera = async () => {
    setCameraStatus('connecting');
    setCameraErrorMsg('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device access is unsupported in this browser environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => {
          // Changing the video source while it is loading can interrupt play.
          // This is expected during React renders and does not mean the camera failed.
          if (e?.name !== 'AbortError') console.warn('Video play warning:', e);
        });
      }
      setCameraStatus('active');
    } catch (err) {
      console.error('Proctoring camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraStatus('denied');
        setCameraErrorMsg('Camera access was denied by browser settings. Please grant camera permission to verify proctored test integrity.');
      } else {
        setCameraStatus('error');
        setCameraErrorMsg(err.message || 'Unable to connect to video camera hardware.');
      }
    }
  };

  // Camera stream lifecycle
  useEffect(() => {
    if (!isCompleted) {
      startCamera();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isCompleted]);

  // Bind video element when active or unminimized
  useEffect(() => {
    if (cameraStatus === 'active' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((e) => {
        if (e?.name !== 'AbortError') console.warn('Video play error:', e);
      });
    }
  }, [cameraStatus, isCameraMinimized, isStarted]);

  // Synchronize question timer when question changes
  useEffect(() => {
    if (!isStarted || isCompleted) return;
    setQuestionTimeLeft(getQuestionLimit(currentIndex));
  }, [currentIndex, isCompleted, isStarted]);

  // Handle question time limit expiration
  useEffect(() => {
    if (!isStarted || isCompleted) return;
    if (questionTimeLeft === 0) {
      setAutoAdvanceAlert(`Time limit reached for Question #${currentIndex + 1}! Auto-advancing...`);
      const alertTimer = setTimeout(() => setAutoAdvanceAlert(null), 3000);

      if (currentIndex < quiz.questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        handleQuizSubmit(null);
      }

      return () => clearTimeout(alertTimer);
    }
  }, [questionTimeLeft, isCompleted, isStarted]);

  // Handle overall quiz time limit expiration
  useEffect(() => {
    if (!isStarted || isCompleted) return;
    if (timeLeftSeconds === 0) {
      handleQuizSubmit(null);
    }
  }, [timeLeftSeconds, isCompleted, isStarted]);

  // Main ticker for overall and per-question timers
  useEffect(() => {
    if (!isStarted || isCompleted) return;

    const interval = setInterval(() => {
      // Overall quiz timer
      setTimeLeftSeconds((prev) => Math.max(0, prev - 1));

      // Track time spent on current question
      setQuestionTimeMap((prev) => ({
        ...prev,
        [currentIndex]: (prev[currentIndex] || 0) + 1
      }));

      // Question-level timer
      setQuestionTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, isCompleted, isStarted]);

  // Submit Handler with violation reason support
  const handleQuizSubmit = useCallback(async (violationReason = null) => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    if (violationReason) {
      setAutoSubmitReason(violationReason);
    }

    setIsCompleted(true);
    setIsAiUpdating(true);

    // Exit fullscreen cleanly if active
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen().catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Fullscreen exit handled:', e);
    }

    let correctCount = 0;
    const responses = quiz.questions.map((q, idx) => {
      const selected = selectedAnswers[idx] ?? -1;
      const isCorrect = selected === q.correctOptionIndex;
      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        selectedOptionIndex: selected,
        isCorrect,
        timeSpentSeconds: questionTimeMap[idx] || 10,
        confidenceLevel: confidenceMap[idx] || 'Medium'
      };
    });

    const scorePct = Math.round((correctCount / quiz.questions.length) * 100);

    // Topic mastery calculation
    const topicMap = {};
    quiz.questions.forEach((q, idx) => {
      const isCorrect = selectedAnswers[idx] === q.correctOptionIndex;
      const confidence = confidenceMap[idx] || 'Medium';
      let point = isCorrect ? 90 : 20;
      if (confidence === 'High') point += isCorrect ? 10 : -10;
      if (confidence === 'Low') point += isCorrect ? -10 : 10;

      topicMap[q.topic] = Math.max(0, Math.min(100, point));
    });

    const attempt = {
      id: `attempt-${Date.now()}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      studentId: user.id,
      studentName: user.name,
      studentEmail: user.email,
      subject: quiz.subject,
      score: correctCount,
      scorePercentage: scorePct,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      percentage: scorePct,
      completedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      responses,
      topicMasteryMap: topicMap,
      autoSubmitted: !!violationReason,
      violationReason: violationReason || null,
      proctoredStatus: violationReason ? 'Violation Auto-Submitted' : 'Proctored Completed'
    };

    saveQuizAttempt(attempt);
    setCompletedAttempt(attempt);

    // Add activity log for auditing
    if (violationReason) {
      addActivityLog(
        user.email,
        user.name,
        user.role || 'student',
        'Assessment Violation Auto-Submit',
        'proctoring',
        `Test "${quiz.title}" was auto-submitted due to: ${violationReason}. Final Score: ${scorePct}%.`
      );
    } else {
      addActivityLog(
        user.email,
        user.name,
        user.role || 'student',
        'Assessment Completed',
        'assessment',
        `Completed test "${quiz.title}" with score: ${scorePct}%.`
      );
    }

    // Call AI Prediction API
    try {
      const res = await fetch('/api/ai/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: user.name,
          subject: quiz.subject,
          scorePercentage: scorePct,
          topicMastery: topicMap
        })
      });

      if (res.ok) {
        const aiData = await res.json();
        const updatedPathway = {
          studentId: user.id,
          predictedExamScore: aiData.predictedExamScore || scorePct,
          confidenceScore: aiData.confidenceScore || 90,
          readinessLevel: aiData.readinessLevel || 'Moderate Readiness',
          topStrengths: aiData.topStrengths || [quiz.topic],
          keyWeaknesses: aiData.keyWeaknesses || ['Edge cases'],
          recommendedSteps: aiData.recommendedSteps || [],
          aiAnalysisSummary: aiData.aiAnalysisSummary || `Performance updated after completing ${quiz.title}.`,
          lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
        savePredictionPathway(updatedPathway);
      }
    } catch (e) {
      console.warn('AI prediction fetch warning:', e);
    } finally {
      setIsAiUpdating(false);
    }
  }, [quiz, selectedAnswers, questionTimeMap, confidenceMap, user]);

  // Request Fullscreen & Start Exam
  const handleEnterFullscreenAndStart = async () => {
    setFullscreenError('');
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else if (el.mozRequestFullScreen) {
        await el.mozRequestFullScreen();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
      }
      setIsFullscreenActive(true);
      setIsStarted(true);
    } catch (err) {
      console.warn('Fullscreen request issue, starting assessment with in-page full view:', err);
      // If fullscreen API is restricted (e.g., in some iframe scenarios), proceed with strict focus/tab-switch tracking
      setIsFullscreenActive(true);
      setIsStarted(true);
    }
  };

  // FULLSCREEN & TAB-SWITCH (VISIBILITY CHANGE & BLUR) EVENT LISTENERS
  useEffect(() => {
    if (!isStarted || isCompleted) return;

    // 1. Tab switch & Page Visibility change listener
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        console.warn('Tab switch detected! Auto-submitting assessment...');
        handleQuizSubmit('Tab Switch Detected (navigated away from exam tab)');
      }
    };

    // 2. Fullscreen exit listener
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreenActive(isCurrentlyFullscreen);

      // If user deliberately exited fullscreen while test is in progress
      if (!isCurrentlyFullscreen && isStarted && !hasSubmittedRef.current) {
        console.warn('Fullscreen exited! Auto-submitting assessment...');
        handleQuizSubmit('Fullscreen Mode Exited (Security violation during proctored test)');
      }
    };

    // 3. Prevent accidental page unload / refresh
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Assessment in progress. Leaving will submit your current answers.';
      return e.returnValue;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isStarted, isCompleted, handleQuizSubmit]);

  const handleOptionSelect = (optionIdx) => {
    if (isCompleted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIdx
    }));
    // Default confidence to Medium if not selected
    if (!confidenceMap[currentIndex]) {
      setConfidenceMap((prev) => ({
        ...prev,
        [currentIndex]: 'Medium'
      }));
    }
  };

  const handleConfidenceSelect = (level) => {
    if (isCompleted) return;
    setConfidenceMap((prev) => ({
      ...prev,
      [currentIndex]: level
    }));
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ----------------------------------------------------
  // PRE-EXAM SECURITY & FULLSCREEN GATE SCREEN
  // ----------------------------------------------------
  if (!isStarted) {
    return (
      <div className="max-w-3xl mx-auto my-auto space-y-6 animate-fadeIn">
        <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
          {/* Header Badge */}
          <div className="flex items-center justify-between pb-6 border-b border-[#ECE9DE]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#E8E4D5] text-[#4E5738] border border-[#D8D3C3] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#4E5738]" /> Proctored Security Gate
              </span>
              <span className="text-xs font-semibold text-[#6B705C]">{quiz.subject}</span>
            </div>
            <div className="text-xs font-mono font-bold text-[#585848] bg-[#F4F2E8] px-3 py-1 rounded-lg border border-[#E2DFD2]">
              {quiz.timeLimitMinutes} Mins Duration
            </div>
          </div>

          {/* Title & Description */}
          <div className="mt-6 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2C22]">
              {quiz.title}
            </h2>
            <p className="text-sm text-[#585848] leading-relaxed">
              {quiz.description || 'This is a strictly proctored diagnostic assessment. Review the security requirements below before proceeding.'}
            </p>
          </div>

          {/* Strict Security Rules Notice Box */}
          <div className="mt-6 p-5 rounded-2xl bg-[#FBF8EF] border border-[#E8DCC0] space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#8A5A00]">
              <AlertTriangle className="w-5 h-5 text-[#8A5A00] shrink-0" />
              <span>Strict Anti-Cheating & Exam Integrity Rules:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#585848]">
              {/* Rule 1: Fullscreen Required */}
              <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E2DFD2] flex items-start gap-3 shadow-2xs">
                <div className="p-2 rounded-lg bg-[#F4F2E8] text-[#4E5738] shrink-0">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-[#2C2C22] font-semibold">1. Full-Screen Required</strong>
                  <span>Assessment runs exclusively in Full-Screen mode to guarantee exam isolation. Exiting full-screen will immediately submit your test.</span>
                </div>
              </div>

              {/* Rule 2: Tab Switching Auto-Submits */}
              <div className="p-3.5 rounded-xl bg-[#FFF5F5] border border-red-200 flex items-start gap-3 shadow-2xs">
                <div className="p-2 rounded-lg bg-red-100 text-red-700 shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-red-900 font-semibold">2. Auto-Submit on Tab Switch</strong>
                  <span className="text-red-800">Any attempt to switch tabs, minimize the window, or open another app will <strong>instantly auto-submit</strong> your test.</span>
                </div>
              </div>

              {/* Rule 3: Per-Question Timers */}
              <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E2DFD2] flex items-start gap-3 shadow-2xs">
                <div className="p-2 rounded-lg bg-[#F4F2E8] text-[#4E5738] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-[#2C2C22] font-semibold">3. Timed Questions</strong>
                  <span>Each question has dedicated time limits. Test auto-advances when the question timer reaches zero.</span>
                </div>
              </div>

              {/* Rule 4: Webcam Proctoring */}
              <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E2DFD2] flex items-start gap-3 shadow-2xs">
                <div className="p-2 rounded-lg bg-[#F4F2E8] text-[#4E5738] shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-[#2C2C22] font-semibold">4. Live Camera Verification</strong>
                  <span>Webcam feed monitors identity and test environment during the entire session.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Camera Pre-check Thumbnail */}
          <div className="mt-6 p-4 rounded-2xl bg-[#F4F2E8] border border-[#E2DFD2] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-12 rounded-lg bg-[#1A1A14] overflow-hidden border border-[#D8D3C3] flex items-center justify-center shrink-0">
                {cameraStatus === 'active' ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <VideoOff className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-[#2C2C22] flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#4E5738]" /> Proctoring Camera Check:
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${cameraStatus === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {cameraStatus === 'active' ? 'Online & Ready' : 'Permission Required'}
                  </span>
                </div>
                <p className="text-[11px] text-[#585848] mt-0.5">
                  Candidate: <strong>{user.name}</strong> ({user.email || user.role})
                </p>
              </div>
            </div>

            {cameraStatus !== 'active' && (
              <button
                type="button"
                onClick={startCamera}
                className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#D8D3C3] text-xs font-semibold text-[#2C2C22] hover:bg-[#E8E4D5] flex items-center gap-1.5 shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Enable Webcam
              </button>
            )}
          </div>

          {fullscreenError && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{fullscreenError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-[#ECE9DE] flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#F4F2E8] hover:bg-[#E8E4D5] text-[#585848] hover:text-[#2C2C22] text-xs font-bold transition-all"
            >
              Cancel & Exit
            </button>

            <button
              type="button"
              onClick={handleEnterFullscreenAndStart}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] font-bold text-sm shadow-md flex items-center justify-center gap-2.5 transition-all transform active:scale-98"
            >
              <MonitorCheck className="w-4 h-4" />
              <span>Enter Full Screen & Start Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // ACTIVE EXAM OR RESULTS SCREEN
  // ----------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-[#F4F2E8] border border-[#E2DFD2] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#4E5738] uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#E8E4D5] border border-[#D8D3C3]">
              {quiz.subject} Diagnostic Test
            </span>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-100 border border-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Full Screen Mode Active
            </span>
            <span className="text-xs font-semibold text-red-800 uppercase tracking-wider px-2.5 py-0.5 rounded bg-red-100 border border-red-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-700" />
              Tab Switch Auto-Submit Active
            </span>
          </div>
          <h2 className="text-xl font-serif font-bold text-[#2C2C22] mt-1.5">{quiz.title}</h2>
          <p className="text-xs text-[#585848] mt-0.5">{quiz.description}</p>
        </div>

        {!isCompleted && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#E2DFD2] font-mono text-sm font-bold text-[#2C2C22]">
              <Clock className="w-4 h-4 text-[#4E5738]" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>
            <button
              onClick={() => handleQuizSubmit('User voluntary submit')}
              className="px-3.5 py-2 rounded-xl bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] text-xs font-semibold shadow-2xs"
            >
              Submit Test
            </button>
          </div>
        )}
      </div>

      {/* QUIZ IN-PROGRESS VIEW */}
      {!isCompleted ? (
        <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Live Camera Proctoring Widget */}
          <div className="bg-[#F4F2E8] border border-[#E2DFD2] rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    cameraStatus === 'active'
                      ? 'bg-emerald-500 animate-pulse'
                      : cameraStatus === 'connecting'
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-red-500'
                  }`}
                />
                <span className="text-xs font-bold text-[#2C2C22] flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#4E5738]" /> Live Proctoring Camera Feed
                </span>
                {cameraStatus === 'active' && (
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Proctored Live
                  </span>
                )}
                {cameraStatus === 'denied' && (
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <VideoOff className="w-3 h-3" /> Camera Blocked
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsCameraMinimized(!isCameraMinimized)}
                className="text-xs text-[#585848] hover:text-[#2C2C22] p-1 rounded-lg hover:bg-[#E8E4D5] flex items-center gap-1 font-semibold transition-colors"
              >
                {isCameraMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                <span>{isCameraMinimized ? 'Expand Camera' : 'Minimize'}</span>
              </button>
            </div>

            {!isCameraMinimized && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                {/* Video Stream Container */}
                <div className="sm:col-span-1 relative rounded-xl overflow-hidden bg-[#1A1A14] border border-[#D8D3C3] aspect-video flex items-center justify-center group shadow-inner">
                  {cameraStatus === 'active' && (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                      <div className="absolute inset-0 border border-emerald-500/30 rounded-xl pointer-events-none p-2 flex flex-col justify-between">
                        <div className="flex justify-between items-center text-[9px] font-mono text-emerald-400 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                          <span>REC ●</span>
                          <span>FACIAL MONITOR: ACTIVE</span>
                        </div>
                        <div className="text-[9px] font-mono text-emerald-300 bg-black/60 px-1.5 py-0.5 rounded w-fit backdrop-blur-xs">
                          STUDENT: {user.name}
                        </div>
                      </div>
                    </>
                  )}

                  {cameraStatus === 'connecting' && (
                    <div className="text-center p-4 space-y-2 text-[#E8E4D5]">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#E8E4D5]" />
                      <p className="text-xs font-mono">Connecting Camera...</p>
                    </div>
                  )}

                  {(cameraStatus === 'denied' || cameraStatus === 'error') && (
                    <div className="text-center p-3 space-y-2 text-red-300">
                      <VideoOff className="w-6 h-6 mx-auto text-red-400" />
                      <p className="text-[11px] font-mono text-red-200 leading-tight">No Video Feed</p>
                    </div>
                  )}
                </div>

                {/* Camera Status Info & Anti-Cheating Warning */}
                <div className="sm:col-span-2 space-y-2">
                  <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E2DFD2] space-y-1.5">
                    <div className="text-xs font-bold text-[#2C2C22] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-[#4E5738]" /> Real-Time Anti-Cheating Proctor Active
                      </span>
                      <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                        Do Not Switch Tabs
                      </span>
                    </div>
                    <p className="text-xs text-[#585848] leading-relaxed">
                      Your test session is locked to this window. If you switch tabs, leave fullscreen, or minimize the browser, your assessment will be <strong>automatically submitted immediately</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Question Auto-advance Banner */}
          {autoAdvanceAlert && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-2 animate-bounce shadow-sm">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{autoAdvanceAlert}</span>
            </div>
          )}

          {/* Progress Bar & Question Timer */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-[#6B705C]">
              <span>Question {currentIndex + 1} of {quiz.questions.length}</span>
              <span>{Math.round(((currentIndex + 1) / quiz.questions.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-[#E2DFD2] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#4E5738] h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>

            {/* Per-Question Live Countdown Card */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                questionTimeLeft <= 10
                  ? 'bg-red-50 border-red-300 text-red-900 ring-1 ring-red-400'
                  : 'bg-[#F4F2E8] border-[#E2DFD2] text-[#2C2C22]'
              }`}
            >
              <div className="flex items-center gap-2 font-mono text-xs font-bold">
                <Clock className={`w-4 h-4 ${questionTimeLeft <= 10 ? 'text-red-600 animate-spin' : 'text-[#4E5738]'}`} />
                <span>Question Timer:</span>
                <span
                  className={`text-sm px-2.5 py-0.5 rounded-md font-bold font-mono transition-colors ${
                    questionTimeLeft <= 10 ? 'bg-red-200 text-red-900' : 'bg-[#E8E4D5] text-[#2C2C22]'
                  }`}
                >
                  {formatTime(questionTimeLeft)}
                </span>
                {questionTimeLeft <= 10 && (
                  <span className="text-[11px] font-sans text-red-700 font-bold ml-1">
                    ⚠️ Hurry! Time running out for this question
                  </span>
                )}
              </div>

              {/* Individual Question Time Bar */}
              <div className="w-36 bg-[#E2DFD2] h-2.5 rounded-full overflow-hidden shrink-0 hidden sm:block">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    questionTimeLeft <= 10 ? 'bg-red-600' : 'bg-[#4E5738]'
                  }`}
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, (questionTimeLeft / getQuestionLimit(currentIndex)) * 100)
                    )}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#4E5738]">
              <span className="px-2 py-0.5 rounded bg-[#F4F2E8] border border-[#E2DFD2] font-semibold">
                Topic: {currentQuestion.topic}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#E8E4D5] border border-[#D8D3C3] font-semibold">
                Difficulty: {currentQuestion.difficulty}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#E8E4D5] border border-[#D8D3C3] font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#4E5738]" /> Question Limit: {getQuestionLimit(currentIndex) === 120 ? '2 mins (120s)' : `${Math.floor(getQuestionLimit(currentIndex) / 60)}m ${getQuestionLimit(currentIndex) % 60 ? `${getQuestionLimit(currentIndex) % 60}s` : '00s'}`}
              </span>
            </div>

            <h3 className="text-lg font-serif font-bold text-[#2C2C22] leading-relaxed">
              {currentQuestion.text}
            </h3>
          </div>

          {/* Multiple Choice Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, optionIdx) => {
              const isSelected = selectedAnswers[currentIndex] === optionIdx;
              return (
                <button
                  key={optionIdx}
                  type="button"
                  onClick={() => handleOptionSelect(optionIdx)}
                  className={`w-full p-4 rounded-xl text-left text-sm font-medium transition-all duration-150 flex items-center justify-between border ${
                    isSelected
                      ? 'bg-[#F4F2E8] border-[#4E5738] text-[#2C2C22] ring-1 ring-[#4E5738] shadow-sm'
                      : 'bg-[#FFFFFF] border-[#E2DFD2] text-[#2C2C22] hover:border-[#4E5738] hover:bg-[#F4F2E8]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                        isSelected ? 'bg-[#4E5738] text-[#FDFCF8]' : 'bg-[#E8E4D5] text-[#2C2C22]'
                      }`}
                    >
                      {String.fromCharCode(65 + optionIdx)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-[#4E5738]" />}
                </button>
              );
            })}
          </div>

          {/* Answer Confidence Selector */}
          {selectedAnswers[currentIndex] !== undefined && (
            <div className="p-4 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] space-y-2">
              <label className="block text-xs font-semibold text-[#2C2C22] flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-[#4E5738]" />
                How confident are you in this response? (Used for AI Predictive Calibration):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['High', 'Medium', 'Low'].map((level) => {
                  const isSelected = (confidenceMap[currentIndex] || 'Medium') === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleConfidenceSelect(level)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                        isSelected
                          ? level === 'High'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-1 ring-emerald-500'
                            : level === 'Medium'
                            ? 'bg-amber-100 text-amber-800 border-amber-300 ring-1 ring-amber-500'
                            : 'bg-red-100 text-red-800 border-red-300 ring-1 ring-red-500'
                          : 'bg-[#FFFFFF] text-[#585848] border-[#E2DFD2] hover:bg-[#E8E4D5]'
                      }`}
                    >
                      {level} Confidence
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[#ECE9DE]">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 rounded-xl bg-[#F4F2E8] hover:bg-[#E8E4D5] disabled:opacity-40 text-[#2C2C22] font-semibold text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            {currentIndex < quiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(quiz.questions.length - 1, prev + 1))}
                className="px-5 py-2.5 rounded-xl bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] font-semibold text-xs flex items-center gap-1.5 shadow-sm"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleQuizSubmit(null)}
                className="px-6 py-2.5 rounded-xl bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] font-semibold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> Finish & Submit Assessment
              </button>
            )}
          </div>
        </div>
      ) : (
        /* COMPLETED RESULT BREAKDOWN VIEW */
        <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Security Alert Banner if Auto-Submitted due to Tab Switch / Fullscreen Exit */}
          {autoSubmitReason && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-red-900">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                <span>Assessment Auto-Submitted due to Security Policy Violation</span>
              </div>
              <p className="text-xs text-red-800 leading-relaxed font-medium">
                <strong>Detected Event:</strong> {autoSubmitReason}. Per proctoring regulations, all answers selected up to the moment of tab switching or window change were automatically scored and submitted.
              </p>
            </div>
          )}

          <div className="text-center space-y-3 pb-6 border-b border-[#ECE9DE]">
            <div className="inline-flex p-3 rounded-2xl bg-[#F4F2E8] border border-[#E2DFD2] text-[#4E5738]">
              <Sparkles className="w-8 h-8 text-[#4E5738]" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#2C2C22]">Diagnostic Results Calculated!</h3>
            <p className="text-sm text-[#585848]">Real-time prediction model updated with your attempt data.</p>

            {/* Big Score Counter */}
            <div className="flex items-center justify-center gap-6 pt-2">
              <div className="p-4 rounded-2xl bg-[#F4F2E8] border border-[#E2DFD2] text-center min-w-[140px]">
                <div className="text-3xl font-serif font-bold text-[#2C2C22]">{completedAttempt?.scorePercentage}%</div>
                <div className="text-xs text-[#585848] mt-1">Final Score</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#F4F2E8] border border-[#E2DFD2] text-center min-w-[140px]">
                <div className="text-3xl font-serif font-bold text-[#4E5738]">
                  {completedAttempt?.correctAnswers} / {completedAttempt?.totalQuestions}
                </div>
                <div className="text-xs text-[#585848] mt-1">Correct Answers</div>
              </div>
            </div>

            {isAiUpdating && (
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#4E5738] animate-pulse bg-[#F4F2E8] px-3 py-1.5 rounded-lg border border-[#E2DFD2]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Recalculating Gemini Knowledge Prediction...
              </div>
            )}
          </div>

          {/* Question Explanations List */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase text-[#4E5738] tracking-wider">
              Question by Question Breakdown
            </h4>

            {quiz.questions.map((q, idx) => {
              const selectedOpt = selectedAnswers[idx];
              const isCorrect = selectedOpt === q.correctOptionIndex;
              const confidence = confidenceMap[idx] || 'Medium';

              return (
                <div key={q.id} className="p-4 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#585848]">Q{idx + 1}.</span>
                      <span className="text-sm font-bold text-[#2C2C22]">{q.text}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-[#E8E4D5] text-[#4E5738]">
                        {confidence} Conf.
                      </span>
                      {isCorrect ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-[#585848] pl-6 space-y-1">
                    <div>
                      Selected: <span className={isCorrect ? 'text-emerald-800 font-bold' : 'text-red-800 font-bold'}>
                        {selectedOpt !== undefined ? q.options[selectedOpt] : 'No answer'}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div>
                        Correct Answer: <span className="text-emerald-800 font-bold">{q.options[q.correctOptionIndex]}</span>
                      </div>
                    )}
                    <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E2DFD2] text-[#2C2C22] mt-2">
                      <strong className="text-[#4E5738]">AI Explanation:</strong> {q.explanation}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#ECE9DE]">
            <button
              onClick={() => onFinish(completedAttempt)}
              className="px-6 py-3 rounded-xl bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] font-semibold text-xs shadow-sm flex items-center gap-2"
            >
              <span>Return to Dashboard & Analytics</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
