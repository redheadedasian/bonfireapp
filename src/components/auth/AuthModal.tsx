import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../../store/authStore';
import { BonfireLogo } from '../ui/BonfireLogo';
import { 
  X, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Cloud, 
  ShieldCheck, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Key, 
  Mail, 
  Lock,
  ChevronDown,
  ChevronUp,
  Flame,
  RefreshCw
} from 'lucide-react';
import { FirebaseConfigCustom } from '../../types/auth';
import { getCustomFirebaseConfig } from '../../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { 
    user, 
    isAuthenticated, 
    isFirebaseReady, 
    syncStatus, 
    userCharacters, 
    signInGoogle, 
    signInEmail, 
    signUpEmail, 
    signOut, 
    setGuestUser,
    setDemoUser,
    saveCustomConfig,
    errorMessage,
    clearError
  } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'signup' | 'config'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Custom Firebase config state
  const [customConfig, setCustomConfig] = useState<FirebaseConfigCustom>(() => {
    return getCustomFirebaseConfig() || {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    };
  });
  const [configSavedNotice, setConfigSavedNotice] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();
    if (!email.trim() || !password.trim()) {
      setFormError('Please fill in both email and password.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUpEmail(email.trim(), password.trim());
      } else {
        await signInEmail(email.trim(), password.trim());
      }
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    clearError();
    setLoading(true);
    try {
      await signInGoogle();
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customConfig.apiKey || !customConfig.projectId) {
      setFormError('API Key and Project ID are required.');
      return;
    }
    saveCustomConfig(customConfig);
    setConfigSavedNotice(true);
    setTimeout(() => {
      setConfigSavedNotice(false);
      setMode('login');
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md bg-[#fcfbf9] border-2 border-black/30 rounded-xl shadow-2xl flex flex-col overflow-hidden z-10 text-[#161616]"
          >
            {/* Header */}
            <div className="border-b border-[#141414]/15 bg-white/90 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BonfireLogo size={32} />
                <div>
                  <h3 className="font-display text-sm uppercase tracking-[0.18em] text-[#161616] font-bold">
                    {isAuthenticated && user && !user.isAnonymous ? 'Account & Cloud Vault' : 'Cloud Character Vault'}
                  </h3>
                  <p className="font-serif text-[11px] text-[#555555]">
                    Firebase Authentication & Sync
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-[#777777] hover:text-[#161616] p-1.5 rounded hover:bg-black/5 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              
              {/* If authenticated user */}
              {isAuthenticated && user && !user.isAnonymous ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white border border-[#141414]/15 rounded-lg shadow-xs">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-12 h-12 rounded-full border border-black/20" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-black/5 border border-black/20 flex items-center justify-center text-[var(--accent-ink)]">
                        <User size={24} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-sm text-[#161616] font-bold truncate">
                        {user.displayName || 'Hero'}
                      </div>
                      <div className="font-serif text-xs text-[#555555] truncate">
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#276749] font-semibold">
                        <Cloud size={12} />
                        <span>Cloud Vault Synced ({userCharacters.length} heroes)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setMode('config')}
                      className="sumie-btn-secondary w-full"
                    >
                      <Settings size={14} />
                      <span>Firebase Settings</span>
                    </button>

                    <button
                      onClick={async () => {
                        await signOut();
                      }}
                      className="w-full py-2 px-3 border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 font-display text-xs uppercase tracking-wider rounded font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : mode === 'config' ? (
                /* Firebase Settings View */
                <form onSubmit={handleSaveConfig} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#141414]/15">
                    <span className="font-display text-xs text-[#161616] uppercase tracking-wider font-bold">
                      Custom Firebase Credentials
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setMode('login')} 
                      className="text-xs text-[#555555] hover:text-[#161616] cursor-pointer font-bold"
                    >
                      Back
                    </button>
                  </div>

                  <p className="font-serif text-[11px] text-[#555555]">
                    Connect your own Firebase project for multi-device sync, character sharing, and cloud backups.
                  </p>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">API Key</label>
                    <input 
                      type="text" 
                      value={customConfig.apiKey}
                      onChange={e => setCustomConfig({ ...customConfig, apiKey: e.target.value })}
                      placeholder="AIzaSy..."
                      className="bg-white border border-[#141414]/20 text-[#161616] text-xs px-3 py-1.5 rounded focus:border-[var(--accent-ink)] focus:outline-none font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Project ID</label>
                    <input 
                      type="text" 
                      value={customConfig.projectId}
                      onChange={e => setCustomConfig({ ...customConfig, projectId: e.target.value })}
                      placeholder="my-bonfire-project"
                      className="bg-white border border-[#141414]/20 text-[#161616] text-xs px-3 py-1.5 rounded focus:border-[var(--accent-ink)] focus:outline-none font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">App ID</label>
                    <input 
                      type="text" 
                      value={customConfig.appId}
                      onChange={e => setCustomConfig({ ...customConfig, appId: e.target.value })}
                      placeholder="1:123456789:web:abcdef"
                      className="bg-white border border-[#141414]/20 text-[#161616] text-xs px-3 py-1.5 rounded focus:border-[var(--accent-ink)] focus:outline-none font-mono"
                    />
                  </div>

                  {configSavedNotice && (
                    <div className="p-2 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded flex items-center gap-1.5 font-bold">
                      <CheckCircle size={14} />
                      <span>Configuration saved successfully!</span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="sumie-btn-primary flex-1"
                    >
                      Save Configuration
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        saveCustomConfig(null);
                        setCustomConfig({
                          apiKey: '',
                          authDomain: '',
                          projectId: '',
                          storageBucket: '',
                          messagingSenderId: '',
                          appId: ''
                        });
                        setMode('login');
                      }}
                      className="sumie-btn-secondary"
                      title="Clear custom config"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              ) : (
                /* Login / Signup Form */
                <div className="flex flex-col gap-4">
                  
                  {/* Google Sign In Button */}
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-white hover:bg-black/5 border-[1.5px] border-[#1a1a1a] text-[#1a1a1a] font-display text-xs uppercase tracking-wider font-bold rounded-lg shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.1 9 5 12 5z" />
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                      <path fill="#FBBC05" d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.2-2 .4-2.8L1.9 6.3C.7 8.7 0 11.3 0 14s.7 5.3 1.9 7.7l3.7-2.9z" />
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-[1px] bg-[#141414]/15" />
                    <span className="font-serif text-[10px] uppercase text-[#777777] tracking-widest font-bold">or email</span>
                    <div className="flex-1 h-[1px] bg-[#141414]/15" />
                  </div>

                  {/* Form */}
                  <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Email Address</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="adventurer@realm.com"
                          className="w-full bg-white border border-[#141414]/20 text-[#161616] text-xs pl-8 pr-3 py-2 rounded focus:border-[var(--accent-ink)] focus:outline-none font-serif"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-display uppercase tracking-wider text-[#555555] font-bold">Password</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-white border border-[#141414]/20 text-[#161616] text-xs pl-8 pr-3 py-2 rounded focus:border-[var(--accent-ink)] focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    {(formError || errorMessage) && (
                      <div className="p-2.5 bg-red-50 border border-red-300 text-red-700 text-xs rounded flex items-center gap-2 font-medium">
                        <AlertTriangle size={14} className="shrink-0 text-red-600" />
                        <span className="leading-snug">{formError || errorMessage}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="sumie-btn-primary w-full py-2.5 mt-1"
                    >
                      {loading ? 'Authenticating...' : mode === 'signup' ? 'Create Character Vault Account' : 'Enter Character Vault'}
                    </button>
                  </form>

                  {/* Switch between login / signup */}
                  <div className="flex items-center justify-between text-xs font-serif pt-2 border-t border-[#141414]/15">
                    <button
                      onClick={() => {
                        setMode(mode === 'login' ? 'signup' : 'login');
                        setFormError(null);
                      }}
                      className="text-[#161616] hover:text-[var(--accent-ink)] font-bold hover:underline cursor-pointer"
                    >
                      {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
                    </button>

                    <button
                      onClick={() => setMode('config')}
                      className="text-[#555555] hover:text-[#161616] flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <Settings size={12} />
                      <span>Config</span>
                    </button>
                  </div>

                  {/* Quick Role Presets & Guest Mode option */}
                  <div className="p-3 bg-white border border-[#141414]/15 rounded-md text-center flex flex-col gap-2 shadow-xs">
                    <p className="font-serif text-[11px] text-[#555555]">
                      Explore role permissions with instant demo identities:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setDemoUser('dm');
                          onClose();
                        }}
                        className="py-1.5 px-2 bg-white hover:bg-black/5 text-[#161616] border border-black/20 text-[10px] font-display uppercase tracking-wider rounded font-bold transition-all shadow-xs cursor-pointer"
                        title="Log in as Master Eldritch (Dungeon Master)"
                      >
                        ⚡ Log in as DM
                      </button>
                      <button
                        onClick={() => {
                          setDemoUser('player');
                          onClose();
                        }}
                        className="py-1.5 px-2 bg-white hover:bg-black/5 text-[#161616] border border-black/20 text-[10px] font-display uppercase tracking-wider rounded font-bold transition-all shadow-xs cursor-pointer"
                        title="Log in as Preston (Regular Player)"
                      >
                        ⚔️ Log in as Player
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setGuestUser();
                        onClose();
                      }}
                      className="mt-1 py-1 bg-transparent hover:bg-black/5 text-[#555555] hover:text-[#161616] text-[10px] font-serif italic underline transition-colors cursor-pointer"
                    >
                      Or continue in anonymous local guest mode
                    </button>
                  </div>

                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
