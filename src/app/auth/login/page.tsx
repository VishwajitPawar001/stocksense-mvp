"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initiateLogin, verifyLoginOTP } from "@/actions/auth";
import {
  Boxes,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Mail,
  Lock,
  Sparkles,
  KeyRound,
  RotateCw,
  ArrowLeft,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [devOtpNotification, setDevOtpNotification] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Step 1: Verify Password & Request OTP
  async function handleCredentialsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await initiateLogin(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.requireOtp) {
      if (result.otp) {
        setDevOtpNotification(result.otp);
      }
      setStep("otp");
      setCountdown(60);
    }
  }

  // Step 2: Verify OTP & Sign In
  async function handleOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit security code.");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await verifyLoginOTP(email, otp);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function handleResendLoginOTP() {
    if (countdown > 0 || loading) return;
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await initiateLogin(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.otp) {
      setDevOtpNotification(result.otp);
      setCountdown(60);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-950 font-sans">
      {/* Left Panel: Hero Narrative */}
      <div className="hidden lg:flex lg:col-span-7 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-r border-slate-800">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-white tracking-tight">StockSense</span>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Enterprise IMS
            </span>
          </div>
        </div>

        {/* Narrative */}
        <div className="relative z-10 space-y-6 max-w-lg my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Two-Factor Verified Access</span>
          </div>

          <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
            Precision stock tracking for modern logistics teams.
          </h2>

          <p className="text-base text-slate-400 leading-relaxed">
            Replace manual registers and spreadsheets with a centralized, real-time platform secured by two-factor authentication and PostgreSQL ACID transactions.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>2FA Security</span>
              </div>
              <p className="text-xs text-slate-400">Time-limited OTP verification on login.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                <span>Zero Overselling</span>
              </div>
              <p className="text-xs text-slate-400">Pessimistic row locking on shipments.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-800/60">
          <span>© 2026 StockSense Systems</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PostgreSQL Engine Online</span>
          </div>
        </div>
      </div>

      {/* Right Panel: 2-Step Login Form */}
      <div className="col-span-1 lg:col-span-5 flex flex-col justify-center px-6 sm:px-12 py-10 bg-slate-900/40">
        <div className="w-full max-w-md mx-auto space-y-5">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {step === "credentials" ? "Sign in to StockSense" : "Security Verification"}
            </h1>
            <p className="text-xs text-slate-400">
              {step === "credentials"
                ? "Enter your email and password to proceed to 2FA verification"
                : `Enter the 6-digit security code sent to ${email}`}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
              {error}
            </div>
          )}

          {/* Dev OTP Simulated Banner */}
          {devOtpNotification && step === "otp" && (
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

          {step === "credentials" ? (
            <form onSubmit={handleCredentialsSubmit} autoComplete="off" className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="off"
                    placeholder="name@company.com"
                    className="h-10 pl-10 text-xs rounded-xl bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="h-10 pl-10 text-xs rounded-xl bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-3"
              >
                {loading ? "Checking credentials..." : (
                  <>
                    <span>Continue with 2FA</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} autoComplete="off" className="space-y-3.5">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                    6-Digit Security OTP
                  </label>
                  <button
                    type="button"
                    onClick={handleResendLoginOTP}
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
                  autoComplete="one-time-code"
                  placeholder="123456"
                  className="h-11 text-center font-mono tracking-widest text-lg font-bold rounded-xl bg-slate-900 border-slate-800 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-3"
              >
                {loading ? "Verifying OTP..." : "Verify & Sign In"}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setOtp("");
                  setError(null);
                }}
                className="w-full text-xs text-center text-slate-500 hover:text-slate-300 py-1"
              >
                ← Back to Email & Password
              </button>
            </form>
          )}

          <div className="pt-3 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Don't have an account yet?{" "}
              <Link
                href="/auth/signup"
                className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}