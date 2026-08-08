"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { Loader2, Moon, Sun } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
          // Simpan role ke cookie supaya middleware bisa redirect role-based
          const role = data.user.role?.role_name || "";
          Cookies.set("user_role", role, { expires: isChecked ? 7 : 1 });
        }
        window.location.href = (data.user?.role?.role_name === "forwarding") ? "/client" : "/";
      } else {
        setError(data.message || "Login failed");
        setIsLoading(false);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex w-full flex-1 flex-col lg:w-1/2">
      {/* ===== Mobile background: animated gradient ===== */}
      <div className="pointer-events-none fixed inset-0 z-0 lg:hidden" aria-hidden>
        <div className="animated-auth-bg absolute inset-0" />
        <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl dark:bg-[#0a0f1e]/70" />
      </div>

      {/* ===== Mobile: floating dark-mode toggle ===== */}
      <div className="fixed bottom-6 right-6 z-20 lg:hidden">
        <ThemeToggle />
      </div>

      <motion.div
        className="relative z-10 flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-5 sm:px-6"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <div>
          <div className="mb-5 sm:mb-8 text-center">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="lg:hidden flex justify-center mb-6"
            >
              <Image
                width={200}
                height={40}
                src="https://everwin-company-profile.vercel.app/_next/static/media/header_logo.50ada9d8.png"
                alt="Everwin Logo"
                className="object-contain dark:invert"
                unoptimized
              />
            </motion.div>
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In to WMS Logistics Portal
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your Username/Email and password to sign in!
            </p>
          </div>
          <div>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-3 text-sm text-error-700 bg-error-50 rounded-lg"
              >
                {error}
              </motion.div>
            )}
            <form onSubmit={handleLogin}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Username or Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="Enter your username or email"
                    type="text"
                    value={username}
                    onChange={(e: any) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e: any) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    href="#"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <Button className="w-full" size="sm" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account?{" "}
                <Link
                  href="#"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- Dark/Light toggle untuk mobile ---------- */
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white/80 text-gray-600 shadow-lg backdrop-blur-xl transition-all hover:scale-105 active:scale-95 dark:border-white/15 dark:bg-white/10 dark:text-gray-200"
      title="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}