"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
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

  const router = useRouter();

  const [openInfo, setOpenInfo] = useState<null | "llm" | "webhook">(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const payload = {
      company_name: form.company_name,
      contact_name: form.contact_name,
      email: form.email,
      password: form.password,
      LLM_endpoint: form.llmEndpoint,
      llm_api_key: form.api_key,
      model: form.model,
      webhook_endpoint: form.webhookEndpoint ? form.webhookEndpoint : null,
    };

    const register_route = process.env.NEXT_PUBLIC_SERVER_URL;
    const res = await fetch(`${register_route}/v1/org/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(`Registration failed:- ${data.detail}`);
      return;
    }

    localStorage.setItem("token", data.data.access_token);

    setSuccess(true);
    setMessage(data.message);

    setTimeout(() => {
      router.push("/chat");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black font-sans text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Register Organization
          </h1>
          <p className="text-gray-400 text-lg">
            Fill necessary information to interact with your LLM
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
                      This endpoint is used by our system to send prompts to your LLM.
                      This will be used to create <b>JSONL</b>
                    </p>
                    <ul className="list-disc ml-4 mt-2 space-y-1 text-gray-400">
                      <li>Must accept POST requests</li>
                      <li>Payload will include prompt + metadata</li>
                      <li>Should return the model response as JSON</li>
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
                type="text"
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxx"
                onChange={handleChange}
                required
              />
            </div>

            {/* model */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Model (option)
              </label>
              <input
                className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                name="model"
                type="text"
                placeholder="llama-3.1-8b-instant"
                onChange={handleChange}
                required
              />
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
                      We will send adapter file URL with HMAC signature to this
                      endpoint when you want to trigger reloading new adapters to
                      your LLM
                    </p>
                    <ul className="list-disc ml-4 mt-2 space-y-1 text-gray-400">
                      <li>
                        Totally optional. We can also send you the adapter via mail
                      </li>
                      <li>This endpoint must be publicly accessible</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-400 rounded-lg p-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-900/20 border border-green-500 text-green-400 rounded-lg p-4">
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              type="submit"
            >
              Register Organization
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