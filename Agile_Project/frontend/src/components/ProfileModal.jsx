import React from 'react';
import { X, CheckCircle, Award, Mail, GraduationCap, Building, Hash, Calendar, ShieldCheck } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, user, onSwitchUser }) {
  if (!isOpen || !user) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content p-6 sm:p-8 max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Avatar & Identity Badge (PB-02) */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-500 text-white font-extrabold text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
            {user.fullName.charAt(0)}
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">{user.fullName}</h3>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mt-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Official College Identity</span>
          </div>
        </div>

        {/* Identity Details Card */}
        <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>College Email:</span>
            </span>
            <span className="font-mono font-bold text-slate-800">{user.email}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span>Roll Number:</span>
            </span>
            <span className="font-mono font-bold text-slate-800">{user.rollNumber || 'EMP-VITAP'}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Department:</span>
            </span>
            <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">{user.department}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <span>Academic Standing:</span>
            </span>
            <span className="font-bold text-blue-700">{user.studentType || user.role}</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Reputation Score:</span>
            </span>
            <span className="font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              ⭐ {user.reputationScore} Points
            </span>
          </div>
        </div>

        {/* Demo Fast Switcher */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
            Switch Demo Account for Evaluation:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onSwitchUser('student@vitapstudent.ac.in', 'student123')}
              className="p-2 text-center rounded-xl border border-slate-200 hover:bg-blue-50 text-[11px] font-bold"
            >
              Junior Student
            </button>
            <button
              onClick={() => onSwitchUser('senior@vitapstudent.ac.in', 'student123')}
              className="p-2 text-center rounded-xl border border-slate-200 hover:bg-indigo-50 text-[11px] font-bold"
            >
              Senior Student
            </button>
            <button
              onClick={() => onSwitchUser('admin@vitap.ac.in', 'admin123')}
              className="p-2 text-center rounded-xl border border-slate-200 hover:bg-purple-50 text-[11px] font-bold"
            >
              Chief Librarian
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn btn-primary w-full mt-5 text-xs"
        >
          Close Profile
        </button>
      </div>
    </div>
  );
}
