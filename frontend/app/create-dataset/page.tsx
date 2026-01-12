"use client";

import { useState } from "react";
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

export default function ManageFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [correctionFilter, setCorrectionFilter] = useState<string>("all"); // all, corrected, not_corrected

  const tagGroups = {
    "Content Accuracy": ["hallucination", "incorrect", "speculative"],
    "Response Completeness": ["incomplete", "overcomplete", "too_short"],
    "Instruction Compliance": [
      "partial_compliance",
      "wrong_format",
      "ignored_constraints",
    ],
    "Clarity & Style": ["unclear", "verbose"],
    "Safety & Policy": ["unsafe", "policy_violation"],
  };

  const toggleRating = (rating: number) => {
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (selectedRatings.length > 0) {
        params.append("ratings", selectedRatings.join(","));
      }

      if (selectedTags.length > 0) {
        params.append("tags", selectedTags.join(","));
      }

      if (correctionFilter !== "all") {
        params.append(
          "has_correction",
          correctionFilter === "corrected" ? "true" : "false"
        );
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/feedback/filter?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch feedbacks");
      }

      const data = await res.json();
      setFeedbacks(data.feedbacks || []);

      toast.success(`Found ${data.feedbacks?.length || 0} feedbacks`, {
        position: "top-right",
        autoClose: 2000,
        toastId: "filter-success",
      });
    } catch (error) {
      toast.error(`Error: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
        toastId: "filter-error",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteFeedback = async (feedbackId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/feedback/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            feedback_id: feedbackId,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete feedback");
      }

      // Remove feedback from local state
      setFeedbacks((prev) => prev.filter((f) => f.id !== feedbackId));

      toast.success("Feedback deleted successfully!", {
        position: "top-right",
        autoClose: 2000,
        toastId: `delete-${feedbackId}`,
      });
    } catch (error) {
      toast.error(`Error: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
        toastId: `delete-error-${feedbackId}`,
      });
    }
  };

  const addFeedback = async (feedbackId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/feedback/add-feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            feedback_id: feedbackId,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to add feedback");
      }
      setFeedbacks((prev) => prev.filter((f) => f.id !== feedbackId));
      toast.success("Feedback added successfully!", {
        position: "top-right",
        autoClose: 2000,
        toastId: `add-${feedbackId}`,
      });
    } catch (error) {
      toast.error(`Error: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
        toastId: `add-error-${feedbackId}`,
      });
    }
  };

  const clearFilters = () => {
    setSelectedRatings([]);
    setSelectedTags([]);
    setCorrectionFilter("all");
    setFeedbacks([]);
  };

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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Manage Feedbacks
          </h1>
          <p className="text-gray-500 text-sm">
            Filter and manage your feedback collection
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Filters</h2>

          <div className="space-y-6">
            {/* Rating Filter */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-3 font-medium">
                Rating
              </label>
              <div className="flex gap-3">
                {[
                  { value: -1, label: "Bad", emoji: "👎" },
                  { value: 0, label: "Neutral", emoji: "😐" },
                  { value: 1, label: "Good", emoji: "👍" },
                ].map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    onClick={() => toggleRating(value)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      selectedRatings.includes(value)
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                        : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700"
                    }`}
                  >
                    <span className="mr-2">{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Correction Filter */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-3 font-medium">
                Response Correction Status
              </label>
              <div className="flex gap-3">
                {[
                  { value: "all", label: "All" },
                  { value: "corrected", label: "Has Correction" },
                  { value: "not_corrected", label: "No Correction" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setCorrectionFilter(value)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      correctionFilter === value
                        ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                        : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-3 font-medium">
                Tags
              </label>
              <div className="space-y-4">
                {Object.entries(tagGroups).map(([groupName, tags]) => (
                  <div key={groupName}>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      {groupName}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            selectedTags.includes(tag)
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30"
                              : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700 hover:border-gray-600"
                          }`}
                        >
                          {tag.replace(/_/g, " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={applyFilters}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg shadow-blue-500/20 disabled:shadow-none"
              >
                {loading ? (
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
                    Loading...
                  </span>
                ) : (
                  "Apply Filters"
                )}
              </button>
              <button
                onClick={clearFilters}
                className="px-8 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium border border-gray-700"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {feedbacks.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Results ({feedbacks.length})
              </h2>
            </div>

            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="bg-black/50 rounded-xl border border-gray-800 hover:border-gray-700 p-6 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      {/* Prompt */}
                      <div>
                        <label className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                          Prompt
                        </label>
                        <p className="text-gray-300 mt-1">{feedback.prompt}</p>
                      </div>

                      {/* Model Response */}
                      <div>
                        <label className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                          Model Response
                        </label>
                        <p className="text-gray-300 mt-1">
                          {feedback.model_response}
                        </p>
                      </div>

                      {/* Corrected Response */}
                      {feedback.corrected_response && (
                        <div>
                          <label className="text-xs uppercase tracking-wider text-green-500 font-medium">
                            Corrected Response
                          </label>
                          <p className="text-gray-300 mt-1">
                            {feedback.corrected_response}
                          </p>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center gap-6 pt-2">
                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase tracking-wider text-gray-500">
                            Rating:
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
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
                        {feedback.tags.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-wider text-gray-500">
                              Tags:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {feedback.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"
                                >
                                  {tag.replace(/_/g, " ")}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => addFeedback(feedback.id)}
                          className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg shadow-green-500/20 text-sm"
                        >
                          <span className="flex items-center gap-2">
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
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            Add Feedback
                          </span>
                        </button>
                        <button
                          onClick={() => deleteFeedback(feedback.id)}
                          className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg shadow-red-500/20 text-sm"
                        >
                          <span className="flex items-center gap-2">
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && feedbacks.length === 0 && (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No feedbacks found
            </h3>
            <p className="text-gray-600">
              Apply filters above to search for feedbacks to manage
            </p>
          </div>
        )}
      </div>
    </div>
  );
}