import React, { useState } from "react";
import supabase from "../config/supabase-client";
import { useNavigate } from "react-router-dom";

function Auth() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isSignUp) {
        const samePassword = password === confirmPassword;
        if (!samePassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password: samePassword ? password : undefined,
        });

        if (error) {
          setError(error.message);
          return; // Stop here if there is an error
        }

        // Important: Supabase returns a 'user' even if email confirmation is required,
        // but if the 'identities' array is empty, the user already exists.
        if (
          data.user &&
          data.user.identities &&
          data.user.identities.length === 0
        ) {
          setError("User already exists. Try signing in.");
          return;
        }

        // If email confirmation is ON, they don't have a session yet.
        setSuccess(
          "Registration successful! Please check your email for a confirmation link."
        );
        setIsSignUp(false); // Move them to sign in screen instead of home
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Specifically check for common login errors
          if (error.message.includes("Invalid login credentials")) {
            setError("Wrong email or password.");
          } else {
            setError(error.message);
          }
          return; // Stop here! Do not navigate.
        }

        if (data?.session) {
          navigate("/"); // Only navigate if session exists
        }
      }
    } catch (err) {
      setError("An unexpected error occurred.", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-900 via-slate-900 to-indigo-800">
      <div className="bg-[#1e293b] p-8 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-indigo-500 tracking-tighter mb-2">
            RENT<span className="text-white">X</span>
          </h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 text-white"
              placeholder="you@email.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 text-white"
              placeholder="Password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
          </div>
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 text-white"
                placeholder="Password"
                autoComplete="new-password"
              />
            </div>
          )}
          {error && (
            <div className="text-red-500 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm font-bold text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-500 bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-sm font-bold text-center">
              {success}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-white text-lg disabled:opacity-60"
          >
            {loading
              ? isSignUp
                ? "Signing up..."
                : "Signing in..."
              : isSignUp
              ? "Sign up"
              : "Sign in"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-indigo-400 hover:text-indigo-300 font-bold text-sm"
            onClick={() => setIsSignUp((v) => !v)}
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Create a new account"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
