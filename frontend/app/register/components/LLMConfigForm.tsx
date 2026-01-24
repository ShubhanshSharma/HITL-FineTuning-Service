// app/register/components/LLMConfigForm.tsx
"use client";

import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RegistrationData } from "../page";

interface LLMConfigFormProps {
  registrationData: RegistrationData;
  onBack: () => void;
  onComplete: () => void;
}

interface RequestField {
  enabled: boolean;
  fieldName: string;
}

export default function LLMConfigForm({
  registrationData,
  onBack,
  onComplete,
}: LLMConfigFormProps) {
  // LLM Connection Details
  const [endpoint, setEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");

  // Configuration
  const [authHeader, setAuthHeader] = useState("Authorization");
  const [authPrefix, setAuthPrefix] = useState("Bearer ");
  
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(512);

  const [requestMapping, setRequestMapping] = useState({
    model: { enabled: true, fieldName: "model" },
    messages: { enabled: true, fieldName: "messages" },
    temperature: { enabled: true, fieldName: "temperature" },
    max_tokens: { enabled: true, fieldName: "max_tokens" },
  });

  const [responseMapping, setResponseMapping] = useState("choices[0].message.content");

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<boolean>(false);
  const [registering, setRegistering] = useState(false);

  const toggleField = (field: keyof typeof requestMapping) => {
    if (field === "messages") return; // messages is always required
    setRequestMapping((prev) => ({
      ...prev,
      [field]: { ...prev[field], enabled: !prev[field].enabled },
    }));
  };

  const updateFieldName = (field: keyof typeof requestMapping, newName: string) => {
    setRequestMapping((prev) => ({
      ...prev,
      [field]: { ...prev[field], fieldName: newName },
    }));
  };

  const buildRequestPayload = (testPrompt: string = "hi") => {
  const payload: any = {};

  // Add enabled fields
  if (requestMapping.messages.enabled) {
    payload[requestMapping.messages.fieldName] = [
      { role: "user", content: testPrompt },
    ];
  }

  if (requestMapping.model.enabled && model) {
    payload[requestMapping.model.fieldName] = model;
  }

  if (requestMapping.temperature.enabled) {
    payload[requestMapping.temperature.fieldName] = temperature;
  }

  if (requestMapping.max_tokens.enabled) {
    payload[requestMapping.max_tokens.fieldName] = maxTokens;
  }

  return payload;
};

const buildRequestHeaders = (maskApiKey: boolean = true) => {
  return {
    "Content-Type": "application/json",
    [authHeader]: `${authPrefix}${maskApiKey ? "***" : apiKey}`,
  };
};

const buildFullRequestPreview = () => {
  return {
    method: "POST",
    url: endpoint,
    headers: buildRequestHeaders(true),
    body: buildRequestPayload("hi"),
  };
};

  const handleTestConnection = async () => {
    if (!endpoint || !apiKey) {
      toast.error("Please provide endpoint and API key", {
        position: "top-right",
        autoClose: 2500,
        toastId: "validation-error",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);
    setTestSuccess(false);

    try {
      const payload = buildRequestPayload("hi");

      const res = await fetch(endpoint, {
        method: "POST",
        headers: buildRequestHeaders(false),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message ||
            errorData.message ||
            `HTTP ${res.status}: ${res.statusText}`
        );
      }

      const data = await res.json();

      // Extract text based on response_mapping path
      const pathParts = responseMapping.split(/\.|\[|\]/).filter((part) => part !== "");
      let extractedText: any = data;

      for (const part of pathParts) {
        if (extractedText === null || extractedText === undefined) {
          throw new Error(`Could not extract text: path stopped at "${part}"`);
        }
        const index = isNaN(Number(part)) ? part : Number(part);
        extractedText = extractedText[index];
      }

      if (!extractedText || typeof extractedText !== "string") {
        throw new Error(`Extracted value is not a valid text string. Path: ${responseMapping}`);
      }

      setTestResult(extractedText);
      setTestSuccess(true);
      toast.success("LLM connection successful!", {
        position: "top-right",
        autoClose: 2500,
        toastId: "test-success",
      });
    } catch (error: any) {
      setTestResult(`Error: ${error.message}`);
      setTestSuccess(false);
      toast.error(`Test failed: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
        toastId: "test-error",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleFinalSubmit = async () => {
    // Test connection again before registration
    setRegistering(true);
    
    try {
      // Test one more time
      const payload = buildRequestPayload("hi");
      const res = await fetch(endpoint, {
        method: "POST",
        headers: buildRequestHeaders(false),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Connection test failed. Please verify your configuration.");
      }

      const data = await res.json();
      const pathParts = responseMapping.split(/\.|\[|\]/).filter((part) => part !== "");
      let extractedText: any = data;
      for (const part of pathParts) {
        if (extractedText === null || extractedText === undefined) {
          throw new Error("Response mapping extraction failed");
        }
        const index = isNaN(Number(part)) ? part : Number(part);
        extractedText = extractedText[index];
      }

      if (!extractedText || typeof extractedText !== "string") {
        throw new Error("Invalid response format");
      }

      // If test passed, proceed with registration
      const registrationPayload = {
        company_name: registrationData.company_name,
        contact_name: registrationData.contact_name,
        email: registrationData.email,
        password: registrationData.password,
        webhook_endpoint: registrationData.webhookEndpoint || null,
        llm_config: {
          endpoint: endpoint,
          method: "POST",
          auth: {
            type: "bearer",
            header: authHeader,
            prefix: authPrefix,
          },
          api_key: apiKey,
          model: model || null,
          payload_defaults: {
            temperature: temperature,
            max_tokens: maxTokens,
          },
          request_mapping: Object.fromEntries(
            Object.entries(requestMapping)
              .filter(([_, value]) => value.enabled)
              .map(([key, value]) => [key, value.fieldName])
          ),
          response_mapping: {
            text: responseMapping,
          },
        },
      };

      const registerRes = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/org/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(registrationPayload),
        }
      );

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        throw new Error(registerData.detail || "Registration failed");
      }

      localStorage.setItem("token", registerData.data.access_token);

      toast.success("Registration successful!", {
        position: "top-right",
        autoClose: 2000,
        toastId: "register-success",
      });
      window.location.reload();
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error: any) {
      toast.error(`Registration failed: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
        toastId: "register-error",
      });
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        limit={3}
      />

      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Configure LLM Integration
          </h1>
          <p className="text-gray-400 text-lg">Step 2 of 2: Setup and test your LLM connection</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Configuration Form */}
          <div className="space-y-6">
            {/* Connection Details */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-4">Connection Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Endpoint URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://api.example.com/v1/chat/completions"
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be HTTPS</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    API Key <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="sk-xxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Model Name <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="gpt-4"
                  />
                </div>
              </div>
            </div>

            {/* Authentication */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-4">Authentication</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Header Name</label>
                  <select
                    value={authHeader}
                    onChange={(e) => setAuthHeader(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Authorization">Authorization</option>
                    <option value="X-API-Key">X-API-Key</option>
                    <option value="api-key">api-key</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Prefix</label>
                  <select
                    value={authPrefix}
                    onChange={(e) => setAuthPrefix(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Bearer ">Bearer </option>
                    <option value="Token ">Token </option>
                    <option value="">None</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 p-3 bg-gray-800/50 rounded text-xs text-gray-400">
                <span className="font-medium">Preview:</span> {authHeader}: {authPrefix}***
              </div>
            </div>

            {/* Payload Defaults */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-4">Default Parameters</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Temperature
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">0.0 - 1.0</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="512"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">1 - 512</p>
                </div>
              </div>
            </div>

            {/* Request Field Mapping */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-4">Request Field Mapping</h2>
              <p className="text-sm text-gray-400 mb-4">
                Configure which fields to include and their names in the API request
              </p>

              <div className="space-y-3">
                {Object.entries(requestMapping).map(([key, value]) => (
                  <div
                    key={key}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      value.enabled
                        ? "bg-blue-500/10 border-blue-500/30"
                        : "bg-gray-800/50 border-gray-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={value.enabled}
                      onChange={() => toggleField(key as keyof typeof requestMapping)}
                      disabled={key === "messages"}
                      className="w-4 h-4 rounded"
                    />
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">
                        {key} {key === "messages" && "(required)"}
                      </label>
                      <input
                        type="text"
                        value={value.fieldName}
                        onChange={(e) =>
                          updateFieldName(key as keyof typeof requestMapping, e.target.value)
                        }
                        disabled={!value.enabled}
                        className="w-full bg-gray-800 border border-gray-700 text-white py-2 px-3 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder={`Field name for ${key}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Mapping */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-4">Response Mapping</h2>
              <p className="text-sm text-gray-400 mb-4">Path to extract text from response</p>

              <input
                type="text"
                value={responseMapping}
                onChange={(e) => setResponseMapping(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="choices[0].message.content"
              />
              <p className="text-xs text-gray-500 mt-2">
                Use dot notation or bracket notation for nested fields
              </p>
            </div>

            {/* Test Button */}
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {testing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Testing Connection...
                </span>
              ) : (
                '🧪 Test Connection with "hi"'
              )}
            </button>

            {/* Test Result */}
            {testResult && (
              <div
                className={`rounded-lg p-4 ${
                  testSuccess
                    ? "bg-green-900/20 border border-green-500"
                    : "bg-red-900/20 border border-red-500"
                }`}
              >
                <p className={`font-semibold mb-2 ${testSuccess ? "text-green-400" : "text-red-400"}`}>
                  {testSuccess ? "✓ Success" : "✗ Failed"}
                </p>
                <p className={testSuccess ? "text-green-300" : "text-red-300"}>{testResult}</p>
              </div>
            )}
          </div>

          {/* Right: Live Preview */}
          <div className="lg:sticky lg:top-4 h-fit">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-4">Request Preview</h2>
              <p className="text-sm text-gray-400 mb-4">
                This is what will be sent to your LLM endpoint
              </p>

              <pre className="bg-black/50 rounded-lg p-4 overflow-x-auto text-sm text-gray-300 max-h-[600px] overflow-y-auto">
                {JSON.stringify(buildFullRequestPreview(), null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Final Submit */}
        {testSuccess && (
          <div className="mt-8">
            <button
              onClick={handleFinalSubmit}
              disabled={registering}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {registering ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Verifying and Registering...
                </span>
              ) : (
                "✓ Complete Registration"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}