"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MODEL_TARGET_MODULE_MAP: Record<string, string[]> = {
  "meta-llama/Meta-Llama-3-8B-Instruct": ["q_proj", "k_proj", "v_proj"],
  "mistralai/Mistral-7B-Instruct-v0.2": ["q_proj", "k_proj", "v_proj"],
  "Qwen/Qwen2.5-7B-Instruct": ["q_proj", "k_proj", "v_proj"],
  "microsoft/phi-3-mini-4k-instruct": ["query_key_value"],
};


const FIELD_INFO = {
  baseModel: "The foundation model that will be fine-tuned. LoRA adapters are specific to the base model architecture.",
  targetModules: "Specific transformer layers to apply LoRA. q_proj and v_proj work for most models and provide good balance between adaptation quality and efficiency.",
  rank: "Controls adapter capacity. Higher rank = more parameters = stronger adaptation but higher risk of overfitting. 8 is the sweet spot for most cases.",
  alpha: "Scaling factor for LoRA updates. Generally set to 2× the rank value. Higher alpha = stronger adaptation influence on the base model.",
  dropout: "Randomly drops connections during training to prevent overfitting. 0.05 provides slight regularization without hurting performance.",
  epochs: "Number of complete passes through your training data. More epochs = more learning but higher overfitting risk. 3 is standard for most datasets.",
  batchSize: "Number of samples processed together. Larger batches train faster but use more memory. Will be auto-adjusted based on available GPU.",
  learningRate: "Step size for weight updates. 2e-4 is the proven standard for LoRA training. Too high causes instability, too low trains slowly.",
};

