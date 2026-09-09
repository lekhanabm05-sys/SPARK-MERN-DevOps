import React, { useState } from 'react';
import { authenticateUser, registerStudent } from '../services/storage.js';
import { Sparkles, Shield, GraduationCap, UserCheck, Lock, Mail, User as UserIcon, BookOpen, CheckCircle2, ArrowRight, KeyRound, Sparkle, Sun, Moon } from 'lucide-react';

export const AuthPage = ({ onLoginSuccess, theme, onToggleTheme }) => {
  const [selectedRole, setSelectedRole] = useState('student');
  const [isRegistering, setIsRegistering] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(null);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regGrade, setRegGrade] = useState('Grade 11 - STEM Track');
  const [regInstitution, setRegInstitution] = useState('SPARK STEM High School');
  const [regSubjects, setRegSubjects] = useState(['Computer Science', 'Mathematics']);
  const [regError, setRegError] = useState(null);
  const [regSuccessMsg, setRegSuccessMsg] = useState(null);

  // Quick preset helper
  const handlePresetLogin = (role) => {
    setSelectedRole(role);
    setIsRegistering(false);
    setLoginError(null);

    if (role === 'admin') {
      setLoginEmail('lekhana@gmail.com');
      setLoginPassword('lekhana');
    } else if (role === 'teacher') {
      setLoginEmail('teacher@spark.edu');
      setLoginPassword('teacher123');
    } else {
      setLoginEmail('student@spark.edu');
      setLoginPassword('student123');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail || !loginPassword) {
      setLoginError('Please provide both email and password.');
      return;
    }

    const res = authenticateUser(loginEmail, loginPassword);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setLoginError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccessMsg(null);

    if (!regName || !regEmail || !regPassword) {
      setRegError('Please complete all required fields.');
      return;
    }

    const payload = {
      name: regName,
      email: regEmail,
      password: regPassword,
      grade: regGrade,
      institution: regInstitution,
      preferredSubjects: regSubjects
    };

    const res = registerStudent(payload);
    if (res.success && res.user) {
      setRegSuccessMsg('Registration successful! Logging you into SPARK...');
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 1000);
    } else {
      setRegError(res.error || 'Registration failed.');
    }
  };

  const toggleSubject = (sub) => {
    if (regSubjects.includes(sub)) {
      setRegSubjects(regSubjects.filter(s => s !== sub));
    } else {
      setRegSubjects([...regSubjects, sub]);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#2C2C22] flex flex-col justify-between selection:bg-[#4E5738] selection:text-[#FDFCF8] relative">
      {/* Top Right Theme Toggle */}
      {onToggleTheme && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="p-2.5 rounded-xl bg-[#F4F2E8] hover:bg-[#EAE7DA] text-[#4E5738] border border-[#E2DFD2] shadow-sm flex items-center gap-2 text-xs font-semibold transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline text-[#2C2C22]">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#4E5738]" />
                <span className="hidden sm:inline text-[#2C2C22]">Dark Mode</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Top Banner */}
      <header className="relative z-10 pt-10 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8E4D5] border border-[#D8D3C3] text-[#4E5738] text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#4E5738]" />
          Smart Assessment & Real-time Knowledge Analytics
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-[#2C2C22] mb-3">
          SPARK <span className="text-[#4E5738]">Assessment Platform</span>
        </h1>
        <p className="text-sm sm:text-base text-[#585848] max-w-2xl mx-auto font-medium">
          Smart Diagnostic Testing & Knowledge Prediction System for Students, Teachers, and Administrators.
        </p>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-4 py-8 my-auto">
        {/* Auth Card Container */}
        <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl shadow-sm overflow-hidden">
          {/* Header Role Selector Tabs */}
          <div className="grid grid-cols-3 border-b border-[#E2DFD2] bg-[#F4F2E8] p-1.5 gap-1">
            <button
              onClick={() => {
                setSelectedRole('student');
                setLoginError(null);
              }}
              className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                selectedRole === 'student'
                  ? 'bg-[#4E5738] text-[#FDFCF8] shadow-sm'
                  : 'text-[#585848] hover:text-[#2C2C22] hover:bg-[#E8E4D5]'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student</span>
            </button>

            <button
              onClick={() => {
                setSelectedRole('teacher');
                setIsRegistering(false);
                setLoginError(null);
              }}
              className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                selectedRole === 'teacher'
                  ? 'bg-[#4E5738] text-[#FDFCF8] shadow-sm'
                  : 'text-[#585848] hover:text-[#2C2C22] hover:bg-[#E8E4D5]'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Teacher</span>
            </button>

            <button
              onClick={() => {
                setSelectedRole('admin');
                setIsRegistering(false);
                setLoginError(null);
              }}
              className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                selectedRole === 'admin'
                  ? 'bg-[#4E5738] text-[#FDFCF8] shadow-sm'
                  : 'text-[#585848] hover:text-[#2C2C22] hover:bg-[#E8E4D5]'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* Student Registration Toggle Header */}
            {selectedRole === 'student' && (
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#ECE9DE]">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#2C2C22]">
                    {isRegistering ? 'Student Access Registration' : 'Student Portal Sign In'}
                  </h2>
                  <p className="text-xs text-[#585848] mt-0.5">
                    {isRegistering
                      ? 'Register for a new student account to access smart predictive analytics.'
                      : 'Enter your credentials to access diagnostic quizzes & AI pathway.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setLoginError(null);
                    setRegError(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#F4F2E8] text-[#4E5738] hover:bg-[#E8E4D5] border border-[#D8D3C3] transition-colors"
                >
                  {isRegistering ? 'Already registered? Sign In' : '+ Register New Student'}
                </button>
              </div>
            )}

            {/* Non-student Header */}
            {selectedRole !== 'student' && (
              <div className="mb-6 pb-4 border-b border-[#ECE9DE]">
                <h2 className="text-xl font-serif font-bold text-[#2C2C22]">
                  {selectedRole === 'admin' ? 'Admin Control Center' : 'Teacher Analytics Portal'}
                </h2>
                <p className="text-xs text-[#585848] mt-0.5">
                  {selectedRole === 'admin'
                    ? 'Administrator authentication for system governance, Lekhana user management & audit logs.'
                    : 'Educator authentication for class performance matrix and assessment generation.'}
                </p>
              </div>
            )}

            {/* LOGIN FORM */}
            {!isRegistering ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                    {loginError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#585848] mb-1.5">
                    {selectedRole === 'admin' ? 'Admin Email Address' : selectedRole === 'teacher' ? 'Educator Email' : 'Student Email'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8C7A]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder={selectedRole === 'admin' ? 'lekhana@gmail.com' : 'user@spark.edu'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FDFCF8] border border-[#E2DFD2] text-[#2C2C22] placeholder-[#8C8C7A] focus:outline-none focus:border-[#4E5738] focus:ring-1 focus:ring-[#4E5738] text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#585848] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8C7A]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FDFCF8] border border-[#E2DFD2] text-[#2C2C22] placeholder-[#8C8C7A] focus:outline-none focus:border-[#4E5738] focus:ring-1 focus:ring-[#4E5738] text-sm"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] shadow-sm flex items-center justify-center gap-2 transition-all duration-200 mt-2"
                >
                  <span>Sign In as {selectedRole.toUpperCase()}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* STUDENT REGISTRATION FORM */
              <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                {regError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
                    {regError}
                  </div>
                )}
                {regSuccessMsg && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {regSuccessMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#585848] mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8C7A]">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Samantha Vance"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FDFCF8] border border-[#E2DFD2] text-[#2C2C22] placeholder-[#8C8C7A] focus:outline-none focus:border-[#4E5738] text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#585848] mb-1.5">
                      Student Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8C7A]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="samantha@school.edu"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FDFCF8] border border-[#E2DFD2] text-[#2C2C22] placeholder-[#8C8C7A] focus:outline-none focus:border-[#4E5738] text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#585848] mb-1.5">
                      Create Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8C7A]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FDFCF8] border border-[#E2DFD2] text-[#2C2C22] placeholder-[#8C8C7A] focus:outline-none focus:border-[#4E5738] text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#585848] mb-1.5">
                      Academic Grade / Track
                    </label>
                    <select
                      value={regGrade}
                      onChange={(e) => setRegGrade(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FDFCF8] border border-[#E2DFD2] text-[#2C2C22] focus:outline-none focus:border-[#4E5738] text-sm"
                    >
                      <option value="Grade 10 - Honors STEM">Grade 10 - Honors STEM</option>
                      <option value="Grade 11 - STEM Track">Grade 11 - STEM Track</option>
                      <option value="Grade 12 - Advanced CS Track">Grade 12 - Advanced CS Track</option>
                      <option value="University Undergraduate">University Undergraduate</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#585848] mb-1.5">
                    School / Institution
                  </label>
                  <input
                    type="text"
                    value={regInstitution}
                    onChange={(e) => setRegInstitution(e.target.value)}
                    placeholder="SPARK Central STEM Academy"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FDFCF8] border border-[#E2DFD2] text-[#2C2C22] placeholder-[#8C8C7A] focus:outline-none focus:border-[#4E5738] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#585848] mb-1.5">
                    Focus Subjects for AI Prediction
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Computer Science', 'Mathematics', 'Artificial Intelligence', 'Physics'].map((subject) => {
                      const isSelected = regSubjects.includes(subject);
                      return (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => toggleSubject(subject)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                            isSelected
                              ? 'bg-[#4E5738] text-[#FDFCF8] border-[#4E5738]'
                              : 'bg-[#F4F2E8] text-[#585848] border-[#E2DFD2] hover:border-[#D0CBBA]'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{subject}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#4E5738] hover:bg-[#3E452B] font-semibold text-sm text-[#FDFCF8] shadow-sm flex items-center justify-center gap-2 transition-all duration-200"
                >
                  <span>Submit Registration & Start Learning</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 text-center text-xs text-[#6B705C] border-t border-[#E2DFD2] bg-[#F4F2E8]">
        SPARK Smart Assessment & Knowledge Prediction Engine
      </footer>
    </div>
  );
};
