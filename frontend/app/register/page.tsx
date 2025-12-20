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
    webhookEndpoint: "",
  });
  
  const router = useRouter()

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
      company_name: form.contact_name,
      contact_name: form.contact_name,
      email: form.email,
      password: form.password,
      LLM_endpoint: form.llmEndpoint,
      webhook_endpoint: form.webhookEndpoint ? form.webhookEndpoint: null,
    };
    // console.log("server url:-", process.env.NEXT_PUBLIC_SERVER_URL)
    const register_route = process.env.NEXT_PUBLIC_SERVER_URL
    const res = await fetch(`${register_route}/v1/org/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json()

    if (!res.ok) {
      setError(`Registration failed:- ${data.detail}`);
      return;
    }
    console.log(data);

    console.log(payload);

    setSuccess(true);
    setMessage(data.message)

    setTimeout(() => {
      router.push("/chat")
    }, 2000);
  };

  return (
    <div className=" font-sans flex flex-col justify-center items-start bg-black min-h-screen px-4 md:px-16 ">
      <h1 className=" font-bold text-3xl">Register Organization</h1>
      <h1 className=" text-gray-400 text-lg">
        Fill necessary information to interact with your db
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-10">
        <input
          className=" font-extralight text-sm border border-gray-500 py-2 px-4 rounded-full w-xl min-w-md"
          name="company_name"
          placeholder="Company Name"
          onChange={handleChange}
          required
        />

        <input
          className=" font-extralight text-sm border border-gray-500 py-2 px-4 rounded-full w-xl min-w-md"
          name="contact_name"
          placeholder="Contact Name"
          onChange={handleChange}
          required
        />

        <input
          className=" font-extralight text-sm border border-gray-500 py-2 px-4 rounded-full w-xl min-w-md"
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />

        {/* Password */}
        <div className="relative">
          <input
            className=" font-extralight text-sm border border-gray-500 py-2 px-4 rounded-full w-xl min-w-md"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <span
            className="absolute right-4 top-2 cursor-pointer select-none"
            onClick={() => setShowPassword(!showPassword)}
          >
            👁
          </span>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            className=" font-extralight text-sm border border-gray-500 py-2 px-4 rounded-full w-xl min-w-md"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            onChange={handleChange}
            required
          />
          <span
            className="absolute right-4 top-2 cursor-pointer select-none"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            👁
          </span>
        </div>

        {/* LLM Endpoint */}
        <div className="relative">
          <input
            className=" font-extralight text-sm border border-gray-500 py-2 px-4 rounded-full w-xl min-w-md"
            name="llmEndpoint"
            placeholder="LLM Endpoint URL - to chat with your llm"
            onChange={handleChange}
            required
          />

          <span
            className="absolute right-4 p-2 cursor-pointer select-none"
            // onMouseEnter={() => setOpenInfo("llm")}
            // onMouseLeave={() => setOpenInfo(null)}
            onClick={() => setOpenInfo(openInfo === "llm" ? null : "llm")}
          >
            ℹ
          </span>

          {openInfo === "llm" && (
            <div className="absolute right-0 top-12 z-10 w-80 text-sm border border-gray-600 bg-black text-gray-300 rounded-lg p-4">
              <p className="font-semibold mb-2">LLM Endpoint</p>
              <p>
                This endpoint is used by our system to send prompts to your LLM.
                This will be used to create <b>JSONL</b>
              </p>
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>Must accept POST requests</li>
                <li>Payload will include prompt + metadata</li>
                <li>Should return the model response as JSON</li>
              </ul>
            </div>
          )}
        </div>

        {/* Webhook Endpoint */}
        <div className="relative">
          <input
            className=" font-extralight text-sm border border-gray-500 py-2 px-4 rounded-full w-xl min-w-md"
            name="webhookEndpoint"
            placeholder="Webhook Endpoint URL"
            onChange={handleChange}
          />

          <span
            className="absolute right-4  p-2 cursor-pointer select-none"
            // onMouseEnter={() => setOpenInfo("webhook")}
            // onMouseLeave={() => setOpenInfo(null)}
            onClick={() =>
              setOpenInfo(openInfo === "webhook" ? null : "webhook")
            }
          >
            ℹ
          </span>

          {openInfo === "webhook" && (
            <div className="absolute right-0 top-12 z-10 w-80 text-sm border border-gray-600 bg-black text-gray-300 rounded-lg p-4">
              <p className="font-semibold mb-2">!optional</p>
              <p>We will send adapter file url with HMAC signature to this endpoint when you want to trigger reloading new adapters to your LLM</p>
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>totally optional. we can also send you the adapter via mail</li>
              </ul>
              <p className="mt-2">This endpoint must be publicly accessible.</p>
            </div>
          )}
        </div>

        <button
          className=" w-fit px-8 text-lg bg-white text-black font-light rounded-full py-2 mt-10 "
          type="submit"
        >
          Register
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{message}</p>}
    </div>
  );
}
