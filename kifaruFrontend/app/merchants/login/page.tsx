"use client";

import React, { useState } from "react";
import axios from "axios";
import { openNotification } from "../../utilis/notification"; 
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";


const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const merchantEmail = formData.get("merchantEmail")?.toString().trim();
    const password = formData.get("password")?.toString().trim();

    if (!merchantEmail || !password) {
      setError("Merchant email and password are required.");
      openNotification("Merchant email and password are required.", "error");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(merchantEmail)) {
      setError("Please enter a valid merchant email.");
      openNotification("Please enter a valid merchant email", "error");
      return;
    }

    setError(null);

    try {
      const res = await axios.post("https://kifaruswypt.onrender.com/auth/login", { merchantEmail, password });

      if (res?.data?.message) {
        openNotification(res.data.message, "success");
        router.push("/merchants/dashboard");

        const token = res.data.token;
        if (token) {
          localStorage.setItem("merchantToken", token);

            const decoded :any= jwtDecode(token);
            const merchant_id =decoded.merchant_id || decoded.merchant_id || decoded.sub || "Unknown merchant_id";
          localStorage.setItem("merchant_id", merchant_id);

          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        }
        fetchWalletAddressed();
      }
    } catch (err: any) {
      const message = err.response?.data?.error || "Login failed.";
      setError(message);
      openNotification(message, "error");
    }
  };

   const fetchWalletAddressed = async () => {
      const token = localStorage.getItem('token'); // Or whatever key you're storing the token under

      const merchant_id = localStorage.getItem('merchant_id')
  
      try {
        const response = await axios.get(`https://kifaruswypt.onrender.com/getWallet/${merchant_id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` // If your API uses auth
          },
        });
        console.log('Fetched address:', response.data.wallet_address);
        localStorage.setItem('your_wallet_address', response.data.wallet_address);
      }
       catch (error) {
        console.error('Error fetching wallet address:', error);
      }
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 relative z-10">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 opacity-50"></div>
      <div className="relative z-20 w-full max-w-md p-6 bg-white rounded-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="merchantEmail" className="block text-sm font-medium text-gray-700">Merchant Email</label>
            <input
              type="email"
              id="merchantEmail"
              name="merchantEmail"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your merchant email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
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
            Log In
          </button>
        </form>
         <p className="mt-4 text-center text-sm text-gray-600">
          no account?{" "}
          <a href="/merchants/signUp" className="text-purple-700 font-semibold hover:underline">
            Sign up
          </a>
        </p>

      </div>
    </div>
  );
};
export default LoginPage;
