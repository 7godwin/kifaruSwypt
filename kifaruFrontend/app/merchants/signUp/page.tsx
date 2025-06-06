"use client";

import React, { useState } from "react";
import axios from "axios";
import { openNotification } from "../../utilis/notification";
import { useRouter } from "next/navigation";

const SignupPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const merchantUserName = formData.get("merchantUserName")?.toString().trim();
    const merchantEmail = formData.get("merchantEmail")?.toString().trim();
    const password = formData.get("password")?.toString().trim();

    if (!merchantUserName || !merchantEmail || !password) {
      const msg = "All fields are required.";
      setError(msg);
      openNotification(msg, "error");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(merchantEmail)) {
      const msg = "Please enter a valid email address.";
      setError(msg);
      openNotification(msg, "error");
      return;
    }

    setError(null);

    try {
      const res = await axios.post("https://kifaruswypt.onrender.com/signup", {
        merchantUserName,
        merchantEmail,
        password,
      });

      if (res?.data?.message) {
        openNotification(res.data.message, "success");
        router.push("/merchants/login"); // Redirect to login after signup
      }
    } catch (err: any) {
      const message = err.response?.data?.error || "Signup failed.";
      setError(message);
      openNotification(message, "error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 relative z-10">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 opacity-50"></div>
      <div className="relative z-20 w-full max-w-md p-6 bg-white rounded-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Sign Up</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="merchantUserName" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="merchantUserName"
              name="merchantUserName"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label htmlFor="merchantEmail" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="merchantEmail"
              name="merchantEmail"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/merchants/login" className="text-purple-700 font-semibold hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
