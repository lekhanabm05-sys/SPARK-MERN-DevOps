import React, { useState, useMemo } from 'react';
import { Users, GraduationCap, CheckCircle2, Clock, Search, Shield, Eye, X, Award, FileCheck, Calendar, BarChart2, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { getQuizAttempts } from '../../services/storage.js';

export const StudentRoster = ({ students, attempts = [], quizzes = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Combine prop attempts with localStorage attempts for live updates
  const allAttempts = useMemo(() => {
    const stored = getQuizAttempts();
    const map = new Map();
    [...stored, ...attempts].forEach((att) => {
      if (att && att.id) map.set(att.id, att);
    });
    return Array.from(map.values());
  }, [attempts]);

  // Helper to compute attempts for a given student
  const getStudentAttempts = (student) => {
    if (!student) return [];
    return allAttempts.filter((att) => {
      const matchEmail = att.studentEmail && student.email && att.studentEmail.toLowerCase().trim() === student.email.toLowerCase().trim();
      const matchId = att.studentId && student.id && att.studentId === student.id;
      const matchName = att.studentName && student.name && att.studentName.toLowerCase().trim() === student.name.toLowerCase().trim();
      return matchEmail || matchId || matchName;
    });
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.grade && s.grade.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Attempts for currently selected modal student
  const selectedStudentAttempts = useMemo(() => {
    return getStudentAttempts(selectedStudent);
  }, [selectedStudent, allAttempts]);

  const selectedStudentAvgScore = useMemo(() => {
    if (selectedStudentAttempts.length === 0) return 0;
    const sum = selectedStudentAttempts.reduce((acc, curr) => acc + (curr.scorePercentage || 0), 0);
    return Math.round(sum / selectedStudentAttempts.length);
  }, [selectedStudentAttempts]);

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div className="bg-[#F4F2E8] border border-[#E2DFD2] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8E4D5] text-[#4E5738] text-xs font-semibold mb-2 border border-[#D8D3C3]">
            <Users className="w-3.5 h-3.5 text-[#4E5738]" /> Student Performance & Roster Tracking
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#2C2C22]">Student Roster ({students.length})</h2>
          <p className="text-xs text-[#585848] mt-1 font-medium">
            Track student registration status, academic tracks, completed assessment records, and real-time performance models.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student name or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#E2DFD2] text-[#2C2C22] text-xs placeholder-[#6B705C] focus:outline-none focus:border-[#4E5738]"
          />
          <Search className="w-4 h-4 text-[#6B705C] absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F2E8] text-[#4E5738] font-bold uppercase border-b border-[#E2DFD2]">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Academic Track</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4">Completed Assessments</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DFD2] text-[#2C2C22]">
              {filteredStudents.map((st) => {
                const stAttempts = getStudentAttempts(st);
                const stAvg = stAttempts.length > 0
                  ? Math.round(stAttempts.reduce((acc, c) => acc + (c.scorePercentage || 0), 0) / stAttempts.length)
                  : 0;

                return (
                  <tr key={st.id} className="hover:bg-[#F4F2E8]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#E8E4D5] border border-[#D8D3C3] text-[#4E5738] flex items-center justify-center shrink-0 shadow-xs" title="Student Symbol">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-[#2C2C22] text-sm">{st.name}</div>
                          <div className="text-[11px] text-[#585848] font-mono">{st.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-medium">
                      <span className="px-2.5 py-1 rounded-md bg-[#F4F2E8] border border-[#E2DFD2] font-mono text-[11px] text-[#4E5738]">
                        {st.grade || 'Grade 11 - STEM'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          st.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${st.status === 'active' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                        {st.status === 'active' ? 'Active Access' : 'Pending Approval'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {stAttempts.length > 0 ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F4F2E8] border border-[#E2DFD2] text-[#2C2C22]">
                          <FileCheck className="w-3.5 h-3.5 text-[#4E5738]" />
                          <span className="font-bold">{stAttempts.length} Completed</span>
                          <span className="text-[#6B705C] font-mono">({stAvg}% Avg)</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#6B705C] italic">None completed yet</span>
                      )}
                    </td>

                    <td className="px-6 py-4 font-mono text-[#585848]">{st.joinedDate}</td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedStudent(st)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] font-semibold text-xs inline-flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-[#2C2C22]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-3xl max-w-2xl w-full p-6 shadow-xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#ECE9DE] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#E8E4D5] border border-[#D8D3C3] text-[#4E5738] flex items-center justify-center shrink-0 shadow-xs" title="Student Symbol">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-serif font-bold text-[#2C2C22]">{selectedStudent.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedStudent.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {selectedStudent.status === 'active' ? 'Active' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#585848]">{selectedStudent.email}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-xl bg-[#F4F2E8] hover:bg-[#E8E4D5] text-[#585848] hover:text-[#2C2C22] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] text-center">
                <span className="text-[10px] font-bold uppercase text-[#585848] block">Academic Grade</span>
                <span className="text-xs font-bold text-[#2C2C22] block mt-1">{selectedStudent.grade || 'Grade 11 STEM'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] text-center">
                <span className="text-[10px] font-bold uppercase text-[#585848] block">Institution</span>
                <span className="text-xs font-bold text-[#2C2C22] block mt-1 line-clamp-1">{selectedStudent.institution || 'SPARK STEM Academy'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] text-center">
                <span className="text-[10px] font-bold uppercase text-[#585848] block">Tests Completed</span>
                <span className="text-sm font-serif font-bold text-[#4E5738] block mt-0.5">{selectedStudentAttempts.length} Assessments</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] text-center">
                <span className="text-[10px] font-bold uppercase text-[#585848] block">Average Score</span>
                <span className="text-sm font-serif font-bold text-[#4E5738] block mt-0.5">{selectedStudentAttempts.length > 0 ? `${selectedStudentAvgScore}%` : 'N/A'}</span>
              </div>
            </div>

            {/* COMPLETED ASSESSMENTS LIST SECTION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#ECE9DE]">
                <h4 className="text-sm font-bold uppercase text-[#4E5738] tracking-wider flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#4E5738]" />
                  Completed Assessments ({selectedStudentAttempts.length})
                </h4>
                {selectedStudentAttempts.length > 0 && (
                  <span className="text-xs font-semibold text-[#6B705C]">
                    Avg Proficiency: <strong className="text-[#2C2C22]">{selectedStudentAvgScore}%</strong>
                  </span>
                )}
              </div>

              {selectedStudentAttempts.length === 0 ? (
                <div className="p-6 text-center bg-[#F4F2E8]/60 border border-[#E2DFD2] rounded-2xl space-y-2">
                  <AlertCircle className="w-8 h-8 text-[#6B705C] mx-auto opacity-70" />
                  <p className="text-xs font-bold text-[#2C2C22]">No completed assessments recorded yet.</p>
                  <p className="text-[11px] text-[#585848] max-w-sm mx-auto">
                    When {selectedStudent.name} submits any diagnostic assessment or assigned drill, their detailed score log and diagnostic response analysis will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {selectedStudentAttempts.map((att) => {
                    const score = att.scorePercentage ?? 0;
                    const isHigh = score >= 80;
                    const isMid = score >= 60 && score < 80;

                    return (
                      <div
                        key={att.id}
                        className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2DFD2] shadow-xs space-y-2 hover:border-[#4E5738] transition-all"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E8E4D5] text-[#4E5738] border border-[#D8D3C3]">
                                {att.subject || 'General'}
                              </span>
                              <span className="text-[10px] font-mono text-[#6B705C]">
                                Completed: {att.completedAt || 'Recently'}
                              </span>
                            </div>
                            <h5 className="text-sm font-serif font-bold text-[#2C2C22] mt-1">{att.quizTitle}</h5>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                            {att.autoSubmitted && (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-red-100 text-red-800 border border-red-200">
                                ⚠️ Tab Switch Auto-Submit
                              </span>
                            )}
                            <span
                              className={`px-3 py-1 rounded-xl font-mono text-xs font-bold border ${
                                isHigh
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : isMid
                                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                                  : 'bg-rose-100 text-rose-800 border-rose-200'
                              }`}
                            >
                              Score: {score}%
                            </span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-[#E2DFD2] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isHigh ? 'bg-emerald-600' : isMid ? 'bg-amber-600' : 'bg-rose-600'
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#585848] font-mono pt-1">
                          <span>
                            Correct Answers: <strong>{att.correctAnswers ?? '-'} / {att.totalQuestions ?? '-'}</strong>
                          </span>
                          {att.topicMasteryMap && Object.keys(att.topicMasteryMap).length > 0 && (
                            <span className="text-[#4E5738] font-semibold">
                              Topic: {Object.keys(att.topicMasteryMap)[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AI Predictive Insight */}
            <div className="p-4 rounded-2xl bg-[#E8E4D5] border border-[#D8D3C3] space-y-1">
              <strong className="text-xs font-bold uppercase text-[#4E5738] tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#4E5738]" /> AI Diagnostic Performance Profile
              </strong>
              <p className="text-xs text-[#2C2C22] leading-relaxed">
                {selectedStudentAttempts.length > 0 ? (
                  <>
                    {selectedStudent.name} has completed <strong>{selectedStudentAttempts.length} assessment(s)</strong> with a current overall score average of <strong>{selectedStudentAvgScore}%</strong>.{' '}
                    {selectedStudentAvgScore >= 80
                      ? 'Demonstrates outstanding conceptual mastery and consistent problem-solving speed. Highly prepared for competitive exam tracks.'
                      : selectedStudentAvgScore >= 60
                      ? 'Shows solid understanding of core principles with room for speed optimization on complex multi-step problems.'
                      : 'Requires targeted micro-drills and concept review to address fundamental gaps in recent topics.'}
                  </>
                ) : (
                  <>
                    Baseline profile for {selectedStudent.name}. Ready to receive initial diagnostic quiz assignments. Real-time predictive model will update immediately upon test completion.
                  </>
                )}
              </p>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-[#ECE9DE] text-right">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 rounded-xl bg-[#F4F2E8] hover:bg-[#E8E4D5] text-[#2C2C22] font-semibold text-xs transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

