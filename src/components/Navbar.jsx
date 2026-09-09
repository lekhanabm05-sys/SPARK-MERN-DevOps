import React, { useEffect, useState } from 'react';
import { Sparkles, LogOut, Shield, GraduationCap, UserCheck, Database, Server, Layers, Cpu, Sun, Moon } from 'lucide-react';
import { checkMernStatus } from '../services/storage.js';

export const Navbar = ({ user, onLogout, activeTab, setActiveTab, theme, onToggleTheme }) => {
  const [mernInfo, setMernInfo] = useState(null);

  useEffect(() => {
    checkMernStatus().then(status => {
      setMernInfo({
        mongoConnected: status.mongoConnected,
        databaseName: status.databaseName
      });
    });
  }, []);

  const getRoleBadge = () => {
    switch (user.role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EFECE1] text-[#4E5738] border border-[#DCD7C8]">
            <Shield className="w-3 h-3 text-[#4E5738]" /> Admin (Lekhana)
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EFECE1] text-[#4E5738] border border-[#DCD7C8]">
            <UserCheck className="w-3 h-3 text-[#4E5738]" /> Educator
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EFECE1] text-[#4E5738] border border-[#DCD7C8]">
            <GraduationCap className="w-3 h-3 text-[#4E5738]" /> Student
          </span>
        );
    }
  };

  const navItems = () => {
    if (user.role === 'student') {
      return [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'assessments', label: 'Smart Assessments' },
        { id: 'analytics', label: 'Knowledge Predictions' },
        { id: 'pathway', label: 'Learning Pathway' },
      ];
    } else if (user.role === 'teacher') {
      return [
        { id: 'dashboard', label: 'Class Analytics' },
        { id: 'creator', label: 'Assessment Creator' },
        { id: 'roster', label: 'Student Roster' },
      ];
    } else {
      return [
        { id: 'dashboard', label: 'System Overview' },
        { id: 'users', label: 'User Management' },
        { id: 'logs', label: 'Activity Logs' },
      ];
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F4F2E8] border-b border-[#E2DFD2] text-[#2C2C22] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-[#4E5738] text-[#FDFCF8] flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl tracking-tight text-[#2C2C22]">
                  SPARK
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#E8E4D5] text-[#4E5738] border border-[#D8D3C3] font-semibold">
                  SMART ASSESSMENTS
                </span>
              </div>
              <p className="text-[10px] text-[#6B705C] hidden sm:block font-medium">
                Smart Assessment & Knowledge Prediction Engine
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems().map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  activeTab === item.id
                    ? 'bg-[#4E5738] text-[#FDFCF8] shadow-sm'
                    : 'text-[#585848] hover:text-[#2C2C22] hover:bg-[#E8E4D5]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right User Bar */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EAE7DA] text-[#585848] text-[11px] font-medium border border-[#DCD7C8]">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Smart Assessment Engine</span>
            </div>

            <div className="h-5 w-px bg-[#DCD7C8] hidden sm:block" />

            <div className="flex items-center gap-2.5">
              {user.role === 'admin' ? (
                <div className="w-8 h-8 rounded-full bg-[#E8E4D5] border border-[#D8D3C3] text-[#4E5738] flex items-center justify-center shrink-0 shadow-xs" title="Admin Symbol">
                  <Shield className="w-4 h-4" />
                </div>
              ) : user.role === 'teacher' ? (
                <div className="w-8 h-8 rounded-full bg-[#E8E4D5] border border-[#D8D3C3] text-[#4E5738] flex items-center justify-center shrink-0 shadow-xs" title="Teacher Symbol">
                  <UserCheck className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#E8E4D5] border border-[#D8D3C3] text-[#4E5738] flex items-center justify-center shrink-0 shadow-xs" title="Student Symbol">
                  <GraduationCap className="w-4 h-4" />
                </div>
              )}
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-[#2C2C22] leading-tight">{user.name}</div>
                <div className="mt-0.5">{getRoleBadge()}</div>
              </div>
            </div>

            {/* Theme Mode Toggle Button */}
            <button
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2 text-[#585848] hover:text-[#2C2C22] hover:bg-[#E2DFD2] rounded-lg transition-colors flex items-center justify-center border border-[#D8D3C3]"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#4E5738]" />
              )}
            </button>

            <button
              onClick={onLogout}
              title="Sign Out"
              className="ml-1 px-3 py-1.5 text-[#585848] hover:text-stone-900 hover:bg-[#E2DFD2] rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold border border-[#D8D3C3]"
            >
              <LogOut className="w-3.5 h-3.5 text-[#585848]" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Subnav */}
      <div className="md:hidden border-t border-[#E2DFD2] bg-[#FDFCF8] px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {navItems().map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap font-semibold ${
              activeTab === item.id
                ? 'bg-[#4E5738] text-[#FDFCF8]'
                : 'text-[#585848] bg-[#F4F2E8] border border-[#E2DFD2]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};

