"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Feedback {
  id: string;
  prompt: string;
  model_response: string;
  corrected_response: string | null;
  tags: string[];
  rating: number;
  timestamp: string;
}

interface TrainingStats {
  model: string;
  version: number;
  feedbacks: Feedback[];
}

export default function TrainingOrchestrationPage() {
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [trainingInProgress, setTrainingInProgress] = useState(false);

  useEffect(() => {
    fetchTrainingStats();
  }, []);

  const fetchTrainingStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/feedback/get-training-stats`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch training stats");
      }

      const data = await res.json();
      setStats(data);
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

  const startTraining = async () => {
    setTrainingInProgress(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/training/start-training`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to start training");
      }

      toast.success("Training started successfully!", {
        position: "top-right",
        autoClose: 3000,
        toastId: "training-success",
      });
    } catch (error: any) {
      toast.error(`Error: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
        toastId: "training-error",
      });
    } finally {
      setTrainingInProgress(false);
    }
  };

  const calculateStats = () => {
    if (!stats) return null;

    const totalFeedbacks = stats?.feedbacks?.length;

    // Tag counts
    const tagCounts: { [key: string]: number } = {};
    stats?.feedbacks?.forEach((feedback) => {
      feedback?.tags?.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Rating breakdown
    const ratingCounts: { [key: number]: number } = { "-1": 0, "0": 0, "1": 0 };
    stats?.feedbacks?.forEach((feedback) => {
      ratingCounts[feedback.rating] = (ratingCounts[feedback.rating] || 0) + 1;
    });

    // Correction stats
    const correctedCount = stats?.feedbacks?.filter(
      (f) => f.corrected_response
    ).length;
    const uncorrectedCount = totalFeedbacks - correctedCount;

    return {
      totalFeedbacks,
      tagCounts,
      ratingCounts,
      correctedCount,
      uncorrectedCount,
    };
  };

  const computed = calculateStats();

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
          <p className="text-gray-400">Loading training data...</p>
        </div>
      </div>
    );
  }

  if (!stats || !computed) {
    return (
      <div className="min-h-screen font-sans bg-black flex items-center justify-center px-4">
        <div className="text-center bg-gray-900/50 rounded-2xl border border-gray-800 p-12 max-w-md">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No Training Data Available
          </h3>
          <p className="text-gray-500">
            Unable to load training statistics. Please try again.
          </p>
        </div>
      </div>
    );
  }

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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Create JSONL
              </h1>
              <p className="text-gray-500 text-sm">
                system automatically checks and filters harmful or low-quality feedback to create clean JSONL file.
              </p>
            </div>
            <button
              onClick={startTraining}
              disabled={trainingInProgress || computed.totalFeedbacks === 0}
              className="px-8 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg shadow-green-500/20 disabled:shadow-none"
            >
              {trainingInProgress ? (
                <span className="flex items-center gap-2">
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
                  Creating...
                </span>
              ) : computed.totalFeedbacks <= 15 ? (
                <span className="flex items-center gap-2">
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
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Create <span className=" font-thin text-xs text-green-500">need {15 - computed.totalFeedbacks} more</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
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
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Create
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Model Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              </div>
              <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                Model
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.model}</p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <svg
                  className="w-5 h-5 text-purple-400"
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
            <p className="text-2xl font-bold text-white">v{stats.version}</p>
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
                Total Feedbacks
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {computed.totalFeedbacks}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Training Data Statistics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Ratings Breakdown */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-4">
                Ratings Distribution
              </h3>
              <div className="space-y-3">
                {[
                  { value: 1, label: "👍 Good", color: "from-green-500 to-emerald-500" },
                  { value: 0, label: "😐 Neutral", color: "from-yellow-500 to-orange-500" },
                  { value: -1, label: "👎 Bad", color: "from-red-500 to-rose-500" },
                ].map(({ value, label, color }) => {
                  const count = computed.ratingCounts[value] || 0;
                  const percentage = computed.totalFeedbacks > 0
                    ? ((count / computed.totalFeedbacks) * 100).toFixed(1)
                    : "0";
                  return (
                    <div key={value}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-300 text-sm">{label}</span>
                        <span className="text-gray-400 text-sm">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className={`bg-linear-to-r ${color} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tag Breakdown */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-4">
                Tag Distribution
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                {Object.entries(computed.tagCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([tag, count]) => {
                    const percentage = computed.totalFeedbacks > 0
                      ? ((count / computed.totalFeedbacks) * 100).toFixed(1)
                      : "0";
                    return (
                      <div key={tag}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-300 text-sm capitalize">
                            {tag.replace(/_/g, " ")}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-linear-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Correction Stats */}
          <div className="pt-6 border-t border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              Correction Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                <p className="text-sm text-gray-400 mb-1">With Corrections</p>
                <p className="text-2xl font-bold text-green-400">
                  {computed.correctedCount}
                </p>
              </div>
              <div className="bg-gray-500/10 rounded-xl p-4 border border-gray-500/20">
                <p className="text-sm text-gray-400 mb-1">Without Corrections</p>
                <p className="text-2xl font-bold text-gray-400">
                  {computed.uncorrectedCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedbacks List */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            Training Feedbacks ({stats?.feedbacks?.length})
          </h2>

          <div className="space-y-4">
            {stats?.feedbacks?.map((feedback, index) => (
              <div
                key={feedback.id}
                className="bg-black/50 rounded-xl border border-gray-800 hover:border-gray-700 p-6 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  {/* Index */}
                  <div className="shrink-0 w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 font-semibold">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    {/* Prompt */}
                    <div>
                      <label className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                        Prompt
                      </label>
                      <p className="text-gray-300 mt-1 text-sm">
                        {feedback.prompt}
                      </p>
                    </div>

                    {/* Model Response */}
                    <div>
                      <label className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                        Model Response
                      </label>
                      <p className="text-gray-300 mt-1 text-sm">
                        {feedback.model_response}
                      </p>
                    </div>

                    {/* Corrected Response */}
                    {feedback.corrected_response && (
                      <div>
                        <label className="text-xs uppercase tracking-wider text-green-500 font-medium">
                          Corrected Response
                        </label>
                        <p className="text-gray-300 mt-1 text-sm">
                          {feedback.corrected_response}
                        </p>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 pt-2">
                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            feedback.rating === 1
                              ? "bg-green-500/20 text-green-400"
                              : feedback.rating === 0
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {feedback.rating === 1
                            ? "👍 Good"
                            : feedback.rating === 0
                            ? "😐 Neutral"
                            : "👎 Bad"}
                        </span>
                      </div>

                      {/* Tags */}
                      {feedback?.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {feedback?.tags?.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"
                            >
                              {tag.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
}