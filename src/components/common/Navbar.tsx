import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api.ts';
import { AppNotification, User } from '../../types.ts';
import {
  School,
  Award,
  Trophy,
  ShieldCheck,
  LogOut,
  Bell,
  CheckCircle2,
  Menu,
  X,
  RefreshCw,
  Home,
  LayoutDashboard,
} from 'lucide-react';
import { HMPravardhanLogo } from './HMPravardhanLogo.tsx';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, role, logout, openLoginForRole } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      api.getNotifications(user.id).then(setNotifications).catch(() => {});
    } else {
      setNotifications([]);
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllRead = async () => {
    if (user?.id) {
      await api.markAllNotificationsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const handleResetDemoData = async () => {
    if (confirm('Reset demo database to original seed state?')) {
      await api.resetDemo();
      window.location.reload();
    }
  };

  return (
    <header className="bg-[#1E3A8A] text-white shadow-md sticky top-0 z-40 border-b border-blue-900">
      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand logo */}
        <div
          onClick={() => setCurrentTab('home')}
          className="flex items-center space-x-3 cursor-pointer select-none"
        >
          <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-[#1E3A8A] shadow-xs p-1">
            <HMPravardhanLogo className="w-5 h-5 text-[#1E3A8A]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
              HM Pravardhan
            </h1>
            <div className="text-xs text-blue-200 font-medium">State Education Department</div>
          </div>
        </div>

        {/* Desktop navigation links */}
        <nav className="hidden md:flex items-center space-x-5 text-sm font-medium">
          <button
            onClick={() => setCurrentTab('home')}
            className={`cursor-pointer transition-colors pb-1 ${
              currentTab === 'home'
                ? 'text-white border-b-2 border-white font-bold'
                : 'text-blue-100 hover:text-blue-200'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentTab('schools')}
            className={`cursor-pointer transition-colors pb-1 ${
              currentTab === 'schools'
                ? 'text-white border-b-2 border-white font-bold'
                : 'text-blue-100 hover:text-blue-200'
            }`}
          >
            Explore Schools
          </button>
          <button
            onClick={() => setCurrentTab('rankings')}
            className={`cursor-pointer transition-colors pb-1 ${
              currentTab === 'rankings'
                ? 'text-white border-b-2 border-white font-bold'
                : 'text-blue-100 hover:text-blue-200'
            }`}
          >
            Rankings
          </button>
          <button
            onClick={() => setCurrentTab('achievements')}
            className={`cursor-pointer transition-colors pb-1 ${
              currentTab === 'achievements'
                ? 'text-white border-b-2 border-white font-bold'
                : 'text-blue-100 hover:text-blue-200'
            }`}
          >
            Achievement Wall
          </button>
          <button
            onClick={() => setCurrentTab('activity-feed')}
            className={`cursor-pointer transition-colors pb-1 flex items-center space-x-1.5 ${
              currentTab === 'activity-feed'
                ? 'text-white border-b-2 border-white font-bold'
                : 'text-blue-100 hover:text-blue-200'
            }`}
          >
            <span>Activity Feed</span>
          </button>

          {/* Role specific link */}
          {role === 'HEADMASTER' && (
            <button
              onClick={() => setCurrentTab('hm-dashboard')}
              className={`px-3 py-1.5 rounded font-bold transition-colors cursor-pointer flex items-center space-x-1.5 ml-2 ${
                currentTab === 'hm-dashboard'
                  ? 'bg-white text-[#1E3A8A] shadow-xs'
                  : 'bg-blue-800 text-white hover:bg-blue-700 border border-blue-600'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>HM Dashboard</span>
            </button>
          )}

          {role === 'MEO' && (
            <button
              onClick={() => setCurrentTab('meo-dashboard')}
              className={`px-3 py-1.5 rounded font-bold transition-colors cursor-pointer flex items-center space-x-1.5 ml-2 ${
                currentTab === 'meo-dashboard'
                  ? 'bg-white text-[#1E3A8A] shadow-xs'
                  : 'bg-blue-800 text-white hover:bg-blue-700 border border-blue-600'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>MEO Dashboard</span>
            </button>
          )}

          {(role === 'DEO' || role === 'EDUCATION_OFFICER') && (
            <button
              onClick={() => setCurrentTab('deo-dashboard')}
              className={`px-3 py-1.5 rounded font-bold transition-colors cursor-pointer flex items-center space-x-1.5 ml-2 ${
                currentTab === 'deo-dashboard'
                  ? 'bg-white text-[#1E3A8A] shadow-xs'
                  : 'bg-blue-800 text-white hover:bg-blue-700 border border-blue-600'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>DEO Dashboard</span>
            </button>
          )}
        </nav>

        {/* Right side controls & Authentication */}
        <div className="flex items-center space-x-2">
          {/* Notifications button for logged-in users */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 text-blue-100 hover:text-white hover:bg-blue-800 rounded-full transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 text-gray-800">
                  <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <span className="font-bold text-sm text-gray-800">Official Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-500">No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs transition-colors ${
                            n.isRead ? 'bg-white text-gray-500' : 'bg-blue-50 text-gray-800'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-gray-900">{n.title}</span>
                            {!n.isRead && (
                              <button
                                onClick={() => handleMarkRead(n.id)}
                                className="text-blue-600 hover:text-blue-800 ml-2"
                                title="Mark read"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-gray-600 leading-relaxed mb-1">{n.message}</p>
                          <span className="text-[10px] text-gray-400">
                            {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Login or User Logout Button */}
          {user ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  logout();
                  setCurrentTab('home');
                }}
                className="bg-blue-900 hover:bg-blue-950 text-white border border-blue-600 px-3 py-1.5 rounded font-bold text-xs transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => openLoginForRole('HEADMASTER')}
                className="bg-white text-[#1E3A8A] px-4 py-1.5 rounded font-bold hover:bg-blue-50 transition-colors shadow-xs text-xs sm:text-sm cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded text-blue-200 hover:text-white hover:bg-blue-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-blue-800 bg-[#1E3A8A] px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => {
              setCurrentTab('home');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded text-sm font-semibold ${
              currentTab === 'home' ? 'bg-blue-800 text-white' : 'text-blue-100'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => {
              setCurrentTab('schools');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded text-sm font-semibold ${
              currentTab === 'schools' ? 'bg-blue-800 text-white' : 'text-blue-100'
            }`}
          >
            Explore Schools
          </button>
          <button
            onClick={() => {
              setCurrentTab('rankings');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded text-sm font-semibold ${
              currentTab === 'rankings' ? 'bg-blue-800 text-white' : 'text-blue-100'
            }`}
          >
            Rankings
          </button>
          <button
            onClick={() => {
              setCurrentTab('achievements');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded text-sm font-semibold ${
              currentTab === 'achievements' ? 'bg-blue-800 text-white' : 'text-blue-100'
            }`}
          >
            Achievement Wall
          </button>
          <button
            onClick={() => {
              setCurrentTab('activity-feed');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded text-sm font-semibold ${
              currentTab === 'activity-feed' ? 'bg-blue-800 text-white' : 'text-blue-100'
            }`}
          >
            Activity Feed
          </button>
          {role === 'HEADMASTER' && (
            <button
              onClick={() => {
                setCurrentTab('hm-dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded text-sm font-bold bg-white text-[#1E3A8A]"
            >
              HM Dashboard
            </button>
          )}
          {role === 'MEO' && (
            <button
              onClick={() => {
                setCurrentTab('meo-dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded text-sm font-bold bg-white text-[#1E3A8A]"
            >
              MEO Dashboard
            </button>
          )}
          {(role === 'DEO' || role === 'EDUCATION_OFFICER') && (
            <button
              onClick={() => {
                setCurrentTab('deo-dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded text-sm font-bold bg-white text-[#1E3A8A]"
            >
              DEO Dashboard
            </button>
          )}
        </div>
      )}
    </header>
  );
};
