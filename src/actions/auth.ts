"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import pool from "@/lib/db";
import bcrypt from "bcrypt";

// Interface for OTP memory cache
interface OTPRecord {
  otp: string;
  expiresAt: number;
  attempts: number;
  userId?: number;
}

const otpStore = new Map<string, OTPRecord>();

// Helper for strict password complexity validation (Async for Server Action compatibility)
export async function validatePasswordStrength(password: string): Promise<{
  isValid: boolean;
  message?: string;
}> {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long." };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number." };
  }
  return { isValid: true };
}

// 1. Direct Sign In Action (Compatibility)
export async function authenticate(formData: FormData) {
  try {
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Please provide both email and password." };
    }

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email address or password." };
        default:
          return { error: "Authentication failed. Please check your credentials." };
      }
    }
    return { error: "Invalid email or password." };
  }
}

// 2. Step 1 of Login: Verify credentials & Dispatch 2FA OTP
export async function initiateLogin(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  try {
    const result = await pool.query(
      "SELECT id, login_id, email, password_hash FROM users WHERE email = $1 LIMIT 1",
      [email]
    );
    const user = result.rows[0];

    if (!user || !user.password_hash) {
      return { error: "Invalid email address or password." };
    }

    const passwordsMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordsMatch) {
      return { error: "Invalid email address or password." };
    }

    // Credentials are valid -> Generate 6-digit Login OTP (Valid for 10 mins)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(email, { otp, expiresAt, attempts: 0, userId: user.id });

    // Simulated Email Dispatch System
    console.log("=================================================");
    console.log(`🔐 [StockSense 2FA Mailer] Login OTP Verification`);
    console.log(`To: ${email}`);
    console.log(`Security Code: ${otp}`);
    console.log(`Valid for: 10 minutes`);
    console.log("=================================================");

    return {
      success: true,
      requireOtp: true,
      email,
      otp,
    };
  } catch (error) {
    console.error("Initiate login error:", error);
    return { error: "Authentication service error. Please try again." };
  }
}

// 3. Step 2 of Login: Verify OTP & Establish Session
export async function verifyLoginOTP(email: string, otp: string) {
  const cleanEmail = email.trim().toLowerCase();
  const record = otpStore.get(cleanEmail);

  if (!record) {
    return { error: "Session expired or no OTP requested. Please try logging in again." };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    return { error: "OTP code has expired. Please request a new one." };
  }

  if (record.attempts >= 5) {
    otpStore.delete(cleanEmail);
    return { error: "Too many failed attempts. Please restart the sign-in process." };
  }

  if (record.otp !== otp.trim()) {
    record.attempts += 1;
    otpStore.set(cleanEmail, record);
    return { error: `Invalid OTP code. (${5 - record.attempts} attempts remaining)` };
  }

  try {
    await signIn("credentials", {
      email: cleanEmail,
      redirect: false,
    });

    otpStore.delete(cleanEmail);
    return { success: true };
  } catch (error) {
    console.error("Login verification error:", error);
    return { error: "Failed to establish login session." };
  }
}

// 4. User Registration Action
export async function registerUser(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Please enter a valid work email address." };
  }

  if (confirmPassword && password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const strength = await validatePasswordStrength(password);
  if (!strength.isValid) {
    return { error: strength.message };
  }

  try {
    const existing = await pool.query(
      "SELECT id, email, login_id FROM users WHERE email = $1 OR login_id = $2 LIMIT 1",
      [email, name]
    );

    if (existing.rows.length > 0) {
      const match = existing.rows[0];
      if (match.email === email) {
        return { error: "An account with this email address already exists." };
      }
      return { error: "This username / Login ID is already taken." };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (login_id, email, password_hash) VALUES ($1, $2, $3)",
      [name, email, passwordHash]
    );

    return { success: true };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { error: "Failed to create account. Please try again." };
  }
}

// 5. Request OTP for Password Reset
export async function requestPasswordReset(email: string) {
  const cleanEmail = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { error: "Please provide a valid email address." };
  }

  try {
    const userCheck = await pool.query(
      "SELECT id, login_id FROM users WHERE email = $1 LIMIT 1",
      [cleanEmail]
    );

    if (userCheck.rows.length === 0) {
      return { error: "No registered StockSense account found with this email." };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(cleanEmail, { otp, expiresAt, attempts: 0 });

    console.log("=================================================");
    console.log(`📧 [StockSense Reset Mailer] Password Reset OTP Request`);
    console.log(`To: ${cleanEmail}`);
    console.log(`Security Code: ${otp}`);
    console.log(`Valid for: 10 minutes`);
    console.log("=================================================");

    return {
      success: true,
      message: `A 6-digit security code has been sent to ${cleanEmail}.`,
      otp,
    };
  } catch (error) {
    console.error("Request OTP error:", error);
    return { error: "Failed to send reset code. Please try again." };
  }
}

// 6. Verify OTP and Reset Password
export async function resetPasswordWithOTP(
  email: string,
  otp: string,
  newPassword: string,
  confirmPassword?: string
) {
  const cleanEmail = email.trim().toLowerCase();

  if (confirmPassword && newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const strength = await validatePasswordStrength(newPassword);
  if (!strength.isValid) {
    return { error: strength.message };
  }

  const record = otpStore.get(cleanEmail);
  if (!record) {
    return { error: "No active reset request found. Please request a new OTP code." };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    return { error: "The OTP code has expired. Please request a new one." };
  }

  if (record.attempts >= 5) {
    otpStore.delete(cleanEmail);
    return { error: "Too many failed attempts. For security, please request a new OTP." };
  }

  if (record.otp !== otp.trim()) {
    record.attempts += 1;
    otpStore.set(cleanEmail, record);
    return {
      error: `Invalid OTP code. (${5 - record.attempts} attempts remaining)`,
    };
  }

  try {
    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE email = $2",
      [newHash, cleanEmail]
    );

    otpStore.delete(cleanEmail);
    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return { error: "Failed to update password. Please try again." };
  }
}