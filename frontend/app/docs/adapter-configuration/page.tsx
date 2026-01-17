"use client";

import { useRouter } from "next/navigation";

export default function AdapterConfigurationDoc() {
  const router = useRouter();

  return (
    <div className="min-h-screen font-sans text-justify bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <button
            onClick={() => router.push("/docs")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Back to Docs</span>
          </button>
          <h1 className="text-3xl font-bold text-white">Adapter Configuration</h1>
          <p className="text-gray-400 mt-2">Understanding LoRA training parameters</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="prose prose-invert max-w-none">
          
          {/* Introduction */}
          <div className="mb-12">
            <p className="text-gray-300 text-lg leading-relaxed">
              This guide explains each parameter in the adapter configuration file. These settings control how your LoRA adapter is trained and determine the quality and efficiency of your fine-tuned model.
            </p>
          </div>

          {/* Base Model Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-800">
              Base Model
            </h2>
            
            <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3 mb-3">
                <code className="text-sm bg-gray-800 px-2 py-1 rounded text-gray-300">
                  base_model
                </code>
              </div>
              <p className="text-gray-300 leading-relaxed mb-4">
                The foundation model that will be fine-tuned with your LoRA adapter. This is the pre-trained LLM that serves as the starting point for training.
              </p>
              <div className="text-sm text-gray-400">
                <p className="mb-2"><span className="text-gray-500">Type:</span> String</p>
                <p><span className="text-gray-500">Example:</span> "Qwen/Qwen2.5-7B-Instruct", "meta-llama/Meta-Llama-3-8B-Instruct"</p>
              </div>
            </div>
          </section>

          {/* LoRA Parameters Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-800">
              LoRA Parameters
            </h2>

            <div className="space-y-6">
              {/* Rank */}
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-3">
                  <code className="text-sm bg-gray-800 px-2 py-1 rounded text-gray-300">
                    r
                  </code>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/30">
                    Rank
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  The rank of the low-rank matrices used in LoRA. This determines the number of trainable parameters in your adapter. Lower rank means fewer parameters and faster training, but may limit model expressiveness. Higher rank captures more complex patterns but requires more memory and training time.
                </p>
                <div className="text-sm text-gray-400">
                  <p className="mb-2"><span className="text-gray-500">Type:</span> Integer</p>
                  <p className="mb-2"><span className="text-gray-500">Common values:</span> 4, 8, 16, 32, 64</p>
                  <p><span className="text-gray-500">Recommendation:</span> Start with 8 for most use cases</p>
                </div>
              </div>

              {/* Alpha */}
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-3">
                  <code className="text-sm bg-gray-800 px-2 py-1 rounded text-gray-300">
                    alpha
                  </code>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30">
                    Scaling Factor
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  The LoRA scaling factor that controls how much the adapter influences the base model. A higher alpha value means the adapter has more impact on the final output. Typically set to 2x the rank value for balanced training.
                </p>
                <div className="text-sm text-gray-400">
                  <p className="mb-2"><span className="text-gray-500">Type:</span> Integer</p>
                  <p className="mb-2"><span className="text-gray-500">Common pattern:</span> 2 × rank (e.g., if r=8, then alpha=16)</p>
                  <p><span className="text-gray-500">Impact:</span> Higher values = stronger adapter influence</p>
                </div>
              </div>

              {/* Dropout */}
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-3">
                  <code className="text-sm bg-gray-800 px-2 py-1 rounded text-gray-300">
                    dropout
                  </code>
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded border border-green-500/30">
                    Regularization
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  The dropout probability applied to LoRA layers during training. Dropout randomly disables a percentage of neurons to prevent overfitting and improve generalization. A value of 0.05 means 5% of neurons are dropped during each training step.
                </p>
                <div className="text-sm text-gray-400">
                  <p className="mb-2"><span className="text-gray-500">Type:</span> Float (0.0 to 1.0)</p>
                  <p className="mb-2"><span className="text-gray-500">Common values:</span> 0.05, 0.1, 0.2</p>
                  <p><span className="text-gray-500">Recommendation:</span> 0.05 for small datasets, 0.1 for larger ones</p>
                </div>
              </div>

              {/* Target Modules */}
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-3">
                  <code className="text-sm bg-gray-800 px-2 py-1 rounded text-gray-300">
                    target_modules
                  </code>
                  <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded border border-orange-500/30">
                    Layer Selection
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Specifies which layers of the base model will have LoRA adapters applied. Common choices include query (q_proj) and value (v_proj) projection layers in the attention mechanism. Targeting specific modules allows you to fine-tune only the most relevant parts of the model.
                </p>
                <div className="text-sm text-gray-400 mb-4">
                  <p className="mb-2"><span className="text-gray-500">Type:</span> Array of strings</p>
                  <p className="mb-2"><span className="text-gray-500">Common options:</span></p>
                  <ul className="ml-6 space-y-1 list-disc">
                    <li><code className="text-xs bg-gray-800 px-1.5 py-0.5 rounded">q_proj</code> - Query projection layer</li>
                    <li><code className="text-xs bg-gray-800 px-1.5 py-0.5 rounded">v_proj</code> - Value projection layer</li>
                    <li><code className="text-xs bg-gray-800 px-1.5 py-0.5 rounded">k_proj</code> - Key projection layer</li>
                    <li><code className="text-xs bg-gray-800 px-1.5 py-0.5 rounded">o_proj</code> - Output projection layer</li>
                  </ul>
                </div>
                <div className="text-sm text-gray-400">
                  <p><span className="text-gray-500">Recommendation:</span> Start with ["q_proj", "v_proj"] for balanced results</p>
                </div>
              </div>
            </div>
          </section>

          {/* Training Parameters Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-800">
              Training Parameters
            </h2>

            <div className="space-y-6">
              {/* Epochs */}
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-3">
                  <code className="text-sm bg-gray-800 px-2 py-1 rounded text-gray-300">
                    epochs
                  </code>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  The number of complete passes through the entire training dataset. One epoch means the model has seen every training example once. More epochs can improve performance but may lead to overfitting if set too high.
                </p>
                <div className="text-sm text-gray-400">
                  <p className="mb-2"><span className="text-gray-500">Type:</span> Integer</p>
                  <p className="mb-2"><span className="text-gray-500">Common values:</span> 1, 3, 5</p>
                  <p><span className="text-gray-500">Recommendation:</span> 3 epochs for most datasets</p>
                </div>
              </div>

              {/* Batch Size */}
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-3">
                  <code className="text-sm bg-gray-800 px-2 py-1 rounded text-gray-300">
                    batch_size
                  </code>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  The number of training examples processed together in one forward/backward pass. Larger batch sizes can speed up training and provide more stable gradients, but require more GPU memory. Smaller batches use less memory but may result in noisier training.
                </p>
                <div className="text-sm text-gray-400">
                  <p className="mb-2"><span className="text-gray-500">Type:</span> Integer</p>
                  <p className="mb-2"><span className="text-gray-500">Common values:</span> 1, 2, 4, 8, 16</p>
                  <p><span className="text-gray-500">Recommendation:</span> 4 for balanced memory usage and training stability</p>
                </div>
              </div>

              {/* Learning Rate */}
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-3">
                  <code className="text-sm bg-gray-800 px-2 py-1 rounded text-gray-300">
                    learning_rate
                  </code>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Controls how much the model weights are updated during training. A higher learning rate means faster training but risks overshooting optimal values. A lower learning rate is more stable but may train too slowly or get stuck in local minima.
                </p>
                <div className="text-sm text-gray-400">
                  <p className="mb-2"><span className="text-gray-500">Type:</span> Float</p>
                  <p className="mb-2"><span className="text-gray-500">Common values:</span> 0.0001, 0.0002, 0.0003</p>
                  <p><span className="text-gray-500">Recommendation:</span> 0.0002 (2e-4) for most LoRA training</p>
                </div>
              </div>

              {/* Seed */}
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-3">
                  <code className="text-sm bg-gray-800 px-2 py-1 rounded text-gray-300">
                    seed
                  </code>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  The random seed used for reproducibility. Setting a seed ensures that training runs produce consistent results when using the same data and parameters. This is useful for debugging and comparing different configurations.
                </p>
                <div className="text-sm text-gray-400">
                  <p className="mb-2"><span className="text-gray-500">Type:</span> Integer</p>
                  <p className="mb-2"><span className="text-gray-500">Common values:</span> Any integer (42 is conventional)</p>
                  <p><span className="text-gray-500">Purpose:</span> Ensures reproducible training results</p>
                </div>
              </div>
            </div>
          </section>

          {/* Example Configuration */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-800">
              Example Configuration
            </h2>
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 overflow-x-auto">
              <pre className="text-sm text-gray-300">
{`{
  "base_model": "Qwen/Qwen2.5-7B-Instruct",
  "lora": {
    "r": 8,
    "alpha": 16,
    "dropout": 0.05,
    "target_modules": ["q_proj", "v_proj"]
  },
  "training": {
    "epochs": 3,
    "batch_size": 4,
    "learning_rate": 0.0002,
    "seed": 42
  }
}`}
              </pre>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              This is a recommended starting configuration that balances training quality, speed, and resource usage for most use cases.
            </p>
          </section>

          

          {/* Footer */}
<div className="border-t border-gray-800 mt-16">
  <div className="max-w-3xl mx-auto px-6 py-12">
    <h3 className="text-lg font-semibold text-white mb-6">Further Reading</h3>
    
    <div className="space-y-6 mb-8">
      {/* Research Papers */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Research Papers</h4>
        <div className="space-y-2">
          <a 
            href="https://arxiv.org/abs/2106.09685" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-gray-300 hover:text-white transition-colors text-sm group"
          >
            <span className="flex items-center gap-2">
              LoRA: Low-Rank Adaptation of Large Language Models
              <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </span>
            <span className="text-xs text-gray-500">Hu et al. (2021) - Original LoRA paper</span>
          </a>
          
          <a 
            href="https://arxiv.org/abs/2305.14314" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-gray-300 hover:text-white transition-colors text-sm group"
          >
            <span className="flex items-center gap-2">
              QLoRA: Efficient Finetuning of Quantized LLMs
              <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </span>
            <span className="text-xs text-gray-500">Dettmers et al. (2023) - Memory-efficient training</span>
          </a>
        </div>
      </div>

      {/* Technical Guides */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Technical Guides</h4>
        <div className="space-y-2">
          <a 
            href="https://huggingface.co/docs/peft/conceptual_guides/lora" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-gray-300 hover:text-white transition-colors text-sm group"
          >
            <span className="flex items-center gap-2">
              Hugging Face PEFT Documentation
              <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </span>
            <span className="text-xs text-gray-500">Official PEFT library documentation</span>
          </a>
          
          <a 
            href="https://magazine.sebastianraschka.com/p/practical-tips-for-finetuning-llms" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-gray-300 hover:text-white transition-colors text-sm group"
          >
            <span className="flex items-center gap-2">
              Practical Tips for Finetuning LLMs
              <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </span>
            <span className="text-xs text-gray-500">Sebastian Raschka - Best practices guide</span>
          </a>
        </div>
      </div>

      {/* Blog Posts */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Community Blogs</h4>
        <div className="space-y-2">
          <a 
            href="https://www.databricks.com/blog/efficient-fine-tuning-lora-guide-llms" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-gray-300 hover:text-white transition-colors text-sm group"
          >
            <span className="flex items-center gap-2">
              Efficient Fine-Tuning with LoRA
              <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </span>
            <span className="text-xs text-gray-500">Databricks - Complete LoRA guide</span>
          </a>
          
          <a 
            href="https://lightning.ai/pages/community/lora-insights/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-gray-300 hover:text-white transition-colors text-sm group"
          >
            <span className="flex items-center gap-2">
              Understanding LoRA: Insights and Applications
              <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </span>
            <span className="text-xs text-gray-500">Lightning AI - Deep dive into LoRA</span>
          </a>
        </div>
      </div>
    </div>

    
  </div>
</div>

        {/* Tips */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-800">
              Quick Tips
            </h2>
            <div className="space-y-3">
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
                <p className="text-gray-300">
                  <span className="text-white font-medium">Starting out?</span> Use the default configuration provided in the platform. It's optimized for most scenarios.
                </p>
              </div>
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
                <p className="text-gray-300">
                  <span className="text-white font-medium">Small dataset?</span> Reduce epochs to 1-2 and keep dropout at 0.05 to prevent overfitting.
                </p>
              </div>
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
                <p className="text-gray-300">
                  <span className="text-white font-medium">Need better quality?</span> Increase rank to 16 or 32, and add more target modules like "k_proj" and "o_proj".
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>

      
    </div>
  );
}