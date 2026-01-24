// app/register/components/BasicInfoForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { RegistrationData } from "../page";

interface BasicInfoFormProps {
  onSubmit: (data: RegistrationData) => void;
}

export default function BasicInfoForm({ onSubmit }: BasicInfoFormProps) {
  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    llmEndpoint: "",
    api_key: "",
    model: "",
    webhookEndpoint: "",
  });

  const [openInfo, setOpenInfo] = useState<null | "llm" | "webhook">(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    onSubmit(form);
  };

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-3 bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Register Organization
          </h1>
          <p className="text-gray-400 text-lg">
            Step 1 of 2: Basic Information
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company Name
              </label>
              <input
                className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                name="company_name"
                placeholder="Enter your company name"
                onChange={handleChange}
                value={form.company_name}
                required
              />
            </div>

            {/* Contact Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contact Name
              </label>
              <input
                className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                name="contact_name"
                placeholder="Enter your full name"
                onChange={handleChange}
                value={form.contact_name}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                name="email"
                type="email"
                placeholder="your.email@company.com"
                onChange={handleChange}
                value={form.email}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  onChange={handleChange}
                  value={form.password}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  onChange={handleChange}
                  value={form.confirmPassword}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">
                LLM Configuration
              </h3>
            </div>

            {/* LLM Endpoint */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                LLM Endpoint URL
              </label>
              <div className="relative">
                <input
                  className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  name="llmEndpoint"
                  placeholder="https://api.example.com/v1/chat"
                  onChange={handleChange}
                  value={form.llmEndpoint}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors text-lg"
                  onClick={() => setOpenInfo(openInfo === "llm" ? null : "llm")}
                >
                  ℹ️
                </button>

                {openInfo === "llm" && (
                  <div className="absolute right-0 top-full mt-2 z-10 w-80 text-sm border border-gray-700 bg-gray-900 text-gray-300 rounded-lg p-4 shadow-xl">
                    <p className="font-semibold mb-2 text-white">LLM Endpoint</p>
                    <p className="mb-2">
                      Your LLM API endpoint. In the next step, you'll configure the exact request format.
                    </p>
                    <ul className="list-disc ml-4 mt-2 space-y-1 text-gray-400">
                      <li>Must be HTTPS</li>
                      <li>We'll test it in the next step</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                LLM API Key
              </label>
              <input
                className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                name="api_key"
                type="password"
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxx"
                onChange={handleChange}
                value={form.api_key}
                required
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Model Name{" "}
                <span className="font-light text-xs text-gray-500">(optional)</span>
              </label>
              <input
                className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                name="model"
                type="text"
                placeholder="llama-3.1-8b-instant"
                onChange={handleChange}
                value={form.model}
              />
              <p className="text-xs text-blue-400 mt-1">Only if required in your API payload</p>
            </div>

            {/* Webhook Endpoint */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Webhook Endpoint URL{" "}
                <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  name="webhookEndpoint"
                  placeholder="https://your-domain.com/webhook"
                  onChange={handleChange}
                  value={form.webhookEndpoint}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors text-lg"
                  onClick={() =>
                    setOpenInfo(openInfo === "webhook" ? null : "webhook")
                  }
                >
                  ℹ️
                </button>

                {openInfo === "webhook" && (
                  <div className="absolute right-0 top-full mt-2 z-10 w-80 text-sm border border-gray-700 bg-gray-900 text-gray-300 rounded-lg p-4 shadow-xl">
                    <p className="font-semibold mb-2 text-white">
                      Webhook Endpoint{" "}
                      <span className="text-yellow-500">(Optional)</span>
                    </p>
                    <p className="mb-2">
                      We'll send adapter file URL with HMAC signature when new adapters are ready
                    </p>
                    <ul className="list-disc ml-4 mt-2 space-y-1 text-gray-400">
                      <li>We can also send via email</li>
                      <li>Must be publicly accessible</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-400 rounded-lg p-4">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              type="submit"
            >
              Continue to LLM Configuration →
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}