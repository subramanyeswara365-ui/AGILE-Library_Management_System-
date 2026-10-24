import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Sparkles, Calendar, FileText, MessageSquare,
  BookmarkCheck, ShieldAlert, Bell, QrCode, LogOut, CheckCircle,
  Award, ChevronDown, User as UserIcon
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onOpenProfile,
  onOpenQrScanner,
  onLogout,
  notifications,
  unreadCount,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'catalog', label: 'Catalog & Books', icon: BookOpen },
    { id: 'ai-recommend', label: 'AI Advisor', icon: Sparkles, highlight: true },
    { id: 'seats', label: 'Reading Room', icon: Calendar },
    { id: 'papers', label: 'PYQ Papers', icon: FileText },
    { id: 'discussions', label: 'Academic Forum', icon: MessageSquare },
    { id: 'my-loans', label: 'My Loans & Fines', icon: BookmarkCheck, requiresAuth: true },
  ];

  if (user && (user.role === 'ADMIN' || user.role === 'LIBRARIAN')) {
    navItems.push({ id: 'admin', label: 'Librarian Portal', icon: ShieldAlert, admin: true });
  }

  return (
    <header className="header-glass sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & University Tag */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('catalog')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Smart LMS
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
                  VIT-AP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Academic Library & Knowledge Portal</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? item.admin
                        ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                        : 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : item.highlight
                      ? 'text-indigo-600 hover:bg-indigo-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: Scan QR, Notifications, Profile/Login */}
          <div className="flex items-center gap-2">
            {/* QR Scan Button */}
            <button
              onClick={onOpenQrScanner}
              title="Scan Book QR Code"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>

            {/* Notification Bell */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                  title="Notifications & Reminders"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-bold text-slate-900">Library Notifications</h4>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={onMarkAllNotificationsRead}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">
                          No notifications yet. You're all caught up!
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => onMarkNotificationRead(n.id)}
                            className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-50 ${
                              !n.read ? 'bg-blue-50/50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-slate-800">{n.title}</span>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1"></span>
                              )}
                            </div>
                            <p className="text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1.5 block">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile or Login Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-all border border-slate-200"
                  title="View Official Identity Profile"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.fullName.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[110px]">
                        {user.fullName.split(' ')[0]}
                      </span>
                      <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" title="Verified College Email" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 block">
                      ⭐ {user.reputationScore || 0} Rep
                    </span>
                  </div>
                </button>

                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="btn btn-primary text-xs py-2 px-3.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>College Login / OTP</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
