"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface DatasetDetails {
  id: string;
  org_id: string;
  source_model_version: number;
  status: string;
  created_at: string;
  rules: {
    ratings: number[];
    tags: string[];
    has_correction: boolean;
    selection: {
      mode: string;
    };
    feedback_ids: string[];
  };
  feedback_count: number;
  stats: {
    total_feedbacks: number;
    ratings_breakdown: { [key: string]: number };
    tags_breakdown: { [key: string]: number };
    corrected_count: number;
    uncorrected_count: number;
  };
}

export default function DatasetDetailsPage() {
  const params = useParams();
  const dataset_id = params.id as string;

  const [dataset, setDataset] = useState<DatasetDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDatasetDetails();
  }, [dataset_id]);

  const fetchDatasetDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/dataset/${dataset_id}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch dataset details");
      }

      const data = await res.json();
      setDataset(data);
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`, {
        position: "top-right",
        autoClose: 3000,
        toastId: "fetch-error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "collecting":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "ready":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "processing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getRatingLabel = (rating: string) => {
    const r = parseInt(rating);
    if (r === 1) return "👍 Good";
    if (r === 0) return "😐 Neutral";
    if (r === -1) return "👎 Bad";
    return rating;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
          <p className="text-gray-400">Loading dataset details...</p>
        </div>
      </div>
    );
  }

  if (error || !dataset) {
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
            Failed to Load Dataset
          </h3>
          <p className="text-gray-500 mb-6">{error || "Dataset not found"}</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            Go Back
          </button>
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Dataset Details
              </h1>
              <p className="text-gray-500 text-sm">
                ID: {dataset.id}
              </p>
            </div>
            <span
              className={`px-6 py-3 rounded-xl font-semibold text-sm border ${getStatusColor(
                dataset.status
              )}`}
            >
              {dataset.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Basic Info Cards */}
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                Total Feedbacks
              </span>
            </div>
            <p className="text-3xl font-bold text-white">
              {dataset.stats.total_feedbacks}
            </p>
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
                Model Version
              </span>
            </div>
            <p className="text-3xl font-bold text-white">
              v{dataset.source_model_version}
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                With Corrections
              </span>
            </div>
            <p className="text-3xl font-bold text-white">
              {dataset.stats.corrected_count}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Filter Rules */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filter Rules
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 mb-2 block">
                  Ratings
                </label>
                <div className="flex flex-wrap gap-2">
                  {dataset.rules.ratings.map((rating) => (
                    <span
                      key={rating}
                      className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium"
                    >
                      {getRatingLabel(rating.toString())}
                    </span>
                  ))}
                </div>
              </div>

              {dataset.rules.tags.length > 0 && (
                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500 mb-2 block">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {dataset.rules.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium"
                      >
                        {tag.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 mb-2 block">
                  Correction Required
                </label>
                <span
                  className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${
                    dataset.rules.has_correction
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {dataset.rules.has_correction ? "Yes" : "No"}
                </span>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 mb-2 block">
                  Selection Mode
                </label>
                <span className="inline-block px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium capitalize">
                  {dataset.rules.selection?.mode}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Metadata
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 mb-1 block">
                  Created At
                </label>
                <p className="text-gray-300">{formatDate(dataset.created_at)}</p>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 mb-1 block">
                  Organization ID
                </label>
                <p className="text-gray-300 font-mono text-sm">
                  {dataset.org_id}
                </p>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 mb-1 block">
                  Selected Feedback IDs
                </label>
                <p className="text-gray-400 text-sm">
                  {dataset.rules.feedback_ids?.length} feedback(s) manually selected
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
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
            Statistics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Ratings Breakdown */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-4">
                Ratings Breakdown
              </h3>
              <div className="space-y-3">
                {Object.entries(dataset.stats.ratings_breakdown).map(
                  ([rating, count]) => {
                    const percentage = (
                      (count / dataset.stats.total_feedbacks) *
                      100
                    ).toFixed(1);
                    return (
                      <div key={rating}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-300 text-sm">
                            {getRatingLabel(rating)}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Tags Breakdown */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-4">
                Tags Breakdown
              </h3>
              <div className="space-y-3">
                {Object.entries(dataset.stats.tags_breakdown).map(
                  ([tag, count]) => {
                    const percentage = (
                      (count / dataset.stats.total_feedbacks) *
                      100
                    ).toFixed(1);
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
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* Correction Stats */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              Correction Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                <p className="text-sm text-gray-400 mb-1">With Corrections</p>
                <p className="text-2xl font-bold text-green-400">
                  {dataset.stats.corrected_count}
                </p>
              </div>
              <div className="bg-gray-500/10 rounded-xl p-4 border border-gray-500/20">
                <p className="text-sm text-gray-400 mb-1">Without Corrections</p>
                <p className="text-2xl font-bold text-gray-400">
                  {dataset.stats.uncorrected_count}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}