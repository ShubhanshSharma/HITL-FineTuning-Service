"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ModelVersion {
  id: string;
  version: number;
  adapter_url: string;
  json_url: string;
  row_count: number;
  adapter_config: Record<string, any>;
}

export default function ModelVersionsPage() {
  const [models, setModels] = useState<ModelVersion[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelVersion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/model_version/get-models`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch models");
      }

      const data = await res.json();
      setModels(data);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
        toastId: "fetch-error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModelClick = (model: ModelVersion) => {
    setSelectedModel(model);
  };

  const handleBackClick = () => {
    setSelectedModel(null);
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      toast.info("Starting download...", {
        position: "top-right",
        autoClose: 2000,
        toastId: "download-start",
      });

      const response = await fetch(url);
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Download completed!", {
        position: "top-right",
        autoClose: 2000,
        toastId: "download-success",
      });
    } catch (error) {
      toast.error("Download failed. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        toastId: "download-error",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen font-sans bg-black flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-500"
            viewBox="0 0 24 24"
          >
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
          <p className="text-gray-400">Loading model versions...</p>
        </div>
      </div>
    );
  }

  // Detail View
  if (selectedModel) {
    return (
      <div className="min-h-screen font-sans bg-black py-12 px-4">
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

        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBackClick}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Models
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Training Version {selectedModel.version}
            </h1>
            <p className="text-gray-500 text-sm">ID: {selectedModel.id}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                  Version
                </span>
              </div>
              <p className="text-3xl font-bold text-white">
                v{selectedModel.version}
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                  Training Rows
                </span>
              </div>
              <p className="text-3xl font-bold text-white">
                {selectedModel?.row_count?.toLocaleString() == null
                  ? "0"
                  : selectedModel?.row_count?.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Download Section */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
              Download Model Files
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* LoRA Adapter */}
              <button
                disabled={!selectedModel?.adapter_url}
                onClick={() =>
                  selectedModel?.adapter_url &&
                  handleDownload(
                    selectedModel.adapter_url,
                    `lora_adapter_v${selectedModel.version}.safetensors`
                  )
                }
                className={`rounded-xl p-6 transition-all duration-200 flex items-center gap-4 group
        ${
          selectedModel?.adapter_url
            ? "bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
        }`}
              >
                <div className="p-3 bg-white/10 rounded-lg">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">LoRA Adapter</h3>
                  <p className="text-sm">
                    {selectedModel?.adapter_url
                      ? "SafeTensors format zip"
                      : "Not available"}
                  </p>
                </div>
              </button>

              {/* Config JSON */}
              <button
                disabled={!selectedModel?.json_url}
                onClick={() =>
                  selectedModel?.json_url &&
                  handleDownload(
                    selectedModel.json_url,
                    `adapter_config_v${selectedModel.version}.json`
                  )
                }
                className={`rounded-xl p-6 transition-all duration-200 flex items-center gap-4 group
        ${
          selectedModel?.json_url
            ? "bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
            : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
        }`}
              >
                <div className="p-3 bg-white/10 rounded-lg">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">JSONL</h3>
                  <p className="text-sm">
                    {selectedModel?.json_url ? "JSONL format" : "Not available"}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Adapter Config */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Adapter Configuration
              </h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(selectedModel.adapter_config, null, 2)
                  );
                  toast.success("Configuration copied to clipboard!", {
                    position: "top-right",
                    autoClose: 1500,
                    toastId: "copy-config",
                  });
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-800/50"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy JSON
              </button>
            </div>

            <div className="space-y-3">
              {selectedModel.adapter_config &&
                Object.entries(selectedModel.adapter_config).map(
                  ([key, value]) => {
                    const isObject =
                      typeof value === "object" && value !== null;
                    const isArray = Array.isArray(value);

                    return (
                      <div
                        key={key}
                        className="bg-linear-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-5 border border-gray-700/50 hover:border-gray-600/50 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-sm font-medium text-purple-400">
                                  {key
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </span>
                                {isArray && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    Array [{value.length}]
                                  </span>
                                )}
                                {isObject && !isArray && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    Object
                                  </span>
                                )}
                              </div>
                            </div>

                            {isObject ? (
                              <details className="group">
                                <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300 transition-colors flex items-center gap-2 select-none">
                                  <svg
                                    className="w-3.5 h-3.5 transition-transform group-open:rotate-90"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                  <span className="font-mono text-xs">
                                    {isArray
                                      ? `[${value.length} items]`
                                      : `{${
                                          Object.keys(value).length
                                        } properties}`}
                                  </span>
                                </summary>
                                <pre className="mt-3 bg-black/40 rounded-lg p-3 overflow-x-auto text-xs text-gray-300 border border-gray-700/50">
                                  {JSON.stringify(value, null, 2)}
                                </pre>
                              </details>
                            ) : (
                              <div className="flex items-center gap-3">
                                <code className="text-base font-semibold text-white">
                                  {String(value)}
                                </code>
                                {typeof value === "number" && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                                    Number
                                  </span>
                                )}
                                {typeof value === "boolean" && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                    Boolean
                                  </span>
                                )}
                                {typeof value === "string" && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                    String
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                isObject
                                  ? JSON.stringify(value, null, 2)
                                  : String(value)
                              );
                              toast.success(`${key} copied!`, {
                                position: "top-right",
                                autoClose: 1000,
                                toastId: `copy-${key}`,
                              });
                            }}
                            className="text-gray-500 hover:text-gray-300 transition-colors p-1.5 hover:bg-gray-700/30 rounded"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="min-h-screen font-sans bg-black py-12 px-4">
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

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Training History
          </h1>
          <p className="text-gray-500 text-sm">
            View and manage all trained LoRA adapters
          </p>
        </div>

        {/* Models List */}
        {models.length === 0 ? (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-12 text-center">
            <div className="text-gray-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No Models Found
            </h3>
            <p className="text-gray-600">
              Train your first model to see it listed here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <div
                key={model.id}
                onClick={() => handleModelClick(model)}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 hover:border-blue-500 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                      <svg
                        className="w-6 h-6 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Version {model.version}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {model.row_count==null? "0" : model.row_count?.toLocaleString()} rows
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <span className="text-gray-400 truncate">
                      {model.id.substring(0, 8)}...
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                      />
                    </svg>
                    <span className="text-gray-400">
                      LoRA Adapter
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800">
                  <span className="text-xs text-gray-500">
                    Click to view details
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}