export default function LoRAConfigPage() {
  const [submitting, setSubmitting] = useState(false);
  const [openInfo, setOpenInfo] = useState<string | null>(null);

  // Configuration state
  const [baseModel, setBaseModel] = useState("meta-llama/Meta-Llama-3-8B-Instruct");
  const [targetModules, setTargetModules] = useState<string[]>(["q_proj", "v_proj"]);
  const [rank, setRank] = useState(8);
  const [alpha, setAlpha] = useState(16);
  const [dropout, setDropout] = useState(0.05);
  const [epochs, setEpochs] = useState(3);
  const [batchSize, setBatchSize] = useState(4);
  const [learningRate, setLearningRate] = useState(2e-4);

  const baseModels = [
    "meta-llama/Meta-Llama-3-8B-Instruct",
    "mistralai/Mistral-7B-Instruct-v0.2",
    "Qwen/Qwen2.5-7B-Instruct",
    "microsoft/phi-3-mini-4k-instruct",
  ];

  const availableTargetModules = [
    "q_proj",
    "k_proj",
    "v_proj",
    "o_proj",
    "gate_proj",
    "up_proj",
    "down_proj",
  ];

  // Auto-update target modules when base model changes
  useEffect(() => {
  const recommended = MODEL_TARGET_MODULE_MAP[baseModel];
  if (!recommended) return;

  setTargetModules((prev) =>
    prev.filter((m) => recommended.includes(m)).length > 0
      ? prev.filter((m) => recommended.includes(m))
      : recommended
  );
}, [baseModel]);


const toggleTargetModule = (module: string) => {
  const allowed = MODEL_TARGET_MODULE_MAP[baseModel];

  // 🚫 block invalid modules for this model
  if (allowed && !allowed.includes(module)) {
    toast.warning(
      `"${module}" is not supported for the selected base model`,
      {
        position: "top-right",
        autoClose: 2000,
        toastId: `invalid-module-${module}`,
      }
    );
    return;
  }

  setTargetModules((prev) =>
    prev.includes(module)
      ? prev.filter((m) => m !== module)
      : [...prev, module]
  );
};


  const toggleInfo = (field: string) => {
    setOpenInfo(openInfo === field ? null : field);
  };

  const handleSubmit = async () => {
    // Validation
    if (!baseModel) {
      toast.error("Please select a base model", {
        position: "top-right",
        autoClose: 2500,
        toastId: "base-model-error",
      });
      return;
    }

    if (targetModules.length === 0) {
      toast.error("Please select at least one target module", {
        position: "top-right",
        autoClose: 2500,
        toastId: "target-modules-error",
      });
      return;
    }

    // Warn if using non-recommended modules
    const recommended = MODEL_TARGET_MODULE_MAP[baseModel];
    if (
      recommended &&
      !recommended.every((m) => targetModules.includes(m))
    ) {
      toast.warning(
        "Selected target modules differ from recommended defaults for this model",
        {
          position: "top-right",
          autoClose: 3000,
          toastId: "modules-warning",
        }
      );
    }

    const config = {
      base_model: baseModel,
      lora: {
        r: rank,
        alpha: alpha,
        dropout: dropout,
        target_modules: targetModules,
      },
      training: {
        epochs: epochs,
        batch_size: batchSize,
        learning_rate: learningRate,
        seed: 42,
      },
    };

    setSubmitting(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/training/configure-lora`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(config),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to configure LoRA adapter");
      }

      toast.success("LoRA configuration submitted successfully!", {
        position: "top-right",
        autoClose: 2500,
        toastId: "submit-success",
      });
    } catch (error) {
      toast.error(`Error: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
        toastId: "submit-error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetToDefaults = () => {
    setBaseModel("meta-llama/Meta-Llama-3-8B-Instruct");
    setTargetModules(
      MODEL_TARGET_MODULE_MAP["meta-llama/Meta-Llama-3-8B-Instruct"]
    );
    setRank(8);
    setAlpha(16);
    setDropout(0.05);
    setEpochs(3);
    setBatchSize(4);
    setLearningRate(2e-4);

    toast.info("Reset to recommended defaults", {
      position: "top-right",
      autoClose: 2000,
      toastId: "reset",
    });
  };

  const recommendedModules = MODEL_TARGET_MODULE_MAP[baseModel] ?? [];

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
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            LoRA Adapter Configuration
          </h1>
          <p className="text-gray-500 text-sm">
            Configure parameters for generating fine-tuned adapters
          </p>
        </div>

        {/* Configuration Form */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 mb-6">
          <div className="space-y-8">
            {/* Base Model Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Base Model <span className="text-red-400">*</span>
                  </label>
                  <button
                    onClick={() => toggleInfo("baseModel")}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <span className="text-xs text-gray-500">Required</span>
              </div>

              {openInfo === "baseModel" && (
                <div className="mb-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-gray-300">
                  {FIELD_INFO.baseModel}
                </div>
              )}

              <select
                value={baseModel}
                onChange={(e) => setBaseModel(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="" disabled>
                  Select a base model
                </option>
                {baseModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

            {/* LoRA Configuration Section */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                LoRA Parameters
              </h2>

              <div className="space-y-6">
                {/* Target Modules */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Target Modules <span className="text-red-400">*</span>
                    </label>
                    <button
                      onClick={() => toggleInfo("targetModules")}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  {openInfo === "targetModules" && (
                    <div className="mb-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-gray-300">
                      {FIELD_INFO.targetModules}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {availableTargetModules.map((module) => {
                      const isRecommended = recommendedModules.includes(module);
                      return (
                        <button
                          key={module}
                          onClick={() => toggleTargetModule(module)}
                          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 relative ${
                            targetModules.includes(module)
                              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                              : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700"
                          }`}
                        >
                          {module}
                          {isRecommended && (
                            <span className="ml-1 text-xs opacity-75">
                              ⭐
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    ⭐ = Recommended for {baseModel.split("/")[1]}
                  </p>
                </div>

                {/* Rank */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium text-gray-300">
                        LoRA Rank (r)
                      </label>
                      <button
                        onClick={() => toggleInfo("rank")}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                    <span className="text-sm text-gray-400">
                      Current: {rank}
                    </span>
                  </div>

                  {openInfo === "rank" && (
                    <div className="mb-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-gray-300">
                      {FIELD_INFO.rank}
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-3">
                    {[4, 8, 16, 32].map((value) => (
                      <button
                        key={value}
                        onClick={() => setRank(value)}
                        className={`py-3 rounded-lg font-medium transition-all duration-200 ${
                          rank === value
                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                            : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    4: light • 8: standard • 16: stronger • 32: aggressive
                  </p>
                </div>

                {/* Alpha */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium text-gray-300">
                        LoRA Alpha
                      </label>
                      <button
                        onClick={() => toggleInfo("alpha")}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                    <span className="text-sm text-gray-400">
                      Current: {alpha}
                    </span>
                  </div>

                  {openInfo === "alpha" && (
                    <div className="mb-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-gray-300">
                      {FIELD_INFO.alpha}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    {[8, 16, 32].map((value) => (
                      <button
                        key={value}
                        onClick={() => setAlpha(value)}
                        className={`py-3 rounded-lg font-medium transition-all duration-200 ${
                          alpha === value
                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                            : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dropout */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium text-gray-300">
                        LoRA Dropout
                      </label>
                      <button
                        onClick={() => toggleInfo("dropout")}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                    <span className="text-sm text-gray-400">
                      Current: {dropout}
                    </span>
                  </div>

                  {openInfo === "dropout" && (
                    <div className="mb-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-gray-300">
                      {FIELD_INFO.dropout}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    {[0.0, 0.05, 0.1].map((value) => (
                      <button
                        key={value}
                        onClick={() => setDropout(value)}
                        className={`py-3 rounded-lg font-medium transition-all duration-200 ${
                          dropout === value
                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                            : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700"
                        }`}
                      >
                        {value.toFixed(2)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Helps reduce overfitting
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

            {/* Training Configuration Section */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                Training Parameters
              </h2>

              <div className="space-y-6">
                {/* Epochs */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Epochs
                      </label>
                      <button
                        onClick={() => toggleInfo("epochs")}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                    <span className="text-sm text-gray-400">
                      Current: {epochs}
                    </span>
                  </div>

                  {openInfo === "epochs" && (
                    <div className="mb-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-gray-300">
                      {FIELD_INFO.epochs}
                    </div>
                  )}

                  <div className="grid grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => setEpochs(value)}
                        className={`py-3 rounded-lg font-medium transition-all duration-200 ${
                          epochs === value
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                            : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    1: very light • 3: standard • 5: strong
                  </p>
                </div>

                {/* Batch Size */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Batch Size
                      </label>
                      <button
                        onClick={() => toggleInfo("batchSize")}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                    <span className="text-sm text-gray-400">
                      Current: {batchSize}
                    </span>
                  </div>

                  {openInfo === "batchSize" && (
                    <div className="mb-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-gray-300">
                      {FIELD_INFO.batchSize}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    {[2, 4, 8].map((value) => (
                      <button
                        key={value}
                        onClick={() => setBatchSize(value)}
                        className={`py-3 rounded-lg font-medium transition-all duration-200 ${
                          batchSize === value
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                            : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Learning Rate */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Learning Rate
                      </label>
                      <button
                        onClick={() => toggleInfo("learningRate")}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                    <span className="text-sm text-gray-400">
                      Current: {learningRate}
                    </span>
                  </div>

                  {openInfo === "learningRate" && (
                    <div className="mb-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-gray-300">
                      {FIELD_INFO.learningRate}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    {[1e-4, 2e-4, 3e-4].map((value) => (
                      <button
                        key={value}
                        onClick={() => setLearningRate(value)}
                        className={`py-3 rounded-lg font-medium transition-all duration-200 ${
                          learningRate === value
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                            : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700"
                        }`}
                      >
                        {value === 1e-4 ? "1e-4" : value === 2e-4 ? "2e-4" : "3e-4"}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    2e-4 is the most widely used
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Configuration Preview */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Configuration Preview
          </h3>
          <pre className="bg-black/50 rounded-lg p-4 overflow-x-auto text-sm text-gray-300">
            {JSON.stringify(
              {
                base_model: baseModel,
                lora: {
                  r: rank,
                  alpha: alpha,
                  dropout: dropout,
                  target_modules: targetModules,
                },
                training: {
                  epochs: epochs,
                  batch_size: batchSize,
                  learning_rate: learningRate,
                  seed: 42,
                },
              },
              null,
              2
            )}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={resetToDefaults}
            className="px-8 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium border border-gray-700"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !baseModel || targetModules.length === 0}
            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg shadow-green-500/20 disabled:shadow-none"
          >
            {submitting ? (
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
                Submitting...
              </span>
            ) : (
              "Generate LoRA Adapter"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}