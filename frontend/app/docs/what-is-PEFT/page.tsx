"use client";

import { useRouter } from "next/navigation";

export default function WhatIsPEFTDoc() {
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
          <h1 className="text-3xl font-bold text-white">What is Parameter-Efficient Fine-Tuning?</h1>
          <p className="text-gray-400 mt-2">Understanding PEFT and why it matters</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="prose prose-invert max-w-none">

          {/* Introduction */}
          <section className="mb-16">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Parameter-Efficient Fine-Tuning (PEFT) is a set of techniques that allows you to adapt large language models to specific tasks by training only a small fraction of the model's parameters, while keeping most of the pretrained weights frozen.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Instead of retraining billions of parameters, PEFT methods update just a few million—sometimes less than 1% of the total model size. This makes fine-tuning accessible, affordable, and practical for organizations of all sizes.
            </p>
          </section>

          {/* The Problem */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">The Problem with Traditional Fine-Tuning</h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              Modern large language models like GPT-3, LLaMA, and Qwen contain billions of parameters. Training these models from scratch requires massive computational resources—data centers filled with high-end GPUs running for weeks or months.
            </p>

            <p className="text-gray-300 leading-relaxed mb-6">
              Traditional fine-tuning updates every single parameter in the model to adapt it for a new task. For a 7-billion parameter model, this means:
            </p>

            <div className="space-y-3 mb-6">
              <p className="text-gray-300 leading-relaxed pl-6">
                • Storing a complete 14GB copy of the model for each fine-tuned version
              </p>
              <p className="text-gray-300 leading-relaxed pl-6">
                • Requiring 80GB+ of GPU memory during training
              </p>
              <p className="text-gray-300 leading-relaxed pl-6">
                • Spending hours or days on training, even with powerful hardware
              </p>
              <p className="text-gray-300 leading-relaxed pl-6">
                • Risking catastrophic forgetting where the model loses its original capabilities
              </p>
            </div>

            <p className="text-gray-300 leading-relaxed">
              This approach is expensive, slow, and impractical for most real-world applications. PEFT solves these problems elegantly.
            </p>
          </section>

          {/* How PEFT Works */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">How PEFT Works</h2>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              The core insight behind PEFT is simple: you don't need to retrain the entire model to teach it new behaviors. The pretrained model already contains vast knowledge about language, reasoning, and world understanding. PEFT preserves this knowledge while adding specialized capabilities.
            </p>

            <p className="text-gray-300 leading-relaxed mb-4">
              PEFT methods work by:
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-white font-medium mb-2">1. Freezing the Base Model</p>
                <p className="text-gray-300 leading-relaxed pl-6">
                  All the original pretrained parameters remain unchanged. This preserves the model's general knowledge and prevents catastrophic forgetting.
                </p>
              </div>

              <div>
                <p className="text-white font-medium mb-2">2. Adding Small Trainable Components</p>
                <p className="text-gray-300 leading-relaxed pl-6">
                  A small number of new parameters—called adapters—are inserted into the model. These adapters are typically just a few megabytes in size.
                </p>
              </div>

              <div>
                <p className="text-white font-medium mb-2">3. Training Only the Adapters</p>
                <p className="text-gray-300 leading-relaxed pl-6">
                  During training, only these new parameters are updated. The base model stays frozen, dramatically reducing computational requirements.
                </p>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed">
              The result is a tiny adapter file that sits on top of the base model, modifying its behavior for your specific task while maintaining all its original capabilities.
            </p>
          </section>

          {/* Benefits */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Why PEFT Matters</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Massive Resource Savings</h3>
                <p className="text-gray-300 leading-relaxed">
                  PEFT reduces GPU memory requirements by 50-70% compared to full fine-tuning. Models that would require expensive cloud GPU instances can now be trained on consumer hardware like a laptop with a single GPU. A 7B parameter model that normally needs 80GB of VRAM can be fine-tuned with just 16GB using PEFT methods like LoRA.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Tiny Storage Footprint</h3>
                <p className="text-gray-300 leading-relaxed">
                  Instead of storing a 14GB copy of the model for each task, PEFT adapters are typically just 10-100MB. You can maintain hundreds of specialized versions of a model using the storage space that one full fine-tuned model would require. This makes it practical to serve multiple fine-tuned models from a single deployment.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Faster Training</h3>
                <p className="text-gray-300 leading-relaxed">
                  With fewer parameters to update, training completes much faster. What might take days with full fine-tuning can be done in hours or even minutes with PEFT. This faster iteration cycle means you can experiment more, test different approaches, and improve your models continuously.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Prevents Catastrophic Forgetting</h3>
                <p className="text-gray-300 leading-relaxed">
                  Traditional fine-tuning can cause models to "forget" their original training. A model trained on customer support conversations might lose its ability to write code or answer general questions. PEFT preserves the base model's capabilities because the original weights never change.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Better Generalization</h3>
                <p className="text-gray-300 leading-relaxed">
                  PEFT models are less prone to overfitting because most parameters remain static. This means they generalize better to new data and handle edge cases more gracefully than fully fine-tuned models.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Practical Multi-Tasking</h3>
                <p className="text-gray-300 leading-relaxed">
                  You can load different adapters on top of the same base model to handle different tasks. The same 7B model can serve customer support, generate marketing copy, and write code—just by swapping lightweight adapter files. This is impossible with traditional fine-tuning.
                </p>
              </div>
            </div>
          </section>

          {/* Popular PEFT Methods */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Popular PEFT Methods</h2>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              Several PEFT techniques have emerged, each with different trade-offs between efficiency and performance. Here are the most widely used:
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">LoRA (Low-Rank Adaptation)</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  LoRA is currently the most popular PEFT method. It works by adding small low-rank matrices to specific layers of the model—typically the attention layers. Instead of updating large weight matrices directly, LoRA learns smaller decomposed matrices that achieve similar results.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  For example, rather than updating a 4096×4096 weight matrix (16 million parameters), LoRA might use two matrices of size 4096×8 and 8×4096 (about 65,000 parameters combined). This is a 250x reduction in trainable parameters while maintaining comparable performance to full fine-tuning.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">QLoRA (Quantized LoRA)</h3>
                <p className="text-gray-300 leading-relaxed">
                  QLoRA extends LoRA by quantizing the base model weights from 32-bit to 4-bit precision. This further reduces memory requirements, making it possible to fine-tune a 65B parameter model on a single consumer GPU with 48GB of memory. QLoRA achieves this extreme efficiency while maintaining near-identical performance to standard LoRA.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Adapters</h3>
                <p className="text-gray-300 leading-relaxed">
                  Adapter methods insert small bottleneck layers into the transformer architecture. Each adapter layer contains a down-projection that compresses the hidden state, followed by a non-linearity, and then an up-projection that restores the original dimension. Only these adapter layers are trained while the rest of the model remains frozen.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Prefix Tuning</h3>
                <p className="text-gray-300 leading-relaxed">
                  Prefix tuning prepends learnable vectors (called prefixes) to each layer of the transformer. These prefixes act as task-specific instructions that guide the model's behavior. The base model weights remain frozen while only the prefix vectors are updated during training.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Prompt Tuning</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Prompt tuning is a simplified version of prefix tuning that only adds trainable vectors to the input layer rather than every layer. This makes it even more parameter-efficient, though it may be less powerful for complex tasks.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  It's important to note that prompt tuning optimizes the prompt representation itself, not the model. If the model hasn't seen a task during pretraining, prompt tuning alone may not be sufficient.
                </p>
              </div>
            </div>
          </section>

          {/* Performance */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">PEFT Performance</h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              The critical question is: does PEFT actually work as well as full fine-tuning?
            </p>

            <p className="text-gray-300 leading-relaxed mb-6">
              Research consistently shows that PEFT methods, particularly LoRA, achieve performance comparable to full fine-tuning while using only 0.1-1% of the trainable parameters. In many cases, PEFT even outperforms full fine-tuning, especially when training data is limited or when the task is similar to the model's pretraining.
            </p>

            <p className="text-gray-300 leading-relaxed mb-4">
              For example, fine-tuning a LLaMA-7B model with LoRA:
            </p>

            <div className="space-y-3 mb-6">
              <p className="text-gray-300 leading-relaxed pl-6">
                • Trains only 4.2 million parameters instead of 7 billion (0.06%)
              </p>
              <p className="text-gray-300 leading-relaxed pl-6">
                • Reduces GPU memory from 80GB to 16GB
              </p>
              <p className="text-gray-300 leading-relaxed pl-6">
                • Creates adapter files of just 17MB instead of 14GB checkpoints
              </p>
              <p className="text-gray-300 leading-relaxed pl-6">
                • Achieves 95-99% of full fine-tuning performance on most tasks
              </p>
            </div>

            <p className="text-gray-300 leading-relaxed">
              The small performance gap is often negligible for practical applications, and the massive efficiency gains make it a clear choice for most use cases.
            </p>
          </section>

          {/* When to Use PEFT */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">When to Use PEFT</h2>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              PEFT is ideal for most fine-tuning scenarios, but understanding when it works best helps you make informed decisions.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Perfect for PEFT</h3>
                <div className="space-y-3">
                  <p className="text-gray-300 leading-relaxed pl-6">
                    • Adapting models to specific domains (customer support, legal documents, medical texts)
                  </p>
                  <p className="text-gray-300 leading-relaxed pl-6">
                    • Instruction tuning and chat alignment
                  </p>
                  <p className="text-gray-300 leading-relaxed pl-6">
                    • Customizing tone, style, or formatting preferences
                  </p>
                  <p className="text-gray-300 leading-relaxed pl-6">
                    • Limited computational resources or budget constraints
                  </p>
                  <p className="text-gray-300 leading-relaxed pl-6">
                    • Maintaining multiple specialized versions of a model
                  </p>
                  <p className="text-gray-300 leading-relaxed pl-6">
                    • Small to medium-sized datasets (hundreds to thousands of examples)
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Consider Full Fine-Tuning When</h3>
                <div className="space-y-3">
                  <p className="text-gray-300 leading-relaxed pl-6">
                    • The new task is completely different from pretraining (e.g., adapting a text model to code generation)
                  </p>
                  <p className="text-gray-300 leading-relaxed pl-6">
                    • You have massive amounts of high-quality training data
                  </p>
                  <p className="text-gray-300 leading-relaxed pl-6">
                    • Maximum performance is critical and resources are not a constraint
                  </p>
                  <p className="text-gray-300 leading-relaxed pl-6">
                    • The model needs to learn entirely new capabilities not present in pretraining
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Real-World Impact */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Real-World Impact</h2>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              PEFT has democratized access to state-of-the-art language models. What once required dedicated AI teams and million-dollar infrastructure budgets can now be accomplished by small teams on modest hardware.
            </p>

            <p className="text-gray-300 leading-relaxed mb-4">
              Organizations are using PEFT to:
            </p>

            <div className="space-y-3 mb-6">
              <p className="text-gray-300 leading-relaxed pl-6">
                • Train domain-specific models on standard cloud GPUs or even laptops
              </p>
              <p className="text-gray-300 leading-relaxed pl-6">
                • Deploy dozens of specialized models from a single base model
              </p>
              <p className="text-gray-300 leading-relaxed pl-6">
                • Iterate rapidly on model improvements without weeks of training
              </p>
              <p className="text-gray-300 leading-relaxed pl-6">
                • Reduce cloud computing costs by 70-90% compared to full fine-tuning
              </p>
              <p className="text-gray-300 leading-relaxed pl-6">
                • Build AI applications that would have been economically unfeasible before
              </p>
            </div>

            <p className="text-gray-300 leading-relaxed">
              The efficiency gains aren't just about cost—they enable faster experimentation, quicker deployment, and more sustainable AI development practices.
            </p>
          </section>

          {/* Getting Started */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Getting Started with PEFT</h2>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              The Hugging Face PEFT library provides easy-to-use implementations of all major PEFT methods. It integrates seamlessly with the Transformers library, making it straightforward to apply PEFT to any supported model.
            </p>

            <p className="text-gray-300 leading-relaxed mb-4">
              With LoRA Factory, we handle all the complexity of PEFT for you:
            </p>

            <div className="space-y-3">
              <p className="text-gray-300 leading-relaxed pl-6">
                • Collect feedback through natural conversations
              </p>
              <p className="text-gray-300 leading-relaxed pl-6">
                • Automatically filter and clean training data
              </p>
              <p className="text-gray-300 leading-relaxed pl-6">
                • Configure LoRA parameters for your specific needs
              </p>
              <p className="text-gray-300 leading-relaxed pl-6">
                • Train lightweight adapters without managing infrastructure
              </p>
              <p className="text-gray-300 leading-relaxed pl-6">
                • Deploy and version your fine-tuned models effortlessly
              </p>
            </div>
          </section>

          {/* Conclusion */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Conclusion</h2>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              Parameter-Efficient Fine-Tuning represents a fundamental shift in how we adapt large language models. By training only a tiny fraction of parameters, PEFT makes fine-tuning accessible, practical, and economical for organizations of all sizes.
            </p>

            <p className="text-gray-300 leading-relaxed">
              Whether you're building a customer service chatbot, creating domain-specific text generators, or customizing models for specialized tasks, PEFT provides a proven path to high-quality results without the traditional barriers of cost, time, and computational resources.
            </p>
          </section>

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
                  <span className="text-xs text-gray-500">Hu et al. (2021)</span>
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
                  <span className="text-xs text-gray-500">Dettmers et al. (2023)</span>
                </a>

                <a 
                  href="https://arxiv.org/abs/2403.14608" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-gray-300 hover:text-white transition-colors text-sm group"
                >
                  <span className="flex items-center gap-2">
                    Parameter-Efficient Fine-Tuning: A Comprehensive Survey
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                  <span className="text-xs text-gray-500">Han et al. (2024)</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Technical Resources</h4>
              <div className="space-y-2">
                <a 
                  href="https://huggingface.co/docs/peft" 
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
                  <span className="text-xs text-gray-500">Official library documentation</span>
                </a>
                
                <a 
                  href="https://github.com/huggingface/peft" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-gray-300 hover:text-white transition-colors text-sm group"
                >
                  <span className="flex items-center gap-2">
                    PEFT GitHub Repository
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                  <span className="text-xs text-gray-500">Code examples and implementations</span>
                </a>
              </div>
            </div>
          </div>

          {/* <div className="pt-6 border-t border-gray-800">
            <p className="text-sm text-gray-500 text-center">
              Have questions about PEFT?{" "}
              <a href="mailto:support@lorafactory.com" className="text-gray-400 hover:text-white transition-colors">
                Contact support
              </a>
            </p>
          </div> */}
        </div>
      </div>

        </div>
      </div>

      
    </div>
  );
}