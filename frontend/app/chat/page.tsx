"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [correctedResponse, setCorrectedResponse] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const tagGroups = {
    "Content Accuracy": ["hallucination", "incorrect", "speculative"],
    "Response Completeness": ["incomplete", "overcomplete", "too_short"],
    "Instruction Compliance": ["partial_compliance", "wrong_format", "ignored_constraints"],
    "Clarity & Style": ["unclear", "verbose"],
    "Safety & Policy": ["unsafe", "policy_violation"],
  };

  const router = useRouter();

  const handleSubmitPrompt = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse("");
    setRating(null);
    setCorrectedResponse("");
    setSelectedTags([]);
    setShowFeedback(false);

    try {
      let tkn = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/feedback/generate`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tkn}`,
          },
          body: JSON.stringify({
            prompt: prompt,
            max_tokens: 256,
            temperature: 0.7,
          }),
        }
      );

      if (!res.ok) {
        let message = "Generation failed";
        try {
          const err = await res.json();
          message = err.detail || message;
        } catch {}
        throw new Error(message);
      }

      const data = await res.json();
      setResponse(data.output);
      setShowFeedback(true);
    } catch (error: any) {
      setResponse(`Error: ${error.message}`);
      setShowFeedback(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = (value: number) => {
    setRating(value);
    if (value === 1) {
      setCorrectedResponse("");
      setSelectedTags([]);
    }
  };

  const getTagGroup = (tag: string): string | null => {
    for (const [groupName, tags] of Object.entries(tagGroups)) {
      if (tags.includes(tag)) {
        return groupName;
      }
    }
    return null;
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      // If tag is already selected, deselect it
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }

      // Find which group this tag belongs to
      const tagGroup = getTagGroup(tag);
      if (!tagGroup) return prev;

      // Check if another tag from the same group is already selected
      type TagGroup = keyof typeof tagGroups;
      const tagsInGroup = tagGroups[tagGroup as TagGroup];
      const alreadySelectedFromGroup = prev.find((t) => tagsInGroup.includes(t));

      if (alreadySelectedFromGroup) {
        toast.warning(`Only one tag per group. Replacing "${alreadySelectedFromGroup}" with "${tag}".`, {
          position: "top-right",
          autoClose: 2500,
          toastId: `tag-${tag}`, // Unique ID prevents duplicate toasts
        });
        // Replace the old tag with the new one
        return prev.map((t) => (t === alreadySelectedFromGroup ? tag : t));
      }

      // Add the new tag
      return [...prev, tag];
    });
  };

  const handleSubmitFeedback = async () => {
    if (rating === null) {
      toast.warning("Please select a rating", {
        position: "top-right",
        autoClose: 2500,
        toastId: "rating-warning", // Unique ID prevents duplicate toasts
      });
      return;
    }

    const feedbackPayload = {
      prompt,
      model_response: response,
      rating,
      corrected_response: rating !== 1 ? correctedResponse : null,
      tags: rating !== 1 ? selectedTags : [],
    };

    setSubmitting(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/feedback/store-feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(feedbackPayload),
        }
      );

      if (res.ok) {
        toast.success("Feedback submitted successfully!", {
          position: "top-right",
          autoClose: 2500,
          toastId: "submit-success", // Unique ID prevents duplicate toasts
        });
        setPrompt("");
        setResponse("");
        setRating(null);
        setCorrectedResponse("");
        setSelectedTags([]);
        setShowFeedback(false);
      } else {
        const errorMessage = await res.json().catch(() => ({}))
        toast.error(errorMessage.detail || "Failed to submit feedback", {
          position: "top-right",
          autoClose: 2500,
          toastId: "submit-error", // Unique ID prevents duplicate toasts
        });
      }
    } catch (error:any) {
      toast.error(`Error: ${error.message}`, {
        position: "top-right",
        autoClose: 2500,
        toastId: "submit-exception", // Unique ID prevents duplicate toasts
      });
    } finally {
      setSubmitting(false);
    }
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

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            LLM Feedback Collection
          </h1>
          <p className="text-gray-500 text-sm">
            Train better models with quality feedback
          </p>
        </div>

        {/* Prompt Input */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 mb-8">
          <label className="block text-xs uppercase tracking-wider text-gray-400 mb-3 font-medium">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt to test the model..."
            rows={5}
            className="w-full px-4 py-3 bg-black/50 border border-gray-800 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none placeholder-gray-600 transition-all"
          />
          <div className="flex justify-end mt-4 gap-6">
             {/* <button
              onClick={() => router.push('/validate-endpoint')}
              
              className="px-8 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg shadow-green-500/20 ne"
            >
              
                <span className="flex items-center gap-2">
                 
                  Test LLM Endpoint
                </span>
            </button> */}
            <button
              onClick={handleSubmitPrompt}
              disabled={loading || !prompt.trim()}
              className="px-8 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg shadow-blue-500/20 disabled:shadow-none"
            >
              {loading ? (
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
                  Generating...
                </span>
              ) : (
                "Generate Response"
              )}
            </button>
          </div>
        </div>

        {/* Response Display */}
        {response && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-3 font-medium">
              Model Response
            </label>
            <div className="bg-black/50 rounded-xl p-5 mb-6 border border-gray-800">
              <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                {response}
              </p>
            </div>

            {showFeedback && (
              <div className="space-y-8">
                <div className="h-px bg-linear-to-r from-transparent via-gray-800 to-transparent" />

                {/* Rating */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-4 font-medium">
                    Rate Response
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: -1, label: "Bad", emoji: "👎", color: "red" },
                      {
                        value: 0,
                        label: "Neutral",
                        emoji: "😐",
                        color: "yellow",
                      },
                      { value: 1, label: "Good", emoji: "👍", color: "green" },
                    ].map(({ value, label, emoji, color }) => (
                      <button
                        key={value}
                        onClick={() => handleRating(value)}
                        className={`py-4 rounded-xl font-medium transition-all duration-200 ${
                          rating === value
                            ? color === "green"
                              ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                              : color === "yellow"
                              ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/30"
                              : "bg-red-500 text-white shadow-lg shadow-red-500/30"
                            : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700"
                        }`}
                      >
                        <span className="text-2xl block mb-1">{emoji}</span>
                        <span className="text-sm">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Corrected Response and Tags */}
                {rating !== null && rating !== 1 && (
                  <>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-400 mb-3 font-medium">
                        Corrected Response{" "}
                        <span className="text-gray-600 normal-case">
                          (optional)
                        </span>
                      </label>
                      <textarea
                        value={correctedResponse}
                        onChange={(e) => setCorrectedResponse(e.target.value)}
                        placeholder="Provide the correct or improved response..."
                        rows={5}
                        className="w-full px-4 py-3 bg-black/50 border border-gray-800 text-white rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none placeholder-gray-600 transition-all"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-xs uppercase tracking-wider text-gray-400 font-medium">
                          Issue Tags
                        </label>
                        <span className="text-xs text-gray-600">
                          {selectedTags.length} /{" "}
                          {Object.keys(tagGroups).length} groups selected
                        </span>
                      </div>

                      <div className="space-y-6">
                        {Object.entries(tagGroups).map(([groupName, tags]) => (
                          <div key={groupName}>
                            <h3 className="text-sm font-medium text-gray-500 mb-3">
                              {groupName}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {tags.map((tag) => (
                                <button
                                  key={tag}
                                  onClick={() => toggleTag(tag)}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    selectedTags.includes(tag)
                                      ? "bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30"
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

                      <p className="text-xs text-gray-600 mt-4 italic">
                        * Select one tag per group (max{" "}
                        {Object.keys(tagGroups).length} tags total)
                      </p>
                    </div>
                  </>
                )}

                {/* Submit Button */}
                {rating !== null && (
                  <div className="pt-4">
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={submitting}
                      className="w-full py-4 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg shadow-green-500/20 disabled:shadow-none"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5"
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
                          Submitting Feedback...
                        </span>
                      ) : (
                        "Submit Feedback"
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}