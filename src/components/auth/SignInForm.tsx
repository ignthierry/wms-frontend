"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  AlertCircle,
  LogIn,
  Check,
} from "lucide-react";

/* ---------- Netflix-style staggered entrance ---------- */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 130, damping: 17 },
  },
};

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Masukkan username dan password terlebih dahulu");
      setShakeKey((k) => k + 1);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        Cookies.set("auth_token", data.access_token, { expires: isChecked ? 7 : 1 });
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          const role = data.user.role?.role_name || "";
          Cookies.set("user_role", role, { expires: isChecked ? 7 : 1 });
        }
        window.location.href = data.user?.role?.role_name === "forwarding" ? "/client" : "/";
      } else {
        setError(data.message || "Username atau password salah.");
        setIsLoading(false);
        setShakeKey((k) => k + 1);
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi. Silakan coba lagi.");
      setIsLoading(false);
      setShakeKey((k) => k + 1);
    }
  };

  const fieldBase =
    "peer h-[54px] w-full rounded-xl border px-4 pb-1.5 pt-5 text-sm font-medium shadow-sm outline-none transition-all duration-300 placeholder-transparent";

  return (
    <div className="relative flex w-full flex-1 flex-col overflow-hidden lg:w-1/2">
      {/* ===== Dekorasi background mobile (glow orbs) ===== */}
      <div className="pointer-events-none absolute inset-0 lg:hidden" aria-hidden>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="absolute -bottom-24 left-8 h-64 w-64 rounded-full bg-sky-400/15 blur-3xl"
        />
      </div>

      {/* ───── Card Utama ───── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-8 sm:px-6"
      >
        {/* Logo (mobile) */}
        <motion.div variants={fadeUp} className="mb-7 flex justify-center lg:hidden">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
          >
            <Image
              width={220}
              height={44}
              src="https://everwin-company-profile.vercel.app/_next/static/media/header_logo.50ada9d8.png"
              alt="Everwin Logo"
              className="object-contain dark:invert"
              unoptimized
            />
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="overflow-hidden rounded-3xl border border-brand-500/10 bg-white/75 p-6 shadow-2xl shadow-brand-900/5 backdrop-blur-2xl sm:p-8 dark:border-white/10 dark:bg-[#0b1220]/80 dark:shadow-black/40"
        >
          {/* Heading */}
          <div className="mb-7">
            <motion.span
              variants={fadeUp}
              className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-[11px] font-bold tracking-wide text-brand-600 dark:border-brand-400/20 dark:bg-brand-400/10 dark:text-brand-300"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Warehouse Portal
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="mb-1.5 text-2xl font-bold tracking-tight text-gray-800 dark:text-white sm:text-[28px]"
            >
              Welcome back 👋
            </motion.h1>
            <motion.p variants={fadeUp} className="text-sm text-gray-500 dark:text-gray-400">
              Masuk untuk memantau barang gudang Anda
            </motion.p>
          </div>

          <motion.form variants={fadeUp} onSubmit={handleLogin} className="space-y-5" noValidate>
            {/* Error banner + shake */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key={shakeKey}
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    x: [0, -7, 7, -5, 5, 0],
                  }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.45 }}
                  className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 px-3.5 py-3 text-[13px] font-medium text-rose-600 backdrop-blur dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Username / Email — floating label ala Netflix */}
            <div>
              <div className="group relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder=" "
                  autoComplete="username"
                  className={`${fieldBase} border-gray-300/70 bg-white text-gray-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:bg-black/25 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400/10`}
                />
                <label
                  className={`pointer-events-none absolute left-4 top-1/2 origin-left -translate-y-1/2 text-sm text-gray-400 transition-all duration-200 group-focus-within:top-[14px] group-focus-within:translate-y-0 group-focus-within:text-[11px] group-focus-within:font-semibold group-focus-within:text-brand-600 dark:group-focus-within:text-brand-300 ${
                    username
                      ? "top-[14px] translate-y-0 text-[11px] font-semibold text-brand-600 dark:text-brand-300"
                      : ""
                  }`}
                >
                  Username or Email
                </label>
              </div>
            </div>

            {/* Password — floating label */}
            <div>
              <div className="group relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  autoComplete="current-password"
                  className={`${fieldBase} border-gray-300/70 bg-white pr-12 text-gray-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:bg-black/25 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400/10`}
                />
                <label
                  className={`pointer-events-none absolute left-4 top-1/2 origin-left -translate-y-1/2 text-sm text-gray-400 transition-all duration-200 group-focus-within:top-[14px] group-focus-within:translate-y-0 group-focus-within:text-[11px] group-focus-within:font-semibold group-focus-within:text-brand-600 dark:group-focus-within:text-brand-300 ${
                    password
                      ? "top-[14px] translate-y-0 text-[11px] font-semibold text-brand-600 dark:text-brand-300"
                      : ""
                  }`}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 active:scale-90 dark:hover:bg-white/10 dark:hover:text-gray-200"
                >
                  {showPassword ? (
                    <Eye className="h-[18px] w-[18px]" />
                  ) : (
                    <EyeOff className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer select-none items-center gap-2.5">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isChecked}
                  onClick={() => setIsChecked(!isChecked)}
                  className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-200 active:scale-90 ${
                    isChecked
                      ? "border-brand-500 bg-brand-500 text-white shadow-sm shadow-brand-500/40"
                      : "border-gray-300 bg-white text-transparent dark:border-white/20 dark:bg-transparent"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-300">Ingat saya</span>
              </label>
              <Link
                href="#"
                className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
              >
                Lupa kata sandi?
              </Link>
            </div>

            {/* Submit — animasi shine */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.015 } : {}}
              whileTap={!isLoading ? { scale: 0.97 } : {}}
              className="group relative flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 bg-[length:200%_100%] bg-left px-5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition-all duration-500 hover:bg-right disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              {isLoading ? (
                <>
                  <Loader2 className="h-[18px] w-[18px] animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-[18px] w-[18px]" />
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Footer */}
          <motion.p
            variants={fadeUp}
            className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400"
          >
            Belum punya akun?{" "}
            <Link
              href="#"
              className="font-bold text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
            >
              Daftar
            </Link>
          </motion.p>
        </motion.div>

        {/* Tagline bawah */}
        <motion.p
          variants={fadeUp}
          className="mt-6 text-center text-[11px] tracking-wide text-gray-400 dark:text-gray-600"
        >
          WarehousePro Logistics Portal · v2
        </motion.p>
      </motion.div>
    </div>
  );
}