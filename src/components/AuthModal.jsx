import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Mail, User, Phone, CheckCircle, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, onPolicyClick }) {
  const { login, signup, verifyOtp, verifyStage2 } = useContext(AuthContext);
  
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [otpFallback, setOtpFallback] = useState('');

  // Admin Verification State (Stage 2)
  const [isStage2Pending, setIsStage2Pending] = useState(false);
  // Pull Super Admin Email from .env variables
  const [superAdminEmail, setSuperAdminEmail] = useState(import.meta.env.VITE_SUPERADMIN_EMAIL || 'sher@superadmin');
  const [superAdminPassword, setSuperAdminPassword] = useState('');
  const [showSuperAdminPassword, setShowSuperAdminPassword] = useState(false);

  // Forgot Password States
  const [forgotPasswordStep, setForgotPasswordStep] = useState(null); // null, 'request', 'reset'
  const [resetOtpFallback, setResetOtpFallback] = useState('');

  const validate = () => {
    const tempErrors = {};
    if (forgotPasswordStep === 'request') {
      if (!email) tempErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Please enter a valid email address';
    } else if (forgotPasswordStep === 'reset') {
      if (!otpCode) tempErrors.otp = 'OTP code is required';
      else if (otpCode.length !== 6) tempErrors.otp = 'OTP must be 6 digits';
      if (!password) tempErrors.password = 'New password is required';
      else if (password.length < 6) tempErrors.password = 'Password must be at least 6 characters';
    } else {
      if (!email) tempErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Please enter a valid email address';
      
      if (!password) tempErrors.password = 'Password is required';
      else if (password.length < 6) tempErrors.password = 'Password must be at least 6 characters';

      if (!isLogin) {
        if (!name) tempErrors.name = 'Full Name is required';
        else if (name.trim().length < 3) tempErrors.name = 'Name must be at least 3 characters';
        
        if (!phone) tempErrors.phone = 'Phone number is required';
        else if (!/^\+?[\d\s-]{10,15}$/.test(phone.replace(/\s+/g, ''))) tempErrors.phone = 'Please enter a valid 10 to 15-digit phone number';
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

    if (forgotPasswordStep === 'request') {
      if (!validate()) return;
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        setIsLoading(false);
        if (response.ok) {
          setResetOtpFallback(data.otpFallback || '');
          setForgotPasswordStep('reset');
          setOtpCode('');
          setPassword('');
        } else {
          setServerError(data.message || 'Failed to send OTP code');
        }
      } catch (err) {
        setIsLoading(false);
        setServerError('Network error. Please try again later.');
      }
      return;
    }

    if (forgotPasswordStep === 'reset') {
      if (!validate()) return;
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: otpCode, newPassword: password }),
        });
        const data = await response.json();
        setIsLoading(false);
        if (response.ok) {
          alert(data.message || 'Password successfully reset!');
          setForgotPasswordStep(null);
          setIsLogin(true);
          setResetOtpFallback('');
          setPassword('');
        } else {
          setServerError(data.message || 'Failed to reset password');
        }
      } catch (err) {
        setIsLoading(false);
        setServerError('Network error. Please try again later.');
      }
      return;
    }

    if (isStage2Pending) {
      // Handle Super Admin Verify (Stage 2)
      setIsLoading(true);
      const res = await verifyStage2(superAdminEmail, superAdminPassword);
      setIsLoading(false);

      if (res.success) {
        onAuthSuccess(res.user, 'LOGIN');
        handleClose();
      } else {
        setServerError(res.error || 'Super Admin authentication failed');
      }
      return;
    }

    if (isOtpSent) {
      // Handle OTP Verification
      if (otpCode.length !== 6) {
        setErrors({ otp: 'Please enter a valid 6-digit OTP code' });
        return;
      }
      setIsLoading(true);
      const res = await verifyOtp(signupEmail, otpCode);
      setIsLoading(false);

      if (res.success) {
        onAuthSuccess(res.user, 'SIGNUP');
        handleClose();
      } else {
        setServerError(res.error || 'OTP verification failed');
      }
      return;
    }

    // Standard Login/Signup flow
    if (!validate()) return;
    setIsLoading(true);

    if (isLogin) {
      const res = await login(email, password);
      setIsLoading(false);

      if (res.error) {
        setServerError(res.error);
      } else if (res.requireStage2) {
        setIsStage2Pending(true);
      } else if (res.success) {
        onAuthSuccess(res.user, 'LOGIN');
        handleClose();
      }
    } else {
      // Signup Flow
      const res = await signup(name, email, phone, password);
      setIsLoading(false);

      if (res.error) {
        setServerError(res.error);
      } else if (res.success) {
        setSignupEmail(res.email);
        setOtpFallback(res.otpFallback || '');
        setIsOtpSent(true);
      }
    }
  };

  const handleClose = () => {
    if (isOtpSent && signupEmail) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/auth/cancel-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail })
      }).catch(err => console.error('Error cancelling signup:', err));
    }
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setOtpCode('');
    setOtpFallback('');
    setResetOtpFallback('');
    setForgotPasswordStep(null);
    setSuperAdminPassword('');
    setIsOtpSent(false);
    setIsStage2Pending(false);
    setErrors({});
    setServerError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto px-4 py-6 select-none">
          {/* Blur background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-on-surface/60 backdrop-blur-md"
          ></motion.div>

          {/* Modal Container: Matches Checkout Modal with primary burgundy gradient header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-md bg-brand-bg rounded-2xl shadow-2xl border border-[#E0DAD0] overflow-hidden z-10 flex flex-col max-h-[90vh] sm:max-h-[85vh]"
          >
            {/* Header branding in primary Wine Burgundy */}
            <div className="relative bg-primary text-white py-6 px-6 text-center overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-[#5C061E] opacity-95"></div>
              
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border-none"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative z-10">
                <span className="text-[10px] tracking-[0.3em] font-sans font-bold uppercase text-secondary">
                  WedCoholic Membership
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold mt-1 text-white tracking-wide">
                  {forgotPasswordStep === 'request'
                    ? 'Forgot Password'
                    : forgotPasswordStep === 'reset'
                      ? 'Reset Password'
                      : isStage2Pending 
                        ? 'Bespoke Verification' 
                        : isOtpSent 
                          ? 'Secure Activation' 
                          : isLogin 
                            ? 'Welcome Back' 
                            : 'Create Account'}
                </h2>
                <p className="text-xs text-white/70 font-sans mt-2 leading-relaxed max-w-sm mx-auto">
                  {forgotPasswordStep === 'request'
                    ? 'Enter your registered email address to receive a password reset OTP code.'
                    : forgotPasswordStep === 'reset'
                      ? 'Enter the 6-digit OTP code sent to your email and select a new secure password.'
                      : isStage2Pending
                        ? 'Please supply the Super Admin authorization key to log in to the administrative panels.'
                        : isOtpSent
                          ? `We have logged a 6-digit verification code to the server terminal. Please input it below.`
                          : isLogin 
                            ? 'Sign in to access your scheduled design calls, and orders.' 
                            : 'Join WedCoholic to unlock tailored size sheets and early couture collection previews.'}
                </p>
              </div>
            </div>

            {/* Sliding Navigation Tabs matching light theme */}
            {!isOtpSent && !isStage2Pending && !forgotPasswordStep && (
              <div className="flex bg-white border-b border-[#E0DAD0]/60 relative select-none shrink-0">
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setErrors({}); setServerError(null); }}
                  className={`flex-1 py-4 text-center text-xs font-sans font-bold uppercase tracking-wider transition-all border-none bg-transparent cursor-pointer relative ${
                    isLogin ? 'text-primary' : 'text-on-surface/40 hover:text-primary'
                  }`}
                >
                  Sign In
                  {isLogin && <motion.div layoutId="authTabLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"></motion.div>}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); setErrors({}); setServerError(null); }}
                  className={`flex-1 py-4 text-center text-xs font-sans font-bold uppercase tracking-wider transition-all border-none bg-transparent cursor-pointer relative ${
                    !isLogin ? 'text-primary' : 'text-on-surface/40 hover:text-primary'
                  }`}
                >
                  Register
                  {!isLogin && <motion.div layoutId="authTabLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"></motion.div>}
                </button>
              </div>
            )}

            {/* Main Form content - scrollable max height with hidden scrollbar styling */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white overflow-y-auto flex-1 hide-scrollbar">
              
              {serverError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-[11px] font-semibold leading-relaxed text-center font-sans">
                  {serverError}
                </div>
              )}

              {/* VIEW A: FORGOT PASSWORD REQUEST OTP */}
              {forgotPasswordStep === 'request' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-on-surface/50 block">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-0 w-4 h-4 text-on-surface/30" />
                      <input
                        type="email"
                        required
                        className="w-full pl-7 pr-2 py-2 bg-transparent border-b border-[#E0DAD0] text-xs sm:text-sm text-on-surface placeholder-on-surface/35 focus:outline-none focus:border-primary transition-colors rounded-none"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    {errors.email && <p className="text-[9px] text-red-500 font-sans mt-1">{errors.email}</p>}
                  </div>

                  <button
                    type="button"
                    onClick={() => { setForgotPasswordStep(null); setServerError(null); setErrors({}); }}
                    className="text-xs text-primary hover:underline font-bold bg-transparent border-none cursor-pointer p-0"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}

              {/* VIEW B: FORGOT PASSWORD RESET */}
              {forgotPasswordStep === 'reset' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-on-surface/50 block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      className="w-full py-2 bg-transparent border-b border-neutral-100 text-xs sm:text-sm text-on-surface/60 rounded-none cursor-not-allowed"
                      value={email}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-on-surface/50 block">
                      6-Digit OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="e.g. 123456"
                      className="w-full py-2 bg-transparent border-b border-[#E0DAD0] text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary rounded-none font-mono tracking-widest"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                    />
                    {errors.otp && <p className="text-[9px] text-red-500 font-sans mt-1">{errors.otp}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-on-surface/50 block">
                      New Password
                    </label>
                    <div className="relative flex items-center w-full">
                      <Lock className="absolute left-0 w-4 h-4 text-on-surface/30" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className="w-full pl-7 pr-8 py-2 bg-transparent border-b border-[#E0DAD0] text-xs sm:text-sm text-on-surface placeholder-on-surface/35 focus:outline-none focus:border-primary transition-colors rounded-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 p-1 text-on-surface/40 hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
                      >
                        {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-[9px] text-red-500 font-sans mt-1">{errors.password}</p>}
                  </div>

                  {resetOtpFallback && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-semibold text-center font-sans mt-3 select-all">
                      [Development Fallback] OTP Code: <span className="font-mono font-bold text-sm">{resetOtpFallback}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => { setForgotPasswordStep(null); setServerError(null); setErrors({}); }}
                    className="text-xs text-primary hover:underline font-bold bg-transparent border-none cursor-pointer p-0"
                  >
                    Cancel & Back to Sign In
                  </button>
                </div>
              )}

              {/* VIEW 1: SUPER ADMIN VERIFICATION (STAGE 2) */}
              {isStage2Pending && !forgotPasswordStep && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-primary pb-2 border-b border-[#E0DAD0]/60">
                    <ShieldCheck className="w-5 h-5 text-secondary" />
                    <span className="font-display font-bold text-xs uppercase tracking-widest text-primary">Super Admin Authorization</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-on-surface/50 block">
                      Super Admin Email
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-0 w-4 h-4 text-on-surface/30" />
                      <input
                        type="email"
                        required
                        className="w-full pl-7 pr-2 py-2 bg-transparent border-b border-[#E0DAD0] text-xs sm:text-sm text-on-surface placeholder-on-surface/30 focus:outline-none focus:border-primary transition-colors rounded-none"
                        value={superAdminEmail}
                        onChange={(e) => setSuperAdminEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-on-surface/50 block">
                      Clearance Password
                    </label>
                    <div className="relative flex items-center w-full">
                      <Lock className="absolute left-0 w-4 h-4 text-on-surface/30" />
                      <input
                        type={showSuperAdminPassword ? "text" : "password"}
                        required
                        className="w-full pl-7 pr-8 py-2 bg-transparent border-b border-[#E0DAD0] text-xs sm:text-sm text-on-surface placeholder-on-surface/30 focus:outline-none focus:border-primary transition-colors rounded-none"
                        placeholder="••••••••"
                        value={superAdminPassword}
                        onChange={(e) => setSuperAdminPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSuperAdminPassword(!showSuperAdminPassword)}
                        className="absolute right-0 p-1 text-on-surface/40 hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
                      >
                        {showSuperAdminPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: OTP VERIFICATION DISPLAY */}
              {isOtpSent && !isStage2Pending && !forgotPasswordStep && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-on-surface/50 text-center block mb-1">
                      Enter 6-Digit Verification OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      className="w-full tracking-[1.5em] text-center font-mono py-3.5 rounded-xl border border-[#E0DAD0] text-lg font-bold text-on-surface bg-brand-bg focus:outline-none focus:border-primary"
                      placeholder="XXXXXX"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                    />
                    {errors.otp && <p className="text-[10px] text-red-500 font-sans text-center mt-1">{errors.otp}</p>}
                    
                    {otpFallback && (
                      <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-semibold text-center font-sans mt-3 select-all">
                        [Development Fallback] OTP Code: <span className="font-mono font-bold text-sm">{otpFallback}</span>
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full bg-transparent hover:underline text-on-surface/60 hover:text-primary py-2 text-xs font-sans text-center cursor-pointer border-none mt-2 block font-bold transition-colors"
                    >
                      Cancel & Delete Registration
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 3: STANDARD LOGIN/REGISTER VIEW */}
              {!isOtpSent && !isStage2Pending && !forgotPasswordStep && (
                <div className="space-y-4">
                  {/* Profile Name (Sign up only) */}
                  {!isLogin && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-on-surface/50 block">
                        Full Name
                      </label>
                      <div className="relative flex items-center">
                        <User className="absolute left-0 w-4 h-4 text-on-surface/30" />
                        <input
                          type="text"
                          className="w-full pl-7 pr-2 py-2 bg-transparent border-b border-[#E0DAD0] text-xs sm:text-sm text-on-surface placeholder-on-surface/35 focus:outline-none focus:border-primary transition-colors rounded-none"
                          placeholder="e.g. Cynthia Roy"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      {errors.name && <p className="text-[9px] text-red-500 font-sans mt-1">{errors.name}</p>}
                    </div>
                  )}

                  {/* Email Address */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-on-surface/50 block">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-0 w-4 h-4 text-on-surface/30" />
                      <input
                        type="email"
                        className="w-full pl-7 pr-2 py-2 bg-transparent border-b border-[#E0DAD0] text-xs sm:text-sm text-on-surface placeholder-on-surface/35 focus:outline-none focus:border-primary transition-colors rounded-none"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    {errors.email && <p className="text-[9px] text-red-500 font-sans mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone number (Sign up only) */}
                  {!isLogin && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-on-surface/50 block">
                        Mobile Number
                      </label>
                      <div className="relative flex items-center">
                        <Phone className="absolute left-0 w-4 h-4 text-on-surface/30" />
                        <input
                          type="tel"
                          className="w-full pl-7 pr-2 py-2 bg-transparent border-b border-[#E0DAD0] text-xs sm:text-sm text-on-surface placeholder-on-surface/35 focus:outline-none focus:border-primary transition-colors rounded-none"
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      {errors.phone && <p className="text-[9px] text-red-500 font-sans mt-1">{errors.phone}</p>}
                    </div>
                  )}

                  {/* Password */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-on-surface/50">
                        Secure Password
                      </label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => { setForgotPasswordStep('request'); setServerError(null); setErrors({}); }}
                          className="text-[10px] text-primary hover:underline font-bold bg-transparent border-none cursor-pointer p-0"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative flex items-center w-full">
                      <Lock className="absolute left-0 w-4 h-4 text-on-surface/30" />
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full pl-7 pr-8 py-2 bg-transparent border-b border-[#E0DAD0] text-xs sm:text-sm text-on-surface placeholder-on-surface/35 focus:outline-none focus:border-primary transition-colors rounded-none"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 p-1 text-on-surface/40 hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
                      >
                        {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-[9px] text-red-500 font-sans mt-1">{errors.password}</p>}
                  </div>
                </div>
              )}

              {/* Submit Button in primary Wine Burgundy */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-[#5C061E] disabled:bg-[#7A0C2E]/60 text-white py-3.5 px-4 rounded-lg font-sans font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 border-none cursor-pointer mt-6 transition-colors shadow-md"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    {forgotPasswordStep === 'request'
                      ? 'Request Password Reset'
                      : forgotPasswordStep === 'reset'
                        ? 'Reset Password'
                        : isStage2Pending 
                          ? 'Verify Super Admin' 
                          : isOtpSent 
                            ? 'Confirm Verification Code' 
                            : isLogin 
                              ? 'Sign In to Couture' 
                              : 'Complete Registration'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>

              {/* Terms disclaimer */}
              <p className="text-xs sm:text-sm text-primary font-bold text-center leading-relaxed font-sans pt-4 border-t border-[#E0DAD0]/30 select-none">
                By continuing, you agree to WedCoholic's <span onClick={() => onPolicyClick && onPolicyClick('terms')} className="underline cursor-pointer">Terms of Service</span>.
              </p>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
