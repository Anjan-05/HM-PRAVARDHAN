import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/common/Navbar.tsx';
import { Footer } from './components/common/Footer.tsx';
import { LoginModal } from './components/auth/LoginModal.tsx';
import { PublicHome } from './components/public/PublicHome.tsx';
import { ExploreSchools } from './components/public/ExploreSchools.tsx';
import { HMRankings } from './components/public/HMRankings.tsx';
import { AchievementWall } from './components/public/AchievementWall.tsx';
import { PublicHMProfile } from './components/public/PublicHMProfile.tsx';
import { SchoolDetailsModal } from './components/public/SchoolDetailsModal.tsx';
import { HMDashboard } from './components/hm/HMDashboard.tsx';
import { EODashboard } from './components/eo/EODashboard.tsx';
import { MEODashboard } from './components/meo/MEODashboard.tsx';
import { DEODashboard } from './components/deo/DEODashboard.tsx';
import { ActivityFeedPage } from './components/activity/ActivityFeedPage.tsx';
import { api } from './api.ts';
import { School, UserRole } from './types.ts';
import { ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';

const MainContent: React.FC = () => {
  const { user, role, openLoginForRole } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedHMId, setSelectedHMId] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  const handleNavigate = (tab: string) => {
    setSelectedHMId(null);
    setSelectedSchool(null);
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHM = (hmId: string) => {
    setSelectedHMId(hmId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSchool = (school: School) => {
    setSelectedSchool(school);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-gray-800 font-sans antialiased selection:bg-blue-200">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setSelectedHMId(null);
          setSelectedSchool(null);
          setCurrentTab(tab);
        }}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* If a HM profile is actively selected from rankings or home */}
        {selectedHMId ? (
          <PublicHMProfile
            headmasterId={selectedHMId}
            onBack={() => setSelectedHMId(null)}
            onSelectSchool={(s) => setSelectedSchool(s)}
          />
        ) : (
          <>
            {/* Tab 1: Public Home */}
            {currentTab === 'home' && (
              <PublicHome
                onNavigate={handleNavigate}
                onOpenLogin={(targetRole) => openLoginForRole(targetRole)}
                onSelectHM={handleSelectHM}
                onSelectSchool={handleSelectSchool}
              />
            )}

            {/* Tab 2: Explore Schools Directory */}
            {currentTab === 'schools' && (
              <ExploreSchools onSelectSchool={handleSelectSchool} />
            )}

            {/* Tab 3: HM Rankings */}
            {currentTab === 'rankings' && (
              <HMRankings onSelectHM={handleSelectHM} />
            )}

            {/* Tab 4: Achievement Wall */}
            {currentTab === 'achievements' && (
              <AchievementWall onSelectHM={handleSelectHM} />
            )}

            {/* Tab: Common HM Activity Feed */}
            {currentTab === 'activity-feed' && (
              user ? (
                <ActivityFeedPage
                  currentUser={user}
                  onSelectHM={handleSelectHM}
                  onSelectSchool={async (schoolId) => {
                    try {
                      const sch = await api.getSchoolById(schoolId);
                      if (sch) setSelectedSchool(sch);
                    } catch (e) {
                      console.error('Failed to load school for modal:', e);
                    }
                  }}
                  onNavigateToAchievements={() => handleNavigate('achievements')}
                />
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-md mx-auto my-12 space-y-4 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">Headmaster or Officer Access Required</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    The HM Activity Feed is an exclusive professional platform for verified Government School Headmasters and Education Officers across Telangana to exchange school activity highlights.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-2 pt-2">
                    <button
                      onClick={() => openLoginForRole('HEADMASTER')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-md transition-colors cursor-pointer"
                    >
                      Login as Headmaster
                    </button>
                    <button
                      onClick={() => openLoginForRole('EDUCATION_OFFICER')}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-md transition-colors cursor-pointer"
                    >
                      Login as Officer
                    </button>
                  </div>
                </div>
              )
            )}

            {/* Tab 5: Headmaster Dashboard */}
            {currentTab === 'hm-dashboard' && (
              role === 'HEADMASTER' ? (
                <HMDashboard onNavigateToFeed={() => handleNavigate('activity-feed')} />
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-md mx-auto my-12 space-y-4 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">Headmaster Authentication Required</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Please sign in with verified Headmaster credentials or test account to access institutional evaluations.
                  </p>
                  <button
                    onClick={() => openLoginForRole('HEADMASTER')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-md transition-colors cursor-pointer"
                  >
                    Open Headmaster Login
                  </button>
                </div>
              )
            )}

            {/* Tab 6: Mandal Education Officer Dashboard */}
            {currentTab === 'meo-dashboard' && (
              role === 'MEO' ? (
                <MEODashboard />
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-md mx-auto my-12 space-y-4 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">Mandal Education Officer Access Required</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Access is restricted to Mandal Education Officers to supervise schools and verify institutional achievements within their assigned mandal.
                  </p>
                  <button
                    onClick={() => openLoginForRole('MEO')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-md transition-colors cursor-pointer"
                  >
                    Open MEO Login
                  </button>
                </div>
              )
            )}

            {/* Tab 7: District Education Officer Dashboard */}
            {(currentTab === 'deo-dashboard' || currentTab === 'eo-dashboard') && (
              role === 'DEO' || role === 'EDUCATION_OFFICER' ? (
                <DEODashboard />
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-md mx-auto my-12 space-y-4 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">District Education Officer Access Required</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Access is restricted to District Education Officers and state evaluators for district-wide governance, mandal comparisons, and official grading.
                  </p>
                  <button
                    onClick={() => openLoginForRole('DEO')}
                    className="bg-blue-700 hover:bg-blue-600 text-white font-semibold text-xs px-4 py-2 rounded-md transition-colors cursor-pointer"
                  >
                    Open DEO Login
                  </button>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* School Details Modal */}
      <SchoolDetailsModal
        school={selectedSchool}
        onClose={() => setSelectedSchool(null)}
        onSelectHM={(hmId) => {
          setSelectedSchool(null);
          setSelectedHMId(hmId);
        }}
      />

      {/* Login Modal */}
      <LoginModal
        onSuccessNavigate={(loggedRole: UserRole) => {
          if (loggedRole === 'HEADMASTER') {
            setCurrentTab('hm-dashboard');
          } else if (loggedRole === 'MEO') {
            setCurrentTab('meo-dashboard');
          } else if (loggedRole === 'DEO' || loggedRole === 'EDUCATION_OFFICER') {
            setCurrentTab('deo-dashboard');
          } else {
            setCurrentTab('home');
          }
        }}
      />

      {/* Platform Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
