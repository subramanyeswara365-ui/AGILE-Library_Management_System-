import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import QrScannerModal from './components/QrScannerModal';
import CatalogTab from './components/CatalogTab';
import AiRecommendationTab from './components/AiRecommendationTab';
import SeatReservationTab from './components/SeatReservationTab';
import QuestionPaperTab from './components/QuestionPaperTab';
import DiscussionForumTab from './components/DiscussionForumTab';
import MyLoansTab from './components/MyLoansTab';
import AdminPortalTab from './components/AdminPortalTab';
import { api } from './api/client';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('catalog');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [aiPresetQuery, setAiPresetQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check current session on load
  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const me = await api.getMe();
      setUser(me);
      fetchNotifications();
    } catch (err) {
      // Not logged in or guest
      setUser(null);
    }
  };

  const fetchNotifications = async () => {
    try {
      const list = await api.getNotifications();
      setNotifications(list);
      const unread = await api.getUnreadCount();
      setUnreadCount(unread.unreadCount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
      if (activeTab === 'my-loans' || activeTab === 'admin') {
        setActiveTab('catalog');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    fetchNotifications();
  };

  const handleSwitchUser = async (demoEmail, demoPass) => {
    try {
      const logged = await api.login(demoEmail, demoPass);
      setUser(logged);
      setIsProfileModalOpen(false);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerAiQuery = (query) => {
    setAiPresetQuery(query);
    setActiveTab('ai-recommend');
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navbar (PB-01, PB-02, PB-16) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
        onLogout={handleLogout}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'catalog' && (
          <CatalogTab
            user={user}
            onBorrowSuccess={fetchNotifications}
            onOpenQrScanner={() => setIsQrScannerOpen(true)}
            onTriggerAiQuery={handleTriggerAiQuery}
          />
        )}

        {activeTab === 'ai-recommend' && (
          <AiRecommendationTab
            user={user}
            defaultQuery={aiPresetQuery}
            onBorrowSuccess={fetchNotifications}
          />
        )}

        {activeTab === 'seats' && (
          <SeatReservationTab user={user} />
        )}

        {activeTab === 'papers' && (
          <QuestionPaperTab user={user} />
        )}

        {activeTab === 'discussions' && (
          <DiscussionForumTab user={user} />
        )}

        {activeTab === 'my-loans' && (
          <MyLoansTab user={user} onLoanAction={fetchNotifications} />
        )}

        {activeTab === 'admin' && (
          <AdminPortalTab user={user} onDataChanged={fetchNotifications} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-4 font-semibold text-slate-600">
            <span>Spring Boot 3 + MySQL ORM (Hibernate)</span>
            <span>•</span>
            <span>React JS (Vite + Modern UI)</span>
            <span>•</span>
            <span>20 User Stories Backlog Complete (PB-01 to PB-20)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Smart Library Management System (LMS) • Agile Semester 8 Project • VIT-AP University
          </p>
        </div>
      </footer>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onSwitchUser={handleSwitchUser}
      />

      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onBorrowSuccess={fetchNotifications}
        user={user}
      />
    </div>
  );
}
