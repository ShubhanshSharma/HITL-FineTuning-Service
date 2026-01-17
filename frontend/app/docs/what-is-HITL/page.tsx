"use client";

import { useRouter } from "next/navigation";

export default function WhatIsHITLDoc() {
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
          <h1 className="text-3xl font-bold text-white">What is Human-in-the-Loop?</h1>
          <p className="text-gray-400 mt-2">Understanding HITL and how we use it for LoRA training</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="prose prose-invert max-w-none">

          {/* Introduction */}
          <section className="mb-16">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Human-in-the-Loop (HITL) is an approach to machine learning where humans actively participate in the training, evaluation, and refinement of AI models. Rather than relying solely on automated processes, HITL integrates human judgment, expertise, and feedback directly into the learning cycle.
            </p>
            <p className="text-gray-300 leading-relaxed">
              The core idea is simple: machines are excellent at processing large volumes of data quickly, but humans excel at nuanced judgment, contextual understanding, and identifying edge cases. HITL combines these complementary strengths to create AI systems that are more accurate, reliable, and aligned with human values.
            </p>
          </section>

          {/* Why HITL Matters */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Why HITL Matters</h2>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              Even the most sophisticated AI models struggle with ambiguity, bias, and scenarios they haven't encountered during training. A model trained to classify customer support tickets might confidently misclassify edge cases or fail to understand subtle context that a human would immediately recognize.
            </p>

            <p className="text-gray-300 leading-relaxed mb-6">
              HITL addresses these limitations by keeping humans actively involved in the process. When a model encounters uncertainty or makes mistakes, human experts step in to provide guidance. This feedback isn't just used to correct that single instance—it's fed back into the training process to improve the model's future performance.
            </p>

            <p className="text-gray-300 leading-relaxed">
              This creates a continuous improvement cycle where the model gets smarter with each interaction, learning not just from data but from human expertise and real-world experience.
            </p>
          </section>

          {/* How HITL Works */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">How HITL Works</h2>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              HITL can be applied at different stages of the machine learning pipeline. Understanding these stages helps clarify where and how human input creates the most value.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Data Labeling and Annotation</h3>
                <p className="text-gray-300 leading-relaxed">
                  Supervised learning requires labeled training data. Humans review raw data—whether text, images, or other formats—and provide labels or annotations. For a customer service chatbot, this might mean labeling conversations as "billing question," "technical support," or "complaint." These human-labeled examples become the foundation the model learns from.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Model Evaluation and Validation</h3>
                <p className="text-gray-300 leading-relaxed">
                  After training, humans evaluate the model's predictions to assess quality and identify weaknesses. Does the model consistently misunderstand certain types of requests? Are there patterns in its errors? Human reviewers catch issues that automated metrics might miss, especially those requiring subjective judgment or domain expertise.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Active Learning and Selective Feedback</h3>
                <p className="text-gray-300 leading-relaxed">
                  Rather than having humans review every prediction, active learning identifies cases where the model is least confident or most likely to be wrong. The system flags these uncertain examples for human review, making efficient use of human time by focusing on the data points that will improve the model most.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Continuous Monitoring and Correction</h3>
                <p className="text-gray-300 leading-relaxed">
                  Once deployed, HITL systems continue to learn. When the model makes predictions in production, humans monitor outputs and provide corrections when needed. These corrections are captured as new training data, allowing the model to adapt to changing patterns, new scenarios, and evolving user needs.
                </p>
              </div>
            </div>
          </section>

          {/* Benefits of HITL */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Benefits of HITL</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Improved Accuracy and Reliability</h3>
                <p className="text-gray-300 leading-relaxed">
                  Human oversight catches errors that automated systems miss. By incorporating human feedback, models become more accurate on edge cases and ambiguous scenarios. This is especially valuable in high-stakes applications like medical diagnosis, legal analysis, or financial decision-making where errors have serious consequences.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Reduced Bias and Fairness</h3>
                <p className="text-gray-300 leading-relaxed">
                  Machine learning models can inherit biases present in training data. Human reviewers can identify when a model exhibits unfair patterns—for example, systematically disadvantaging certain demographics—and provide corrective feedback. While humans have biases too, conscious human oversight provides an additional layer of fairness checking that pure automation lacks.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Faster Learning with Less Data</h3>
                <p className="text-gray-300 leading-relaxed">
                  HITL enables models to learn more efficiently by focusing on the most informative examples. Rather than requiring millions of random training samples, active learning identifies specific cases where human feedback will have the greatest impact. This means you can build effective models with smaller, more curated datasets.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Adaptability to Change</h3>
                <p className="text-gray-300 leading-relaxed">
                  Real-world environments evolve. Customer preferences shift, new products launch, language patterns change. HITL systems adapt naturally because they continuously incorporate fresh human feedback. When the world changes, your model changes with it without requiring complete retraining from scratch.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Safety and Accountability</h3>
                <p className="text-gray-300 leading-relaxed">
                  For critical applications, having humans in the loop provides necessary guardrails. Automated decisions can be paused for human review when confidence is low or stakes are high. This creates accountability—responsibility doesn't rest solely with the algorithm but with humans who oversee and validate its outputs.
                </p>
              </div>
            </div>
          </section>

          {/* Challenges */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Challenges of HITL</h2>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              While HITL offers significant advantages, it comes with trade-offs that need to be managed thoughtfully.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Time and Cost</h3>
                <p className="text-gray-300 leading-relaxed">
                  Human involvement requires time and money. Reviewing predictions, labeling data, and providing feedback are labor-intensive tasks. For applications requiring specialized expertise—like medical imaging or legal document analysis—costs can be substantial. The key is focusing human effort where it matters most through techniques like active learning.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Slower Iteration</h3>
                <p className="text-gray-300 leading-relaxed">
                  Fully automated systems can retrain and update instantly. HITL introduces human bottlenecks. Collecting feedback, scheduling review sessions, and incorporating human input takes time. For applications requiring rapid iteration, this can be a constraint that needs careful workflow design to minimize.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Human Inconsistency</h3>
                <p className="text-gray-300 leading-relaxed">
                  Different humans may label the same data differently. Individual reviewers have good and bad days. These inconsistencies can introduce noise into training data. Good HITL systems account for this through techniques like multiple reviewers, clear labeling guidelines, and consensus mechanisms.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Scalability Limits</h3>
                <p className="text-gray-300 leading-relaxed">
                  As data volumes grow, human review becomes increasingly difficult to scale. A system processing millions of transactions daily can't have humans review everything. Success requires intelligent selection of what humans review, automated handling of confident predictions, and escalation only for uncertain cases.
                </p>
              </div>
            </div>
          </section>

          {/* HITL in LoRA Factory */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">HITL in LoRA Generation</h2>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              Our platform implements HITL specifically for fine-tuning language models through a continuous feedback collection and training cycle. Here's how it works in practice.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Step 1: Natural Conversation</h3>
                <p className="text-gray-300 leading-relaxed">
                  Users interact with the base language model through our chat interface. These aren't artificial training scenarios—they're real conversations where people ask questions, request assistance, or engage with the model for actual tasks. Every interaction captures authentic use cases and real-world language patterns.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Step 2: Human Feedback Collection</h3>
                <p className="text-gray-300 leading-relaxed">
                  After each model response, users provide feedback. This might be as simple as thumbs up or down, or more detailed corrections and improvements. Users flag responses that are inaccurate, unhelpful, or miss the mark. They can also provide examples of better responses. This feedback is the human element—real users telling the system what works and what doesn't.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Step 3: Automatic Quality Filtering</h3>
                <p className="text-gray-300 leading-relaxed">
                  Not all feedback is created equal. Our system automatically filters the collected feedback to remove harmful content, detect low-quality interactions, and identify spam or noise. This ensures that only clean, valuable training data makes it into the dataset. We check for inappropriate content, verify data quality, and validate that conversations are constructive and relevant.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Step 4: Dataset Creation</h3>
                <p className="text-gray-300 leading-relaxed">
                  Filtered feedback is structured into JSONL format—the standard format for training language models. Each conversation becomes a training example with clear input-output pairs. The system organizes these into coherent training datasets that capture the patterns, style, and knowledge you want the model to learn.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Step 5: LoRA Adapter Training</h3>
                <p className="text-gray-300 leading-relaxed">
                  With a clean dataset in hand, we train a LoRA adapter—a lightweight fine-tuning module that adapts the base model to your specific needs. The adapter learns from the human feedback, incorporating corrections, preferred responses, and domain-specific patterns. This training uses parameter-efficient techniques, so you get a customized model without the cost and complexity of full fine-tuning.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Step 6: Continuous Improvement</h3>
                <p className="text-gray-300 leading-relaxed">
                  Once the adapter is deployed, the cycle continues. New conversations generate new feedback. Users interact with the improved model and provide additional corrections. This creates an ongoing improvement loop where your model gets better over time, continuously learning from real usage and human expertise.
                </p>
              </div>
            </div>
          </section>

          {/* Why This Matters */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Why This Matters for Fine-Tuning</h2>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              Traditional fine-tuning requires you to create training datasets manually—writing example conversations, crafting ideal responses, and labeling data before you even start training. This is time-consuming, expensive, and often results in datasets that don't reflect real usage.
            </p>

            <p className="text-gray-300 leading-relaxed mb-6">
              HITL changes this fundamentally. Your training data comes from actual conversations with real users. The feedback is organic—people telling you what they actually want, not what you think they want. The model learns from genuine use cases, making it more practical and better aligned with actual needs.
            </p>

            <p className="text-gray-300 leading-relaxed mb-6">
              More importantly, this approach scales naturally. As more people use your model, you collect more feedback. More feedback means better training data. Better training data produces better models. Better models attract more users. It's a virtuous cycle where human interaction continuously drives model improvement.
            </p>

            <p className="text-gray-300 leading-relaxed">
              This is why HITL is so powerful for fine-tuning. It transforms model development from a one-time engineering effort into an ongoing collaboration between humans and AI, where each learns from the other.
            </p>
          </section>

          {/* Real-World Applications */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Real-World Applications</h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              HITL is used across industries where accuracy, fairness, and reliability matter:
            </p>

            <div className="space-y-3 mb-6">
              <p className="text-gray-300 leading-relaxed pl-6">
                • Content moderation systems flag potentially harmful content for human review
              </p>
              <p className="text-gray-300 leading-relaxed pl-6">
                • Medical imaging tools highlight potential abnormalities for radiologist verification
              </p>
              <p className="text-gray-300 leading-relaxed pl-6">
                • Customer service chatbots escalate complex issues to human agents
              </p>
              <p className="text-gray-300 leading-relaxed pl-6">
                • Fraud detection systems flag suspicious transactions for manual investigation
              </p>
              <p className="text-gray-300 leading-relaxed pl-6">
                • Autonomous vehicles request human intervention in ambiguous situations
              </p>
              <p className="text-gray-300 leading-relaxed pl-6">
                • Recruitment platforms have humans review AI-generated candidate shortlists
              </p>
            </div>

            <p className="text-gray-300 leading-relaxed">
              In each case, HITL provides the oversight, judgment, and adaptability that pure automation cannot yet achieve.
            </p>
          </section>

          {/* Conclusion */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Conclusion</h2>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              Human-in-the-Loop isn't about replacing automation—it's about augmenting it with human intelligence. It recognizes that the best AI systems combine machine efficiency with human judgment, creating solutions more capable than either alone.
            </p>

            <p className="text-gray-300 leading-relaxed">
              For fine-tuning language models, HITL provides a practical path to continuous improvement. Real conversations generate real feedback. Real feedback creates quality training data. Quality training data produces better models. And better models serve your users more effectively, completing the cycle. This is machine learning that learns from the people who matter most—the ones actually using it.
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
              <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Articles & Guides</h4>
              <div className="space-y-2">
                <a 
                  href="https://www.ibm.com/think/topics/human-in-the-loop" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-gray-300 hover:text-white transition-colors text-sm group"
                >
                  <span className="flex items-center gap-2">
                    What Is Human In The Loop (HITL)?
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                  <span className="text-xs text-gray-500">IBM - Comprehensive overview</span>
                </a>
                
                <a 
                  href="https://cloud.google.com/discover/human-in-the-loop" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-gray-300 hover:text-white transition-colors text-sm group"
                >
                  <span className="flex items-center gap-2">
                    Human-in-the-Loop in AI & ML
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                  <span className="text-xs text-gray-500">Google Cloud - Practical guide</span>
                </a>

                <a 
                  href="https://builtin.com/machine-learning/human-in-the-loop-hitl" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-gray-300 hover:text-white transition-colors text-sm group"
                >
                  <span className="flex items-center gap-2">
                    Human in the Loop (HITL) in Machine Learning
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                  <span className="text-xs text-gray-500">Built In - Industry applications</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Research Papers</h4>
              <div className="space-y-2">
                <a 
                  href="https://link.springer.com/article/10.1007/s10462-022-10246-w" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-gray-300 hover:text-white transition-colors text-sm group"
                >
                  <span className="flex items-center gap-2">
                    Human-in-the-loop Machine Learning: A State of the Art
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                  <span className="text-xs text-gray-500">Academic review of HITL techniques</span>
                </a>
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
}