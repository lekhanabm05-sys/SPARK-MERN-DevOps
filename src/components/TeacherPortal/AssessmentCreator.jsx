import React, { useState, useMemo } from 'react';
import { saveQuiz, getUsers } from '../../services/storage.js';
import { Sparkles, Plus, Trash2, CheckCircle2, RefreshCw, Clock, Save, Check, Users, UserCheck, Globe, Mail, X, AlertCircle } from 'lucide-react';

export const AssessmentCreator = ({ user, onQuizCreated }) => {
  const [title, setTitle] = useState('Advanced Quantum Mechanics & Superposition');
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('Quantum Computing & Qubits');
  const [description, setDescription] = useState('Diagnostic quiz evaluating qubit state superposition, entanglement, and Hadamard gates.');
  const [defaultQuestionTimeLimit, setDefaultQuestionTimeLimit] = useState(120);
  const [timeLimit, setTimeLimit] = useState(15);
  const [difficulty, setDifficulty] = useState('Intermediate');

  // Target Student Assignment State
  const [assignedTo, setAssignedTo] = useState('all'); // 'all' or 'selected'
  const [assignedEmails, setAssignedEmails] = useState([]);
  const [customEmailInput, setCustomEmailInput] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  const availableStudents = useMemo(() => {
    return getUsers().filter((u) => u.role === 'student');
  }, []);

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiCount, setAiCount] = useState(3);
  const [statusMessage, setStatusMessage] = useState(null);
  const [paramsSaveMsg, setParamsSaveMsg] = useState(null);

  const [questions, setQuestions] = useState([]);

  const handleToggleStudentEmail = (email) => {
    const normalized = email.toLowerCase().trim();
    setAssignedEmails((prev) =>
      prev.includes(normalized)
        ? prev.filter((e) => e !== normalized)
        : [...prev, normalized]
    );
  };

  const handleAddCustomEmail = (e) => {
    e?.preventDefault();
    if (!customEmailInput.trim()) return;
    const normalized = customEmailInput.toLowerCase().trim();
    if (!normalized.includes('@')) {
      alert('Please enter a valid student email address (e.g. alex@spark.edu).');
      return;
    }
    if (!assignedEmails.includes(normalized)) {
      setAssignedEmails((prev) => [...prev, normalized]);
    }
    setCustomEmailInput('');
  };

  const handleSelectAllStudents = () => {
    const allEmails = availableStudents.map((s) => s.email.toLowerCase().trim());
    setAssignedEmails(allEmails);
  };

  const handleClearAllStudents = () => {
    setAssignedEmails([]);
  };

  const handleSaveParameters = (e) => {
    e.preventDefault();
    if (!title.trim() || !topic.trim()) {
      alert('Please enter both Assessment Title and Target Topic.');
      return;
    }
    setParamsSaveMsg('Assessment parameters saved successfully!');
    setTimeout(() => setParamsSaveMsg(null), 3500);
  };

  const handleAiGenerateQuestions = async () => {
    setIsGeneratingAi(true);
    setStatusMessage(`Generating ${aiCount} non-repeating assessment question(s) with Gemini AI...`);

    // Collect current question texts to avoid repetitions
    const existingTextsList = questions
      .map(q => q.text.trim())
      .filter(t => t.length > 0);

    try {
      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subject,
          difficulty,
          count: aiCount,
          existingQuestions: existingTextsList
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          const existingSet = new Set(existingTextsList.map(t => t.toLowerCase()));
          
          const newUniqueQuestions = data.questions
            .filter((q) => !existingSet.has(q.text.trim().toLowerCase()))
            .map((q) => ({
              ...q,
              id: q.id || `gen-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              timeLimitSeconds: q.timeLimitSeconds || defaultQuestionTimeLimit
            }));

          if (newUniqueQuestions.length > 0) {
            setQuestions(prev => [...prev, ...newUniqueQuestions]);
            if (data.quizTitle && title === 'Advanced Quantum Mechanics & Superposition') {
              setTitle(data.quizTitle);
            }
            if (data.description && !description) {
              setDescription(data.description);
            }
            setStatusMessage(`Successfully generated ${newUniqueQuestions.length} unique, non-repeating question(s)!`);
          } else {
            setStatusMessage('No new unique questions could be generated for this topic. Try adjusting parameters or topic.');
          }
        } else {
          setStatusMessage('No questions returned from generator.');
        }
      } else {
        setStatusMessage('AI Generation endpoint error. Please try again.');
      }
    } catch (e) {
      console.error(e);
      setStatusMessage('Error contacting AI assessment service.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAddQuestion = () => {
    const newQ = {
      id: `q-manual-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: '',
      options: ['', '', '', ''],
      correctOptionIndex: -1, // Unselected by default; teacher must select
      explanation: '',
      topic,
      subject,
      difficulty,
      timeLimitSeconds: defaultQuestionTimeLimit
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleDefaultTimeLimitChange = (seconds) => {
    setDefaultQuestionTimeLimit(seconds);
    setQuestions(questions.map(q => ({
      ...q,
      timeLimitSeconds: q.timeLimitSeconds || seconds
    })));
  };

  const handleSaveQuiz = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please provide an assessment title.');
      return;
    }
    if (questions.length === 0) {
      alert('Please add at least one question before publishing.');
      return;
    }

    // Validate that questions have non-empty text
    const invalidIdx = questions.findIndex(q => !q.text.trim());
    if (invalidIdx !== -1) {
      alert(`Question #${invalidIdx + 1} has an empty question statement. Please fill it in before publishing.`);
      return;
    }

    // Validate that each question has a selected correct option
    const unselectedCorrectIdx = questions.findIndex(
      q => q.correctOptionIndex === undefined || q.correctOptionIndex === null || q.correctOptionIndex < 0
    );
    if (unselectedCorrectIdx !== -1) {
      alert(`Please select the correct answer option (A, B, C, or D) for Question #${unselectedCorrectIdx + 1}.`);
      return;
    }

    // Validate student assignment if restricted
    if (assignedTo === 'selected' && assignedEmails.length === 0) {
      alert('Please select at least one student from the roster or enter a student email address before publishing.');
      return;
    }

    const newQuiz = {
      id: `quiz-gen-${Date.now()}`,
      title,
      subject,
      topic,
      description,
      timeLimitMinutes: timeLimit,
      createdBy: user.id,
      createdByName: user.name,
      createdAt: new Date().toISOString().split('T')[0],
      assignedTo, // 'all' or 'selected'
      assignedEmails: assignedTo === 'selected' ? assignedEmails : [],
      questions,
      isAiGenerated: true
    };

    saveQuiz(newQuiz);
    setStatusMessage('Assessment published successfully!');
    setTimeout(() => {
      onQuizCreated();
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="bg-[#F4F2E8] border border-[#E2DFD2] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8E4D5] text-[#4E5738] text-xs font-semibold mb-2 border border-[#D8D3C3]">
              <Sparkles className="w-3.5 h-3.5 text-[#4E5738]" /> Educator AI Assessment Studio
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#2C2C22]">Create & Publish Assessment</h2>
            <p className="text-xs text-[#585848] mt-1 font-medium">
              Configure parameters, auto-generate non-repeating diagnostic items with Gemini AI, or add custom questions.
            </p>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-4 p-3 rounded-xl bg-[#FFFFFF] border border-[#E2DFD2] text-[#4E5738] text-xs font-semibold flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4E5738] shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-[#585848] hover:text-[#2C2C22] text-xs">Dismiss</button>
          </div>
        )}
      </div>

      {/* Form Details */}
      <form onSubmit={handleSaveQuiz} className="space-y-6">
        {/* SECTION 1: ASSESSMENT PARAMETERS */}
        <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2DFD2]">
            <h3 className="text-sm font-bold uppercase text-[#4E5738] tracking-wider">
              1. Assessment Parameters
            </h3>
            <button
              type="button"
              onClick={handleSaveParameters}
              className="px-3.5 py-1.5 rounded-xl bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Parameters</span>
            </button>
          </div>

          {paramsSaveMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{paramsSaveMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B705C] mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] text-[#2C2C22] text-sm focus:outline-none focus:border-[#4E5738]"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B705C] mb-1">Target Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Quantum Computing & Qubits"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] text-[#2C2C22] text-sm focus:outline-none focus:border-[#4E5738]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#6B705C] mb-1">Assessment Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Advanced Quantum Mechanics Quiz"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] text-[#2C2C22] text-sm focus:outline-none focus:border-[#4E5738] font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B705C] mb-1">
                Default Time Limit / Question
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={defaultQuestionTimeLimit}
                  onChange={(e) => handleDefaultTimeLimitChange(Math.max(10, Number(e.target.value)))}
                  min={10}
                  max={300}
                  step={5}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] text-[#2C2C22] text-sm focus:outline-none focus:border-[#4E5738]"
                />
                <span className="absolute right-3 top-2.5 text-xs text-[#585848] font-medium">sec</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B705C] mb-1">Total Time Limit (Minutes)</label>
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                min={1}
                max={120}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] text-[#2C2C22] text-sm focus:outline-none focus:border-[#4E5738]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B705C] mb-1">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] text-[#2C2C22] text-sm focus:outline-none focus:border-[#4E5738]"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: TARGET STUDENT ASSIGNMENT & ACCESS */}
        <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2DFD2]">
            <h3 className="text-sm font-bold uppercase text-[#4E5738] tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-[#4E5738]" />
              2. Target Student Assignment & Access
            </h3>
            <span className="text-xs text-[#6B705C] font-semibold">
              {assignedTo === 'all' ? 'Public (All Students)' : `Targeted (${assignedEmails.length} Selected)`}
            </span>
          </div>

          <p className="text-xs text-[#585848]">
            Specify student access for this assessment: make it available to all registered students or assign to specific student email addresses.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                assignedTo === 'all'
                  ? 'bg-[#F4F2E8] border-[#4E5738] ring-1 ring-[#4E5738]'
                  : 'bg-[#FFFFFF] border-[#E2DFD2] hover:border-[#6B705C]'
              }`}
            >
              <input
                type="radio"
                name="assignedTo"
                value="all"
                checked={assignedTo === 'all'}
                onChange={() => setAssignedTo('all')}
                className="mt-1 text-[#4E5738] focus:ring-[#4E5738]"
              />
              <div>
                <span className="text-sm font-bold text-[#2C2C22] flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#4E5738]" />
                  All Enrolled Students
                </span>
                <p className="text-xs text-[#585848] mt-0.5">
                  Every student registered on the platform can access and complete this assessment.
                </p>
              </div>
            </label>

            <label
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                assignedTo === 'selected'
                  ? 'bg-[#F4F2E8] border-[#4E5738] ring-1 ring-[#4E5738]'
                  : 'bg-[#FFFFFF] border-[#E2DFD2] hover:border-[#6B705C]'
              }`}
            >
              <input
                type="radio"
                name="assignedTo"
                value="selected"
                checked={assignedTo === 'selected'}
                onChange={() => setAssignedTo('selected')}
                className="mt-1 text-[#4E5738] focus:ring-[#4E5738]"
              />
              <div>
                <span className="text-sm font-bold text-[#2C2C22] flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#4E5738]" />
                  Selected Students Only
                </span>
                <p className="text-xs text-[#585848] mt-0.5">
                  Restrict assessment access exclusively to selected student emails.
                </p>
              </div>
            </label>
          </div>

          {assignedTo === 'selected' && (
            <div className="mt-4 p-4 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] space-y-4">
              {/* Selected Badges */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase text-[#4E5738]">
                    Assigned Student Emails ({assignedEmails.length})
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleSelectAllStudents}
                      className="text-[#4E5738] hover:underline font-semibold"
                    >
                      Select All Roster
                    </button>
                    <span className="text-[#D8D3C3]">&bull;</span>
                    <button
                      type="button"
                      onClick={handleClearAllStudents}
                      className="text-red-700 hover:underline font-semibold"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>

                {assignedEmails.length === 0 ? (
                  <div className="p-3 bg-[#FFFFFF] border border-[#E2DFD2] rounded-xl text-xs text-amber-800 bg-amber-50/50 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>No students assigned yet. Select student(s) from the roster below or add student email manually.</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-[#FFFFFF] border border-[#E2DFD2] rounded-xl">
                    {assignedEmails.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8E4D5] text-[#4E5738] border border-[#D8D3C3] text-xs font-medium shadow-xs"
                      >
                        <Mail className="w-3 h-3 text-[#4E5738]" />
                        <span>{email}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleStudentEmail(email)}
                          className="hover:text-red-700 p-0.5 rounded-full transition-colors"
                          title="Remove email"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Custom Student Email */}
              <div>
                <label className="block text-xs font-semibold uppercase text-[#6B705C] mb-1">
                  Add Specific Student Email Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={customEmailInput}
                    onChange={(e) => setCustomEmailInput(e.target.value)}
                    placeholder="e.g. student@spark.edu or alex@spark.edu"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#E2DFD2] text-[#2C2C22] text-xs focus:outline-none focus:border-[#4E5738]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomEmail(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomEmail}
                    className="px-4 py-2 rounded-xl bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Email</span>
                  </button>
                </div>
              </div>

              {/* Select from Registered Roster */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase text-[#6B705C]">
                    Select From Student Roster ({availableStudents.length} Students)
                  </label>
                  <input
                    type="text"
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    placeholder="Search by name or email..."
                    className="px-2.5 py-1 rounded-lg bg-[#FFFFFF] border border-[#E2DFD2] text-[#2C2C22] text-xs focus:outline-none focus:border-[#4E5738]"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {availableStudents
                    .filter(
                      (s) =>
                        s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                        s.email.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                        (s.grade && s.grade.toLowerCase().includes(studentSearchTerm.toLowerCase()))
                    )
                    .map((s) => {
                      const isSelected = assignedEmails.includes(s.email.toLowerCase().trim());
                      return (
                        <div
                          key={s.id}
                          onClick={() => handleToggleStudentEmail(s.email)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#FFFFFF] border-[#4E5738] ring-1 ring-[#4E5738]'
                              : 'bg-[#FFFFFF]/60 border-[#E2DFD2] hover:bg-[#FFFFFF]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded text-[#4E5738] focus:ring-[#4E5738] cursor-pointer"
                            />
                            <div>
                              <span className="text-xs font-bold text-[#2C2C22] block">{s.name}</span>
                              <span className="text-[11px] text-[#585848] font-mono">{s.email}</span>
                            </div>
                          </div>
                          {s.grade && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#E8E4D5] text-[#4E5738] border border-[#D8D3C3]">
                              {s.grade}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: QUESTION ITEMS */}
        <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-[#E2DFD2]">
            <h3 className="text-sm font-bold uppercase text-[#4E5738] tracking-wider">
              3. Question Items ({questions.length})
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#F4F2E8] px-2.5 py-1.5 rounded-xl border border-[#E2DFD2] text-xs">
                <span className="text-[11px] font-semibold text-[#585848]">Count:</span>
                <select
                  value={aiCount}
                  onChange={(e) => setAiCount(Number(e.target.value))}
                  className="bg-transparent font-bold text-[#2C2C22] focus:outline-none text-xs cursor-pointer"
                >
                  <option value={1}>1 Question</option>
                  <option value={2}>2 Questions</option>
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleAiGenerateQuestions}
                disabled={isGeneratingAi}
                className="px-3.5 py-1.5 rounded-xl bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] font-semibold text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isGeneratingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-[#FDFCF8]" />}
                <span>Auto-Generate with Gemini AI</span>
              </button>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3.5 py-1.5 rounded-xl bg-[#F4F2E8] hover:bg-[#E8E4D5] text-xs font-semibold text-[#2C2C22] flex items-center gap-1.5 border border-[#E2DFD2] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {questions.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-[#E2DFD2] rounded-xl text-xs text-[#585848]">
                No questions added yet. Select question count and click <strong>Auto-Generate with Gemini AI</strong> or <strong>+ Add Question</strong> to begin.
              </div>
            )}

            {questions.map((q, idx) => (
              <div key={q.id || idx} className="p-4 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#4E5738]">Question #{idx + 1}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-[#FFFFFF] px-2.5 py-1 rounded-lg border border-[#E2DFD2] text-xs">
                      <Clock className="w-3.5 h-3.5 text-[#4E5738]" />
                      <span className="text-[11px] font-semibold text-[#6B705C]">Limit:</span>
                      <input
                        type="number"
                        min={10}
                        max={300}
                        step={5}
                        value={q.timeLimitSeconds || defaultQuestionTimeLimit}
                        onChange={(e) => {
                          const newQs = [...questions];
                          newQs[idx].timeLimitSeconds = Math.max(10, Number(e.target.value));
                          setQuestions(newQs);
                        }}
                        className="w-12 text-center font-bold text-[#2C2C22] bg-transparent focus:outline-none"
                      />
                      <span className="text-[10px] text-[#6B705C]">sec</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="p-1 rounded text-red-700 hover:bg-red-50 transition-colors"
                      title="Remove question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Statement Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#585848] mb-1">Question Statement</label>
                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) => {
                      const newQs = [...questions];
                      newQs[idx].text = e.target.value;
                      setQuestions(newQs);
                    }}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#FFFFFF] border border-[#E2DFD2] text-[#2C2C22] text-xs font-semibold focus:outline-none focus:border-[#4E5738]"
                    placeholder="Enter question statement here..."
                  />
                </div>

                {/* Options Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-[#585848]">
                      Multiple Choice Options & Correct Answer Selection
                    </label>
                    {(q.correctOptionIndex === undefined || q.correctOptionIndex === null || q.correctOptionIndex < 0) && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        Please select correct answer option below
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border transition-colors ${
                          q.correctOptionIndex === optIdx
                            ? 'bg-emerald-50/80 border-emerald-400'
                            : 'bg-[#FFFFFF] border-[#E2DFD2]'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`correct-${q.id || idx}`}
                          checked={q.correctOptionIndex === optIdx}
                          onChange={() => {
                            const newQs = [...questions];
                            newQs[idx].correctOptionIndex = optIdx;
                            setQuestions(newQs);
                          }}
                          className="accent-[#4E5738] shrink-0 cursor-pointer"
                        />
                        <span className="font-mono font-bold text-[11px] text-[#4E5738]">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newQs = [...questions];
                            newQs[idx].options[optIdx] = e.target.value;
                            setQuestions(newQs);
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}...`}
                          className="w-full px-2 py-1 rounded text-xs text-[#2C2C22] bg-transparent focus:outline-none"
                        />
                        {q.correctOptionIndex === optIdx && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                            Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#585848] mb-1">Answer Explanation</label>
                  <input
                    type="text"
                    value={q.explanation}
                    onChange={(e) => {
                      const newQs = [...questions];
                      newQs[idx].explanation = e.target.value;
                      setQuestions(newQs);
                    }}
                    placeholder="Provide a diagnostic explanation detailing why the selected answer is correct..."
                    className="w-full px-3 py-1.5 rounded bg-[#FFFFFF] border border-[#E2DFD2] text-xs text-[#585848] focus:outline-none focus:border-[#4E5738]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PUBLISH ASSESSMENT BUTTON */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Publish Assessment for Students</span>
        </button>
      </form>
    </div>
  );
};
