import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserRole } from '../../types.ts';
import {
  Eye,
  UserCheck,
  Building2,
  ShieldCheck,
  X,
  AlertCircle,
  KeyRound,
  Mail,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { HMPravardhanLogo } from '../common/HMPravardhanLogo.tsx';

interface LoginModalProps {
  onSuccessNavigate?: (role: UserRole) => void;
}

type SelectedTier = 'VISITOR' | 'HEADMASTER' | 'MEO' | 'DEO';

export const LoginModal: React.FC<LoginModalProps> = ({ onSuccessNavigate }) => {
  const { loginModalOpen, setLoginModalOpen, targetRole, login, logout, switchDemoUser } = useAuth();
  const [selectedTier, setSelectedTier] = useState<SelectedTier>('HEADMASTER');
  const [email, setEmail] = useState('hm1@govschools.in');
  const [password, setPassword] = useState('hm123');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (targetRole === 'MEO') {
      setSelectedTier('MEO');
      setEmail('meo.kazipet@govschools.in');
      setPassword('meo123');
    } else if (targetRole === 'DEO' || targetRole === 'EDUCATION_OFFICER') {
      setSelectedTier('DEO');
      setEmail('deo.warangal@govschools.in');
      setPassword('deo123');
    } else if (targetRole === 'VISITOR' || targetRole === 'PUBLIC') {
      setSelectedTier('VISITOR');
    } else {
      setSelectedTier('HEADMASTER');
      setEmail('hm1@govschools.in');
      setPassword('hm123');
    }
    setError(null);
  }, [targetRole, loginModalOpen]);

  const handleSelectTier = (tier: SelectedTier) => {
    setSelectedTier(tier);
    setError(null);
    if (tier === 'VISITOR') {
      // Visitor needs no credentials, immediate entry
      logout();
      setLoginModalOpen(false);
      if (onSuccessNavigate) {
        onSuccessNavigate('VISITOR');
      }
    } else if (tier === 'HEADMASTER') {
      setEmail('hm1@govschools.in');
      setPassword('hm123');
    } else if (tier === 'MEO') {
      setEmail('meo.kazipet@govschools.in');
      setPassword('meo123');
    } else if (tier === 'DEO') {
      setEmail('deo.warangal@govschools.in');
      setPassword('deo123');
    }
  };

  const handleQuickLogin = async (tier: 'HEADMASTER' | 'MEO' | 'DEO') => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (tier === 'HEADMASTER') {
        await login('hm1@govschools.in', 'hm123', 'HEADMASTER');
      } else if (tier === 'MEO') {
        await login('meo.kazipet@govschools.in', 'meo123', 'MEO');
      } else if (tier === 'DEO') {
        await login('deo.warangal@govschools.in', 'deo123', 'DEO');
      }
      if (onSuccessNavigate) {
        onSuccessNavigate(tier);
      }
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTier === 'VISITOR') {
      logout();
      setLoginModalOpen(false);
      if (onSuccessNavigate) onSuccessNavigate('VISITOR');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password, selectedTier);
      if (onSuccessNavigate) {
        onSuccessNavigate(selectedTier);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!loginModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden text-gray-800 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#1E3A8A] px-6 py-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded bg-white/15 flex items-center justify-center text-white p-1.5 shadow-xs">
              <HMPravardhanLogo className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg leading-tight">
                HM Pravardhan Portal Access
              </h3>
              <p className="text-xs text-blue-100">
                Select your designated role from the four-tier institutional hierarchy
              </p>
            </div>
          </div>
          <button
            onClick={() => setLoginModalOpen(false)}
            className="text-blue-200 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Four Clear Role Access Cards */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
              Select Designated Access Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Visitor */}
              <button
                type="button"
                onClick={() => handleSelectTier('VISITOR')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedTier === 'VISITOR'
                    ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-600'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    No Login Req.
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">1. Visitor</h4>
                  <p className="text-[11px] text-gray-500 font-medium">Browse Public Portal</p>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                    Read-only access to state rankings, school profiles, public achievements, and school feed.
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-gray-200/60 text-emerald-700 font-bold text-xs flex items-center justify-between">
                  <span>Enter Immediately</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Option 2: Headmaster */}
              <button
                type="button"
                onClick={() => handleSelectTier('HEADMASTER')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedTier === 'HEADMASTER'
                    ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-600'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1E3A8A] flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#1E3A8A] px-2 py-0.5 rounded">
                    School Level
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">2. Headmaster (HM)</h4>
                  <p className="text-[11px] text-gray-500 font-medium">School Level HM Access</p>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                    Manage own school, submit achievements, file score appeals, post to feed, and manage Class 10 student performance.
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-gray-200/60 text-blue-700 font-bold text-xs flex items-center justify-between">
                  <span>M. Ramakrishna (ZPHS Kazipet)</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Option 3: Mandal Education Officer */}
              <button
                type="button"
                onClick={() => handleSelectTier('MEO')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedTier === 'MEO'
                    ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-600'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                    Mandal Level
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">3. Mandal Education Officer (MEO)</h4>
                  <p className="text-[11px] text-gray-500 font-medium">Mandal Level Monitoring</p>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                    Monitor all schools in assigned Mandal (Kazipet), verify achievements, and oversee mandal student outcomes.
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-gray-200/60 text-indigo-700 font-bold text-xs flex items-center justify-between">
                  <span>S. Venkateshwarlu (Kazipet)</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Option 4: District Education Officer */}
              <button
                type="button"
                onClick={() => handleSelectTier('DEO')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedTier === 'DEO'
                    ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-600'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                    District Level
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">4. District Education Officer (DEO)</h4>
                  <p className="text-[11px] text-gray-500 font-medium">District Level Governance</p>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                    Oversee all schools across the District (Warangal Urban), review score appeals, view district analytics &amp; student results.
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-gray-200/60 text-amber-800 font-bold text-xs flex items-center justify-between">
                  <span>Dr. K. Srinivas Rao (Warangal Urban)</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>

          {/* Form for selected authenticated role */}
          {selectedTier !== 'VISITOR' && (
            <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Credentials for {selectedTier === 'HEADMASTER' ? 'Headmaster' : selectedTier === 'MEO' ? 'Mandal Education Officer' : 'District Education Officer'}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickLogin(selectedTier)}
                  disabled={isSubmitting}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>1-Click Quick Demo Login</span>
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Official Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-lg font-bold text-xs sm:text-sm text-white bg-[#1E3A8A] hover:bg-blue-900 transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
                >
                  <span>
                    {isSubmitting
                      ? 'Authenticating...'
                      : `Log in as ${
                          selectedTier === 'HEADMASTER'
                            ? 'Headmaster'
                            : selectedTier === 'MEO'
                            ? 'Mandal Education Officer'
                            : 'District Education Officer'
                        }`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* If Visitor is selected */}
          {selectedTier === 'VISITOR' && (
            <div className="border-t border-gray-200 pt-4 text-center space-y-3">
              <p className="text-xs text-gray-600">
                Visitor mode grants immediate read-only access to school rankings, public achievement stories, and school profiles. No authentication needed.
              </p>
              <button
                type="button"
                onClick={() => handleSelectTier('VISITOR')}
                className="w-full py-2.5 rounded-lg font-bold text-xs sm:text-sm text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
              >
                <span>Continue to Public Portal as Visitor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
