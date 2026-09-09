import React, { useState } from 'react';
import { saveUsers, getActivityLogs, addActivityLog } from '../../services/storage.js';
import { Shield, Users, Activity, CheckCircle2, XCircle, Search, RefreshCw, Key, Cpu, Sparkles, AlertTriangle, FileText, UserPlus, Trash2, GraduationCap, UserCheck, X, Plus } from 'lucide-react';

export const AdminDashboard = ({
  currentUser,
  users,
  onUpdateUsers,
  activeAdminTab,
  setActiveAdminTab
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [logs, setLogs] = useState(getActivityLogs());

  // Add Teacher Form State
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('teacher123');
  const [teacherSubject, setTeacherSubject] = useState('Computer Science');
  const [teacherDepartment, setTeacherDepartment] = useState('Faculty of Science & Technology');
  const [addTeacherSuccessMsg, setAddTeacherSuccessMsg] = useState(null);

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleToggleStatus = (targetUser) => {
    // Prevent suspending Lekhana admin root
    if (targetUser.email.toLowerCase() === 'lekhana@gmail.com') {
      alert('Cannot suspend the root administrator account Lekhana.');
      return;
    }

    const newStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    const updated = users.map((u) => {
      if (u.id === targetUser.id) {
        return { ...u, status: newStatus };
      }
      return u;
    });

    onUpdateUsers(updated);
    saveUsers(updated);

    addActivityLog(
      currentUser.email,
      currentUser.name,
      'admin',
      'Updated User Status',
      'admin',
      `Lekhana changed account status for ${targetUser.name} (${targetUser.email}) to ${newStatus}.`
    );
    setLogs(getActivityLogs());
  };

  const handleApproveStudent = (targetUser) => {
    const updated = users.map((u) => {
      if (u.id === targetUser.id) {
        return { ...u, status: 'active', registrationApproved: true };
      }
      return u;
    });

    onUpdateUsers(updated);
    saveUsers(updated);

    addActivityLog(
      currentUser.email,
      currentUser.name,
      'admin',
      'Approved Registration',
      'registration',
      `Lekhana approved student access registration for ${targetUser.name}.`
    );
    setLogs(getActivityLogs());
  };

  const handleAddTeacherSubmit = (e) => {
    e.preventDefault();
    if (!teacherName.trim() || !teacherEmail.trim()) {
      alert('Please enter both name and email for the new teacher.');
      return;
    }

    // Check if email already exists
    const emailExists = users.some(u => u.email.toLowerCase() === teacherEmail.trim().toLowerCase());
    if (emailExists) {
      alert(`A user with email ${teacherEmail} already exists.`);
      return;
    }

    const newTeacher = {
      id: `teacher-${Date.now()}`,
      name: teacherName.trim(),
      email: teacherEmail.trim().toLowerCase(),
      role: 'teacher',
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      subjectSpecialty: teacherSubject.trim() || 'Computer Science',
      department: teacherDepartment.trim() || 'Faculty of Science & Technology',
      registrationApproved: true
    };

    const updatedUsers = [...users, newTeacher];
    onUpdateUsers(updatedUsers);
    saveUsers(updatedUsers);

    addActivityLog(
      currentUser.email,
      currentUser.name,
      'admin',
      'Created Teacher Account',
      'admin',
      `Admin Lekhana added new educator account for ${newTeacher.name} (${newTeacher.email}) in ${newTeacher.subjectSpecialty}.`
    );
    setLogs(getActivityLogs());

    setAddTeacherSuccessMsg(`Successfully created educator account for ${newTeacher.name}!`);
    setTimeout(() => setAddTeacherSuccessMsg(null), 4000);

    // Reset Form
    setTeacherName('');
    setTeacherEmail('');
    setTeacherPassword('teacher123');
    setIsAddTeacherOpen(false);
  };

  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalTeachers = users.filter((u) => u.role === 'teacher').length;
  const pendingRegistrations = users.filter((u) => u.status === 'pending' || !u.registrationApproved).length;

  return (
    <div className="space-y-6">
      {/* Success Notification Banner */}
      {addTeacherSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{addTeacherSuccessMsg}</span>
          </div>
          <button onClick={() => setAddTeacherSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeAdminTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Admin Hero Header */}
          <div className="bg-[#F4F2E8] border border-[#E2DFD2] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8E4D5] border border-[#D8D3C3] text-[#4E5738] text-xs font-semibold">
                  <Shield className="w-3.5 h-3.5 text-[#4E5738]" /> Platform Governance & System Control
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2C22] tracking-tight">
                  Welcome back, <span className="text-[#4E5738]">{currentUser.name}</span>!
                </h1>
                <p className="text-[#585848] text-sm max-w-xl font-medium">
                  Root Administrator Control Center for SPARK Smart Assessment Engine. System status operational & green.
                </p>
              </div>
            </div>
          </div>

          {/* KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-[#6B705C] tracking-wider">Total Registered Users</span>
                <div className="p-2 rounded-xl bg-[#F4F2E8] text-[#4E5738]">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-serif font-bold text-[#2C2C22]">{users.length}</div>
              <p className="text-[11px] text-[#585848] mt-2 font-mono">{totalStudents} Students &bull; {totalTeachers} Teachers</p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-[#6B705C] tracking-wider">Pending Registrations</span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-800">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-serif font-bold text-amber-800">{pendingRegistrations}</div>
              <p className="text-[11px] text-[#585848] mt-2">New student registration requests</p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-[#6B705C] tracking-wider">Gemini AI Model Status</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-serif font-bold text-emerald-800">gemini-3.6-flash</div>
              <p className="text-[11px] text-[#585848] mt-2">Server-Side Integration Active</p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-[#6B705C] tracking-wider">System Health</span>
                <div className="p-2 rounded-xl bg-[#F4F2E8] text-[#4E5738]">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-serif font-bold text-[#4E5738]">99.9% Uptime</div>
              <p className="text-[11px] text-[#585848] mt-2">Port 3000 Container Ingress Healthy</p>
            </div>
          </div>

          {/* System Overview Operational Summary */}
          <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#2C2C22] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#4E5738]" /> System Operational Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] space-y-1.5">
                <div className="font-bold text-[#2C2C22]">User Distribution</div>
                <p className="text-[#585848]">{totalStudents} enrolled students, {totalTeachers} active teachers, and 1 root administrator.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] space-y-1.5">
                <div className="font-bold text-[#2C2C22]">Security & Proctoring</div>
                <p className="text-[#585848]">Camera proctoring framework and session audit logs actively enabled across all test runs.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] space-y-1.5">
                <div className="font-bold text-[#2C2C22]">AI Intelligence Engine</div>
                <p className="text-[#585848]">Server-side Gemini 3.6 Flash model initialized for adaptive question generation.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeAdminTab === 'users' && (
        <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#2C2C22] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#4E5738]" /> Platform User Management
              </h3>
              <p className="text-xs text-[#585848] mt-0.5">
                Review student access registrations, create educator accounts, activate or suspend users.
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsAddTeacherOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Teacher</span>
              </button>

              <div className="relative flex-1 sm:flex-initial">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search user..."
                  className="w-full sm:w-48 pl-8 pr-3 py-1.5 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] text-xs text-[#2C2C22] placeholder-[#6B705C] focus:outline-none focus:border-[#4E5738]"
                />
                <Search className="w-3.5 h-3.5 text-[#6B705C] absolute left-2.5 top-2.5" />
              </div>

              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] text-xs text-[#2C2C22] focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] text-xs text-[#2C2C22] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Add Teacher Form Overlay Modal */}
          {isAddTeacherOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-[#FDFCF8] border border-[#E2DFD2] rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2DFD2]">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#E8E4D5] text-[#4E5738]">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-serif font-bold text-[#2C2C22]">Add New Educator</h4>
                      <p className="text-[11px] text-[#585848]">Create a verified teacher account for SPARK</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAddTeacherOpen(false)}
                    className="p-1 rounded-lg text-[#6B705C] hover:bg-[#F4F2E8] hover:text-[#2C2C22]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddTeacherSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-[#2C2C22] mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      placeholder="e.g. Dr. Sarah Jenkins"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] text-[#2C2C22] focus:outline-none focus:border-[#4E5738]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#2C2C22] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      placeholder="e.g. sarah.jenkins@school.edu"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] text-[#2C2C22] focus:outline-none focus:border-[#4E5738]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#2C2C22] mb-1">Subject Specialty</label>
                      <select
                        value={teacherSubject}
                        onChange={(e) => setTeacherSubject(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] text-[#2C2C22] focus:outline-none"
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Physics">Physics</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Biology">Biology</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#2C2C22] mb-1">Initial Password</label>
                      <input
                        type="text"
                        value={teacherPassword}
                        onChange={(e) => setTeacherPassword(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] text-[#2C2C22] font-mono focus:outline-none focus:border-[#4E5738]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#2C2C22] mb-1">Department / Institution</label>
                    <input
                      type="text"
                      value={teacherDepartment}
                      onChange={(e) => setTeacherDepartment(e.target.value)}
                      placeholder="e.g. Department of Computer Science"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] text-[#2C2C22] focus:outline-none focus:border-[#4E5738]"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E2DFD2]">
                    <button
                      type="button"
                      onClick={() => setIsAddTeacherOpen(false)}
                      className="px-4 py-2 rounded-xl bg-[#F4F2E8] hover:bg-[#E8E4D5] text-[#2C2C22] font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] font-semibold flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Educator</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-[#E2DFD2]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F2E8] text-[#4E5738] font-bold uppercase border-b border-[#E2DFD2]">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Grade / Info</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE9DE] text-[#2C2C22]">
                {filteredUsers.map((u) => {
                  const isLekhanaRoot = u.email.toLowerCase() === 'lekhana@gmail.com';

                  return (
                    <tr key={u.id} className="hover:bg-[#F4F2E8]/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {u.role === 'admin' ? (
                            <div className="w-8 h-8 rounded-full bg-[#E8E4D5] border border-[#D8D3C3] text-[#4E5738] flex items-center justify-center shrink-0 shadow-xs" title="Admin Symbol">
                              <Shield className="w-4 h-4" />
                            </div>
                          ) : u.role === 'teacher' ? (
                            <div className="w-8 h-8 rounded-full bg-[#E8E4D5] border border-[#D8D3C3] text-[#4E5738] flex items-center justify-center shrink-0 shadow-xs" title="Teacher Symbol">
                              <UserCheck className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#E8E4D5] border border-[#D8D3C3] text-[#4E5738] flex items-center justify-center shrink-0 shadow-xs" title="Student Symbol">
                              <GraduationCap className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-[#2C2C22] flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isLekhanaRoot && (
                                <span className="text-[10px] bg-[#E8E4D5] text-[#4E5738] px-1.5 py-0.2 rounded border border-[#D8D3C3] font-semibold">
                                  Root Admin
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#585848] font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`uppercase text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                            u.role === 'admin'
                              ? 'bg-[#E8E4D5] text-[#4E5738]'
                              : u.role === 'teacher'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-[11px] text-[#585848]">
                        {u.grade || u.subjectSpecialty || u.department || 'N/A'}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            u.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : u.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right space-x-2">
                        {u.status === 'pending' && (
                          <button
                            onClick={() => handleApproveStudent(u)}
                            className="px-2.5 py-1 rounded-lg bg-[#4E5738] hover:bg-[#3E452B] text-[#FDFCF8] font-semibold text-[11px]"
                          >
                            Approve Access
                          </button>
                        )}

                        {!isLekhanaRoot && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] ${
                              u.status === 'active'
                                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeAdminTab === 'logs' && (
        <div className="bg-[#FFFFFF] border border-[#E2DFD2] rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-serif font-bold text-[#2C2C22] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#4E5738]" /> Platform Activity & Audit Logs
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl bg-[#F4F2E8] border border-[#E2DFD2] flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#2C2C22]">{log.userName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#E8E4D5] text-[#4E5738]">
                      {log.userEmail}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#E8E4D5] text-[#4E5738]">
                      {log.role}
                    </span>
                  </div>
                  <p className="text-xs text-[#585848]">{log.details}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono text-[#6B705C]">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

