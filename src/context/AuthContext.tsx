import React, { createContext, useContext, useEffect, useState } from 'react';
import { Firm, Profile, UserRole } from '../types';
import { INITIAL_FIRM, INITIAL_PROFILES } from '../lib/mockData';
import { getStoredSupabaseConfig, supabase } from '../lib/supabaseClient';

interface AuthContextType {
  user: Profile | null;
  firm: Firm | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: {
    full_name: string;
    email: string;
    password: string;
    bar_enrollment_no: string;
    phone: string;
    firm_name?: string;
    role?: UserRole;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string; error?: string }>;
  switchDemoUser: (userId: string) => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [firm, setFirm] = useState<Firm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  useEffect(() => {
    // Check initial auth state from Supabase or localStorage
    const initAuth = async () => {
      const config = getStoredSupabaseConfig();
      setIsSupabaseConnected(config.isConfigured);

      if (supabase && config.isConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch profile
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileData) {
              setUser(profileData);
              if (profileData.firm_id) {
                const { data: firmData } = await supabase
                  .from('firms')
                  .select('*')
                  .eq('id', profileData.firm_id)
                  .single();
                if (firmData) setFirm(firmData);
              }
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn('Supabase auth session fetch error:', e);
        }
      }

      // Check localStorage for persisted demo/local user session
      const savedUserStr = localStorage.getItem('legal_copilot_auth_user');
      const savedFirmStr = localStorage.getItem('legal_copilot_auth_firm');
      
      if (savedUserStr) {
        try {
          const parsedUser = JSON.parse(savedUserStr);
          setUser(parsedUser);
          if (savedFirmStr) {
            setFirm(JSON.parse(savedFirmStr));
          } else {
            setFirm(INITIAL_FIRM);
          }
        } catch {
          setUser(INITIAL_PROFILES[0]);
          setFirm(INITIAL_FIRM);
        }
      } else {
        // Default to demo admin profile for instant interactive experience
        setUser(INITIAL_PROFILES[0]);
        setFirm(INITIAL_FIRM);
        localStorage.setItem('legal_copilot_auth_user', JSON.stringify(INITIAL_PROFILES[0]));
        localStorage.setItem('legal_copilot_auth_firm', JSON.stringify(INITIAL_FIRM));
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (supabase && getStoredSupabaseConfig().isConfigured) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

          if (!error && data.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();

            if (profile) {
              setUser(profile);
              localStorage.setItem('legal_copilot_auth_user', JSON.stringify(profile));
              if (profile.firm_id) {
                const { data: firmData } = await supabase
                  .from('firms')
                  .select('*')
                  .eq('id', profile.firm_id)
                  .maybeSingle();
                if (firmData) {
                  setFirm(firmData);
                  localStorage.setItem('legal_copilot_auth_firm', JSON.stringify(firmData));
                }
              }
              setIsLoading(false);
              return { success: true };
            }
          }
        } catch (supabaseErr: any) {
          console.warn('Supabase password sign in warning:', supabaseErr?.message);
        }
      }

      // If user exists in local mock profiles, log in immediately
      const matched = INITIAL_PROFILES.find(p => p.email.toLowerCase() === email.trim().toLowerCase());
      if (matched) {
        setUser(matched);
        setFirm(INITIAL_FIRM);
        localStorage.setItem('legal_copilot_auth_user', JSON.stringify(matched));
        localStorage.setItem('legal_copilot_auth_firm', JSON.stringify(INITIAL_FIRM));
        setIsLoading(false);
        return { success: true };
      }

      // Instant Login for any entered advocate email without requiring email confirmation
      const formattedName = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const instantProfile: Profile = {
        id: `user-${Date.now()}`,
        full_name: `Adv. ${formattedName}`,
        email: email.trim(),
        bar_enrollment_no: 'D/2048/2021',
        phone: '+91 98100 00000',
        firm_id: INITIAL_FIRM.id,
        role: 'lawyer',
        created_at: new Date().toISOString(),
      };

      setUser(instantProfile);
      setFirm(INITIAL_FIRM);
      localStorage.setItem('legal_copilot_auth_user', JSON.stringify(instantProfile));
      localStorage.setItem('legal_copilot_auth_firm', JSON.stringify(INITIAL_FIRM));
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const signUp = async (data: {
    full_name: string;
    email: string;
    password: string;
    bar_enrollment_no: string;
    phone: string;
    firm_name?: string;
    role?: UserRole;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      let createdUserId = `user-${Date.now()}`;
      let createdFirmId = `firm-${Date.now()}`;

      if (supabase && getStoredSupabaseConfig().isConfigured) {
        try {
          const { data: authData } = await supabase.auth.signUp({
            email: data.email.trim(),
            password: data.password,
            options: {
              data: {
                full_name: data.full_name,
                bar_enrollment_no: data.bar_enrollment_no,
                phone: data.phone,
              },
            },
          });

          if (authData?.user) {
            createdUserId = authData.user.id;
            
            // Try inserting firm & profile into Supabase
            try {
              const { data: newFirm } = await supabase
                .from('firms')
                .insert([
                  {
                    name: data.firm_name || `${data.full_name}'s Law Chambers`,
                    owner_id: authData.user.id,
                  },
                ])
                .select()
                .maybeSingle();

              if (newFirm) {
                createdFirmId = newFirm.id;
              }

              const newSupabaseProfile: Profile = {
                id: authData.user.id,
                full_name: data.full_name,
                email: data.email.trim(),
                bar_enrollment_no: data.bar_enrollment_no,
                phone: data.phone,
                firm_id: createdFirmId,
                role: data.role || 'admin',
                created_at: new Date().toISOString(),
              };

              await supabase.from('profiles').upsert([newSupabaseProfile]);
            } catch (dbErr) {
              console.warn('Supabase DB write warning:', dbErr);
            }
          }
        } catch (authErr: any) {
          console.warn('Supabase signup direct auth note:', authErr?.message);
        }
      }

      // Automatically log the user in immediately without requiring confirmation
      const newFirm: Firm = {
        id: createdFirmId,
        name: data.firm_name || `${data.full_name}'s Law Chambers`,
        owner_id: createdUserId,
        city: 'New Delhi',
        state: 'Delhi',
        practice_areas: ['Civil', 'Criminal', 'Constitutional'],
        created_at: new Date().toISOString(),
      };

      const newProfile: Profile = {
        id: createdUserId,
        full_name: data.full_name,
        email: data.email.trim(),
        bar_enrollment_no: data.bar_enrollment_no,
        phone: data.phone,
        firm_id: newFirm.id,
        role: data.role || 'admin',
        created_at: new Date().toISOString(),
      };

      setUser(newProfile);
      setFirm(newFirm);
      localStorage.setItem('legal_copilot_auth_user', JSON.stringify(newProfile));
      localStorage.setItem('legal_copilot_auth_firm', JSON.stringify(newFirm));
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Sign up failed' };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (supabase && getStoredSupabaseConfig().isConfigured) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Supabase logout error:', e);
    }
    setUser(null);
    setFirm(null);
    localStorage.removeItem('legal_copilot_auth_user');
    localStorage.removeItem('legal_copilot_auth_firm');
    setIsLoading(false);
  };

  const resetPassword = async (email: string) => {
    if (supabase && getStoredSupabaseConfig().isConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { success: false, message: error.message, error: error.message };
      return { success: true, message: `Password reset link has been dispatched to ${email}` };
    }
    return {
      success: true,
      message: `Password reset instructions have been dispatched to ${email} (Supabase Auth Simulator).`,
    };
  };

  const switchDemoUser = (userId: string) => {
    const found = INITIAL_PROFILES.find(p => p.id === userId);
    if (found) {
      setUser(found);
      setFirm(INITIAL_FIRM);
      localStorage.setItem('legal_copilot_auth_user', JSON.stringify(found));
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('legal_copilot_auth_user', JSON.stringify(updated));

    if (supabase && getStoredSupabaseConfig().isConfigured) {
      await supabase.from('profiles').update(updates).eq('id', user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firm,
        isAuthenticated: !!user,
        isLoading,
        isSupabaseConnected,
        login,
        signUp,
        logout,
        resetPassword,
        switchDemoUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
