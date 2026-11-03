import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Scale, Lock, Mail, User, Phone, FileText, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react-native';
import { useMobileAuth } from '../context/MobileAuthContext';
import { theme } from '../theme';

export const AuthScreen: React.FC = () => {
  const { login, signUp } = useMobileAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [barEnrollment, setBarEnrollment] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [prefilledNotice, setPrefilledNotice] = useState<string | null>(null);

  const handleSelectRegistered = (targetEmail: string, targetPass: string, name: string) => {
    setMode('login');
    setEmail(targetEmail);
    setPassword(targetPass);
    setErrorMessage('');
    setPrefilledNotice(`Prefilled credentials for ${name}. Tap Access Chamber to sign in.`);
  };

  const handleLogin = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setPrefilledNotice(null);
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your registered advocate email and password.');
      return;
    }
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || 'Authentication failed.');
    }
  };

  const handleSignUp = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (!fullName || !email || !password || !barEnrollment || !phoneNumber) {
      setErrorMessage('Please fill in all mandatory fields, including Bar Council Enrollment No.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }
    setLoading(true);
    const res = await signUp({
      full_name: fullName,
      email,
      password,
      bar_enrollment_no: barEnrollment,
      phone: phoneNumber,
    });
    setLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || 'Registration failed.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Emblem */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Scale size={36} color="#ffffff" strokeWidth={2.2} />
          </View>
          <Text style={styles.title}>Legal Copilot</Text>
          <Text style={styles.subtitle}>Indian Law Practice Chambers &amp; AI Assistant</Text>

          {/* Database Sync Status Badge */}
          <View style={styles.statusBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusText}>Supabase PostgreSQL Database Connected</Text>
          </View>

          {/* 1-Click Registered Advocate Pills */}
          <View style={styles.pillCard}>
            <View style={styles.pillHeader}>
              <Sparkles size={14} color={theme.colors.primaryLight} />
              <Text style={styles.pillTitle}>Registered Chamber Advocates</Text>
            </View>
            <Text style={styles.pillDesc}>
              Tap below to authenticate directly via Supabase:
            </Text>
            <View style={styles.pillRow}>
              <TouchableOpacity
                style={[styles.pillBtn, styles.pillBtnActive]}
                onPress={() => handleSelectRegistered('rajesh.verma@chamber.in', 'Admin@2025', 'Adv. Rajesh Verma')}
              >
                <Text style={styles.pillBtnTextActive}>👑 Adv. Rajesh Verma</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pillBtn}
                onPress={() => handleSelectRegistered('priya.sharma@chamber.in', 'Associate@2025', 'Adv. Priya Sharma')}
              >
                <Text style={styles.pillBtnText}>⚖️ Adv. Priya Sharma</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Auth Form Card */}
        <View style={styles.card}>
          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, mode === 'login' && styles.tabActive]}
              onPress={() => {
                setMode('login');
                setErrorMessage('');
              }}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                Chamber Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'signup' && styles.tabActive]}
              onPress={() => {
                setMode('signup');
                setErrorMessage('');
              }}
            >
              <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
                Register Chamber
              </Text>
            </TouchableOpacity>
          </View>

          {/* Alerts */}
          {prefilledNotice ? (
            <View style={styles.noticeAlert}>
              <CheckCircle2 size={16} color={theme.colors.primaryLight} />
              <Text style={styles.noticeText}>{prefilledNotice}</Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorAlert}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Form Fields */}
          {mode === 'signup' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Advocate Full Name</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Adv. Rajesh Verma"
                    placeholderTextColor={theme.colors.textDim}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bar Council Enrollment Number *</Text>
                <View style={styles.inputWrapper}>
                  <FileText size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. D/1482/2008"
                    placeholderTextColor={theme.colors.textDim}
                    value={barEnrollment}
                    onChangeText={setBarEnrollment}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Phone Number</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="+91 98110 44211"
                    placeholderTextColor={theme.colors.textDim}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Registered Advocate Email</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="rajesh.verma@chamber.in"
                placeholderTextColor={theme.colors.textDim}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textDim}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? (
                  <EyeOff size={18} color={theme.colors.textMuted} />
                ) : (
                  <Eye size={18} color={theme.colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={mode === 'login' ? handleLogin : handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>
                {mode === 'login' ? 'Access Practice Chamber' : 'Register Chamber Profile'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.successBg,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    marginRight: 6,
  },
  statusText: {
    color: theme.colors.success,
    fontSize: 11,
    fontWeight: '600',
  },
  pillCard: {
    width: '100%',
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    padding: 12,
    marginTop: 16,
  },
  pillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pillTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primaryLight,
  },
  pillDesc: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pillBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.bgCardSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  pillBtnActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: theme.colors.primary,
  },
  pillBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text,
  },
  pillBtnTextActive: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primaryLight,
  },
  card: {
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bg,
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  noticeAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  noticeText: {
    color: theme.colors.primaryLight,
    fontSize: 12,
    flex: 1,
  },
  errorAlert: {
    backgroundColor: theme.colors.dangerBg,
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 12,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 44,
    color: theme.colors.text,
    fontSize: 14,
  },
  eyeBtn: {
    padding: 6,
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

