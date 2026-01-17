"use client";

import { useRouter } from "next/navigation";

export default function LoRAAndQLoRADoc() {
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
          <h1 className="text-3xl font-bold text-white">What is LoRA and QLoRA?</h1>
          <p className="text-gray-400 mt-2">Deep dive into Low-Rank Adaptation techniques</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="prose prose-invert max-w-none">

          {/* Introduction */}
          <section className="mb-16">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              LoRA (Low-Rank Adaptation) and QLoRA (Quantized Low-Rank Adaptation) are techniques that make fine-tuning large language models practical and affordable. They achieve this by dramatically reducing the number of parameters that need to be trained while maintaining performance comparable to full fine-tuning.
            </p>
            <p className="text-gray-300 leading-relaxed">
              These methods have democratized access to model customization, allowing individuals and small teams to fine-tune billion-parameter models on consumer hardware—something that was previously possible only for well-resourced research labs.
            </p>
          </section>

          {/* Understanding LoRA */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Understanding LoRA</h2>
            
            <h3 className="text-lg font-semibold text-white mb-4">The Core Problem</h3>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              Large language models contain billions of parameters organized in massive weight matrices. For example, a single attention layer in a 7-billion parameter model might have a weight matrix with dimensions of 4096×4096, containing over 16 million parameters. Traditional fine-tuning updates every single parameter in the model.
            </p>

            <p className="text-gray-300 leading-relaxed mb-6">
              This is problematic for several reasons. A 7B parameter model requires approximately 80GB of GPU memory to fine-tune because you need to store not just the model weights, but also optimizer states and gradients. This means you need expensive high-end GPUs or even multiple GPUs. Additionally, training is slow and creating a new fine-tuned model for each task means storing 14GB+ copies for every variation.
            </p>

            <h3 className="text-lg font-semibold text-white mb-4">The LoRA Insight</h3>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              LoRA is built on a key observation: the changes needed to adapt a pretrained model to a new task are often low-rank. In other words, you don't need to update the full high-dimensional weight matrix—a much smaller representation can capture the essential adaptations.
            </p>

            <p className="text-gray-300 leading-relaxed mb-6">
              Think of it this way: the pretrained model already understands language, reasoning, and general knowledge. When you fine-tune for a specific task like customer support or legal analysis, you're not teaching it language from scratch—you're making targeted adjustments to emphasize certain behaviors and patterns. These adjustments can be represented efficiently.
            </p>

            <h3 className="text-lg font-semibold text-white mb-4">How LoRA Works</h3>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              Instead of updating the original weight matrix W directly, LoRA keeps W frozen and adds two small matrices: A and B. During fine-tuning, only these matrices are trained, not the original weights.
            </p>

            <p className="text-gray-300 leading-relaxed mb-6">
              Here's the mathematics: if W is a 4096×4096 matrix (16 million parameters), we can decompose the update into two much smaller matrices. Matrix A might be 4096×8 and matrix B might be 8×4096. Together, they contain only 65,536 parameters—about 0.4% of the original.
            </p>

            <p className="text-gray-300 leading-relaxed mb-6">
              During training, the model computes outputs as if it used W + BA, where BA represents the low-rank update. The beauty is that A and B are tiny compared to W, so training is fast and memory-efficient. After training, you can either keep them separate (allowing easy task-switching) or merge them into W to create a single deployable model.
            </p>

            <h3 className="text-lg font-semibold text-white mb-4">Key Parameters</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-white font-medium mb-2">Rank (r)</p>
                <p className="text-gray-300 leading-relaxed">
                  The rank determines the size of the adapter matrices. A rank of 8 means matrices of size 4096×8 and 8×4096. Lower rank means fewer trainable parameters and faster training, but may limit the model's ability to adapt. Higher rank captures more complexity but uses more memory. Common values range from 4 to 64, with 8 being a typical starting point.
                </p>
              </div>

              <div>
                <p className="text-white font-medium mb-2">Alpha</p>
                <p className="text-gray-300 leading-relaxed">
                  Alpha is a scaling factor that controls how much influence the LoRA adapters have on the final output. It's typically set to 2× the rank. For rank 8, alpha would be 16. This scaling ensures the adapter's contribution is appropriately balanced with the base model's outputs.
                </p>
              </div>

              <div>
                <p className="text-white font-medium mb-2">Target Modules</p>
                <p className="text-gray-300 leading-relaxed">
                  LoRA adapters are applied to specific layers in the model, typically the query and value projection layers in the attention mechanism. You can target more layers for potentially better performance at the cost of more trainable parameters. Common choices include q_proj and v_proj, though you can also target k_proj and o_proj.
                </p>
              </div>
            </div>
          </section>

          {/* LoRA Benefits */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Benefits of LoRA</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Massive Memory Savings</h3>
                <p className="text-gray-300 leading-relaxed">
                  LoRA reduces GPU memory requirements by 50-70% compared to full fine-tuning. A 7B model that normally requires 80GB of VRAM can be fine-tuned with just 16-24GB using LoRA. This makes it possible to train on consumer GPUs like the RTX 4090 or even older hardware that would be completely inadequate for traditional fine-tuning.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Tiny Storage Footprint</h3>
                <p className="text-gray-300 leading-relaxed">
                  LoRA adapters are typically just 10-100MB, compared to 14GB+ for a full fine-tuned 7B model. This means you can maintain dozens or even hundreds of specialized model variants while sharing a single base model. Each task gets its own lightweight adapter that loads on demand.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Fast Training</h3>
                <p className="text-gray-300 leading-relaxed">
                  Training only a small fraction of parameters means faster iteration. What might take days with full fine-tuning can complete in hours with LoRA. This faster cycle allows for more experimentation, better hyperparameter tuning, and quicker deployment of improvements.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">No Catastrophic Forgetting</h3>
                <p className="text-gray-300 leading-relaxed">
                  Because the base model's weights remain frozen, it retains all its original capabilities. A model fine-tuned for customer support doesn't lose its ability to write code or answer general questions. The adapters modify behavior without erasing knowledge.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Easy Multi-Task Serving</h3>
                <p className="text-gray-300 leading-relaxed">
                  You can load different adapters on top of the same base model to handle different tasks. The same 7B model can serve customer support, generate marketing copy, and analyze legal documents—just by swapping 20MB adapter files. This is impossible with traditional fine-tuning where each task requires its own complete 14GB model.
                </p>
              </div>
            </div>
          </section>

          {/* QLoRA Introduction */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Introducing QLoRA</h2>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              QLoRA extends LoRA by adding an additional layer of efficiency: quantization. While LoRA reduces the number of trainable parameters, QLoRA goes further by reducing the precision of the base model's weights.
            </p>

            <h3 className="text-lg font-semibold text-white mb-4">What is Quantization?</h3>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              Neural network weights are typically stored in 32-bit or 16-bit floating-point format. Each parameter is a precise decimal number like 0.47382916. Quantization compresses these high-precision values into lower-precision formats—typically 8-bit or even 4-bit representations.
            </p>

            <p className="text-gray-300 leading-relaxed mb-6">
              The key insight is that neural networks are surprisingly robust to reduced precision. A weight of 0.47382916 and 0.47 often produce nearly identical results in practice. By storing weights in 4-bit format instead of 16-bit, you reduce memory usage by 75%.
            </p>

            <h3 className="text-lg font-semibold text-white mb-4">How QLoRA Works</h3>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              QLoRA combines the parameter efficiency of LoRA with aggressive quantization of the base model. Here's the process:
            </p>

            <p className="text-gray-300 leading-relaxed mb-6">
              First, load the pretrained base model and immediately quantize its parameters to 4-bit precision using a special data type called NF4 (4-bit NormalFloat). This format is optimized for the normal distribution of neural network weights, preserving more information than standard 4-bit quantization.
            </p>

            <p className="text-gray-300 leading-relaxed mb-6">
              Second, freeze these quantized weights—they will never be updated. Third, inject LoRA adapters into the model just like standard LoRA, but keep these adapters in higher precision (16-bit bfloat16). This is crucial: the adapters need higher precision to learn effectively and compensate for any quality loss from quantization.
            </p>

            <p className="text-gray-300 leading-relaxed mb-6">
              During training, the process works as follows: during the forward pass, required weight blocks are dequantized on-the-fly from 4-bit to 16-bit for computation. The model computes outputs normally, incorporating both the dequantized base weights and the high-precision LoRA adapters. During the backward pass, gradients are calculated in 16-bit precision, and only the LoRA adapter weights are updated—the quantized base model remains frozen.
            </p>

            <h3 className="text-lg font-semibold text-white mb-4">Key Innovations in QLoRA</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-white font-medium mb-2">4-bit NormalFloat (NF4)</p>
                <p className="text-gray-300 leading-relaxed">
                  A custom 4-bit data type designed specifically for neural network weights, which tend to follow a normal distribution. NF4 is information-theoretically optimal for this distribution, meaning it preserves maximum information in just 4 bits.
                </p>
              </div>

              <div>
                <p className="text-white font-medium mb-2">Double Quantization</p>
                <p className="text-gray-300 leading-relaxed">
                  Quantization requires storing quantization constants (scaling factors used to convert between quantized and full precision). QLoRA quantizes these constants too, saving additional memory with minimal impact on quality.
                </p>
              </div>

              <div>
                <p className="text-white font-medium mb-2">Paged Optimizers</p>
                <p className="text-gray-300 leading-relaxed">
                  When GPU memory fills up during training, optimizer states are automatically paged to CPU RAM and brought back as needed. This prevents out-of-memory errors during training spikes.
                </p>
              </div>
            </div>
          </section>

          {/* QLoRA Benefits */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Benefits of QLoRA</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Extreme Memory Efficiency</h3>
                <p className="text-gray-300 leading-relaxed">
                  QLoRA makes it possible to fine-tune massive models on modest hardware. A 65-billion parameter model can be fine-tuned on a single 48GB GPU—something impossible with standard LoRA or full fine-tuning. Even a 7B model can be fine-tuned on GPUs with just 6-8GB of VRAM when using QLoRA.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Maintained Performance</h3>
                <p className="text-gray-300 leading-relaxed">
                  Despite the aggressive 4-bit quantization, QLoRA achieves performance nearly identical to 16-bit full fine-tuning. Research shows that QLoRA-trained models often reach 95-99% of full fine-tuning performance on most benchmarks. The combination of NF4 quantization and higher-precision adapters compensates for any precision loss.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Accessibility</h3>
                <p className="text-gray-300 leading-relaxed">
                  QLoRA truly democratizes LLM fine-tuning. You can fine-tune state-of-the-art models on a laptop with a consumer GPU, on free Google Colab instances, or on modest cloud instances. What once required data center infrastructure now runs on hardware accessible to individuals and small teams.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Cost Reduction</h3>
                <p className="text-gray-300 leading-relaxed">
                  Lower memory requirements translate directly to lower cloud computing costs. Training on a single consumer GPU instead of multiple enterprise GPUs can reduce costs by 70-90%. For organizations running continuous training pipelines, these savings compound rapidly.
                </p>
              </div>
            </div>
          </section>

          {/* Trade-offs */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Trade-offs and Considerations</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Training Speed</h3>
                <p className="text-gray-300 leading-relaxed">
                  QLoRA introduces computational overhead. The on-the-fly dequantization during forward and backward passes adds processing time. While QLoRA saves memory, it can be 10-30% slower per training step compared to standard LoRA. However, this is still dramatically faster than full fine-tuning.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Complexity</h3>
                <p className="text-gray-300 leading-relaxed">
                  QLoRA requires additional libraries like bitsandbytes and careful configuration. The quantization and dequantization steps add complexity compared to standard training. For simple use cases where memory isn't a constraint, LoRA without quantization may be simpler.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Slight Performance Variations</h3>
                <p className="text-gray-300 leading-relaxed">
                  While generally achieving comparable results, QLoRA may show small performance differences on specific tasks. Some benchmarks report 1-3% lower scores compared to full precision methods. For most applications this is negligible, but in performance-critical scenarios it's worth considering.
                </p>
              </div>
            </div>
          </section>

          {/* When to Use What */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">When to Use LoRA vs QLoRA</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Use LoRA When</h3>
                <div className="space-y-3">
                  <p className="text-gray-300 leading-relaxed pl-6">
                    • You have access to GPUs with sufficient memory (24GB+ for 7B models)
                  </p>
                  <p className="text-gray-300 leading-relaxed pl-6">
                    • Training speed is more important than memory efficiency
                  </p>
                  <p className="text-gray-300 leading-relaxed pl-6">
                    • You want the simplest possible implementation
                  </p>
                  <p className="text-gray-300 leading-relaxed pl-6">
                    • You need maximum performance on benchmarks
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Use QLoRA When</h3>
                <div className="space-y-3">
                  <p className="text-gray-300 leading-relaxed pl-6">
                    • Memory is limited (consumer GPUs, free Colab, modest cloud instances)
                  </p>
                  <p className="text-gray-300 leading-relaxed pl-6">
                    • You want to fine-tune very large models (30B+ parameters)
                  </p>
                  <p className="text-gray-300 leading-relaxed pl-6">
                    • Cost reduction is a priority
                  </p>
                  <p className="text-gray-300 leading-relaxed pl-6">
                    • You need to run training on budget hardware
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Practical Impact */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Practical Impact</h2>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              To understand the real-world impact, consider these numbers for fine-tuning a LLaMA-7B model:
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-white font-medium mb-2">Full Fine-Tuning</p>
                <div className="space-y-1">
                  <p className="text-gray-300 leading-relaxed pl-6">• Trainable parameters: 7 billion</p>
                  <p className="text-gray-300 leading-relaxed pl-6">• GPU memory required: 80GB+</p>
                  <p className="text-gray-300 leading-relaxed pl-6">• Adapter/model size: 14GB</p>
                  <p className="text-gray-300 leading-relaxed pl-6">• Hardware needed: Multiple A100 GPUs</p>
                </div>
              </div>

              <div>
                <p className="text-white font-medium mb-2">LoRA</p>
                <div className="space-y-1">
                  <p className="text-gray-300 leading-relaxed pl-6">• Trainable parameters: 4.2 million (0.06%)</p>
                  <p className="text-gray-300 leading-relaxed pl-6">• GPU memory required: 16-24GB</p>
                  <p className="text-gray-300 leading-relaxed pl-6">• Adapter size: 17MB</p>
                  <p className="text-gray-300 leading-relaxed pl-6">• Hardware needed: Single RTX 4090 or A10</p>
                </div>
              </div>

              <div>
                <p className="text-white font-medium mb-2">QLoRA</p>
                <div className="space-y-1">
                  <p className="text-gray-300 leading-relaxed pl-6">• Trainable parameters: 4.2 million (0.06%)</p>
                  <p className="text-gray-300 leading-relaxed pl-6">• GPU memory required: 6-8GB</p>
                  <p className="text-gray-300 leading-relaxed pl-6">• Adapter size: 17MB</p>
                  <p className="text-gray-300 leading-relaxed pl-6">• Hardware needed: RTX 3060 or free Google Colab</p>
                </div>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed">
              The progression is clear: from requiring expensive enterprise hardware for full fine-tuning, to accessible cloud GPUs for LoRA, to consumer hardware for QLoRA—all while maintaining similar performance levels.
            </p>
          </section>

          {/* Conclusion */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Conclusion</h2>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              LoRA and QLoRA represent a fundamental shift in how we fine-tune large language models. By training only a tiny fraction of parameters and optionally quantizing the base model, these techniques make customization accessible to everyone.
            </p>

            <p className="text-gray-300 leading-relaxed mb-6">
              LoRA provides the perfect balance of efficiency and simplicity for most fine-tuning needs. QLoRA pushes efficiency to the extreme, enabling scenarios that would otherwise be impossible.
            </p>

            <p className="text-gray-300 leading-relaxed">
              Together, they've democratized access to state-of-the-art model customization. What once required million-dollar budgets and dedicated AI teams can now be accomplished by individuals with modest hardware and open-source tools. This democratization is accelerating innovation and making AI more accessible across industries and applications.
            </p>
          </section>

        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 mt-16">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h3 className="text-lg font-semibold text-white mb-6">Further Reading</h3>
          
          <div className="space-y-6 mb-8">
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
                  <span className="text-xs text-gray-500">Dettmers et al. (2023) - QLoRA paper</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Technical Resources</h4>
              <div className="space-y-2">
                <a 
                  href="https://huggingface.co/docs/peft/conceptual_guides/lora" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-gray-300 hover:text-white transition-colors text-sm group"
                >
                  <span className="flex items-center gap-2">
                    Hugging Face LoRA Documentation
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                  <span className="text-xs text-gray-500">Official PEFT library guide</span>
                </a>
                
                <a 
                  href="https://www.ml6.eu/en/blog/low-rank-adaptation-a-technical-deep-dive" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-gray-300 hover:text-white transition-colors text-sm group"
                >
                  <span className="flex items-center gap-2">
                    Low Rank Adaptation: A Technical Deep Dive
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                  <span className="text-xs text-gray-500">ML6 - Detailed technical explanation</span>
                </a>
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
}