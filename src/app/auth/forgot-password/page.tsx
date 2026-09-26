"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset, resetPasswordWithOTP } from "@/actions/auth";
import {
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Lock,
  Boxes,
  RotateCw,
  XCircle,
  Sparkles,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [devOtpNotification, setDevOtpNotification] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const hasLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  async function handleRequestOTP(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await requestPasswordReset(email);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      if (result.otp) {
        setDevOtpNotification(result.otp);
      }
      setStep("verify");
      setCountdown(60);
    }
  }

  async function handleResendOTP() {
    if (countdown > 0 || loading) return;
    setError(null);
    setLoading(true);

    const result = await requestPasswordReset(email);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      if (result.otp) {
        setDevOtpNotification(result.otp);
      }
      setCountdown(60);
    }
  }

  async function handleVerifyAndReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP code.");
      return;
    }

    if (!hasLength || !hasUpper || !hasLower || !hasNumber) {
      setError("Please ensure your new password meets all complexity requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await resetPasswordWithOTP(email, otp, newPassword, confirmPassword);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-950 font-sans">
      {/* Left Showcase Panel */}
      <div className="hidden lg:flex lg:col-span-7 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-r border-slate-800">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
            <Boxes className="w-6 h-6" />
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">StockSense</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Account Security & Verification</span>
          </div>

          <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
            Seamless OTP-based credential recovery.
          </h2>

          <p className="text-base text-slate-400 leading-relaxed">
            Verify your identity with time-limited one-time password security to regain access to your warehouse inventory controls.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-800/60">
          <span>© 2026 StockSense Systems</span>
          <span>Encrypted Session Management</span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="col-span-1 lg:col-span-5 flex flex-col justify-center px-6 sm:px-12 py-10 bg-slate-900/40">
        <div className="w-full max-w-md mx-auto space-y-5">
          <div className="space-y-1.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2">
              <KeyRound className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {step === "request" ? "Reset your password" : "Enter verification code"}
            </h1>
            <p className="text-xs text-slate-400">
              {step === "request"
                ? "Enter your work email to receive a 6-digit OTP verification code."
                : `Enter the code sent to ${email} and set your new password.`}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
              {error}
            </div>
          )}

          {/* Development Mode OTP Display */}
          {devOtpNotification && (
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 flex items-center justify-between">
              <div>
                <p className="font-semibold">Simulated Email OTP Code:</p>
                <p className="font-mono text-base font-bold tracking-widest text-white mt-0.5">
                  {devOtpNotification}
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                Valid 10m
              </span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Password successfully reset! Redirecting to login...</span>
            </div>
          )}

          {step === "request" ? (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="h-11 pl-10 text-xs rounded-xl bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Generating OTP..." : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndReset} className="space-y-3.5">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                    6-Digit OTP Code
                  </label>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || loading}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 disabled:text-slate-600 flex items-center gap-1"
                  >
                    <RotateCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                    <span>{countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}</span>
                  </button>
                </div>
                <Input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="h-11 text-center font-mono tracking-widest text-lg font-bold rounded-xl bg-slate-900 border-slate-800 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 pl-10 text-xs rounded-xl bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Password complexity pills */}
              {newPassword.length > 0 && (
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className={`flex items-center gap-1.5 ${hasLength ? "text-emerald-400" : "text-slate-500"}`}>
                    {hasLength ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span>8+ Chars</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-400" : "text-slate-500"}`}>
                    {hasUpper ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span>Uppercase</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLower ? "text-emerald-400" : "text-slate-500"}`}>
                    {hasLower ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span>Lowercase</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-400" : "text-slate-500"}`}>
                    {hasNumber ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span>Number</span>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`h-10 pl-10 text-xs rounded-xl bg-slate-900 border text-white placeholder:text-slate-600 transition-all ${
                      confirmPassword.length > 0
                        ? passwordsMatch
                          ? "border-emerald-500/50"
                          : "border-rose-500/50"
                        : "border-slate-800"
                    }`}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || success}
                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-3"
              >
                {loading ? "Resetting Password..." : "Confirm & Reset Password"}
              </Button>

              <button
                type="button"
                onClick={() => setStep("request")}
                className="w-full text-xs text-center text-slate-500 hover:text-slate-300 py-1"
              >
                ← Change email address
              </button>
            </form>
          )}

          <div className="pt-3 border-t border-slate-800/80 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
