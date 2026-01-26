"use client";

import { useRouter } from "next/navigation";
import { Noto_Serif } from "next/font/google";


  const notoSerif = Noto_Serif({
    subsets: ['latin']
  })
  
export default function LandingPage() {
  const router = useRouter();
  
  return (
    <div className="bg-linear-to-r from-gray-950 via-gray-950 to-black font-sans text-white min-h-screen">
      

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-10  ">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-18">
            <span className={` ${notoSerif.className} text-4xl font-black bg-linear-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent md:text-7xl `}>
              HITL LoRA Pipeline
            </span>
          </div>

          <h1 className="text-sm text-gray-400 font-stretch-extra-expanded capitalize  md:text-lg font-thin mb-20">
            human - in - the - loop
          </h1>


          <p className="text-xl italic text-gray-400 mb-20 max-w-2xl mx-auto font-extralight">
            Collect real conversations, filter quality data, and train custom LoRA adapters — all in one platform.
          </p>

          <div className="flex items-center justify-center gap-4 mb-20">
            <button
              onClick={() => {
                if (typeof window !== "undefined" && !localStorage.getItem("token")) {
                  router.push("/register");
                }else{router.push('/chat')}
              }}
              
              className="px-8 py-4 font-thin bg-linear-to-r from-blue-600 to-purple-600 rounded-xl  hover:from-blue-700 hover:to-purple-700 transition-all transform hover:-translate-y-1"
            >
              Start Training Free
            </button>
            <a
              href="/docs"
              className="px-8 py-4 font-thin  bg-gray-800 rounded-xl hover:bg-gray-700 transition-all border border-gray-700"
            >
              Learn More
            </a>
          </div>

          {/* Hero Visual */}
          <div className=" relative">
            <div className="bg-linear-to-r from-blue-600 to-purple-600 p-0.5 rounded-2xl hover:transform hover:-translate-y-1 transition-all">
              <div className="bg-black rounded-2xl p-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-900 rounded-lg p-6 text-left">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Collect</h3>
                    <p className="text-sm text-gray-400">Collect feedbacks from LLM response</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-6 text-left">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Filter</h3>
                    <p className="text-sm text-gray-400">select feedbacks to finetune LLM</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-6 text-left">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Generate</h3>
                    <p className="text-sm text-gray-400">Generate JSONL / LoRA adapters</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-40 px-6 ">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-48">
            <h2 className="text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">Three simple steps to custom models</p>
          </div>

          <div className="space-y-80">
            {/* Step 1 */}
            <div className="flex items-center gap-12">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                    <span className="text-2xl font-bold text-blue-400">1</span>
                  </div>
                  <h3 className="text-3xl font-bold">Collect Feedback</h3>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Chat with your model and collect real user interactions. Every conversation becomes training data.
                </p>
              </div>
              <div className="flex-1">
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">what is http?</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">http is a communication protocol...</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Feedback collected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-12 flex-row-reverse">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                    <span className="text-2xl font-bold text-purple-400">2</span>
                  </div>
                  <h3 className="text-3xl font-bold">Auto-Filter Data</h3>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Select from collected feedbacks usefull for finetuning. Our system automatically checks and filters harmful or low-quality feedback to create clean JSONL datasets.
                </p>
              </div>
              <div className="flex-1">
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <span className="text-sm text-gray-300">Quality check passed</span>
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <span className="text-sm text-gray-300">Harmful content detected</span>
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <span className="text-sm text-gray-300">Format validated</span>
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-xs text-blue-300">✓ Dataset ready: 127 clean samples</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-12">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
                    <span className="text-2xl font-bold text-green-400">3</span>
                  </div>
                  <h3 className="text-3xl font-bold">Train LoRA Adapters</h3>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Configure training parameters and create custom LoRA adapters optimized for your use case.
                </p>
              </div>
              <div className="flex-1">
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-400">Training Progress</span>
                        <span className="text-sm text-green-400">68%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="bg-linear-to-r from-blue-500 to-green-500 h-2 rounded-full" style={{ width: "68%" }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Rank</p>
                        <p className="text-lg font-semibold text-white">8</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Alpha</p>
                        <p className="text-lg font-semibold text-white">16</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Epochs</p>
                        <p className="text-lg font-semibold text-white">3</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Batch Size</p>
                        <p className="text-lg font-semibold text-white">4</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-40">
            <h2 className="text-5xl font-bold mb-4">Built for Quality</h2>
            <p className="text-gray-400 text-lg">Everything you need to train better models</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:transform hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 border border-blue-500/30">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Auto Safety Checks</h3>
              <p className="text-gray-400">Automatically filter harmful and low-quality data before training.</p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:transform hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 border border-purple-500/30">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Custom Configuration</h3>
              <p className="text-gray-400">Fine-tune LoRA parameters to match your specific requirements.</p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:transform hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6 border border-green-500/30">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Fast Iteration</h3>
              <p className="text-gray-400">Deploy and test new models quickly with version control.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative flex justify-center px-6 h-dvh">
        <div className="relative max-w-4xl m-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to Build Better Models?</h2>
          <p className="text-xl text-gray-400 mb-12">Start collecting feedback and training custom LoRA adapters today.</p>
          <button
            onClick={() => {
                if (typeof window !== "undefined" && !localStorage.getItem("token")) {
                  router.push("/register");
                }else{router.push('/chat')}
              }}
            className="px-10 py-5 bg-linear-to-r from-blue-600 to-purple-600 rounded-xl font-thin text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:-translate-y-1"
          >
            Start Training Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-5 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-semibold">H.I.T.L</span>
            </div>
            <p className="text-sm text-gray-500">© 2026 H.I.T.L. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}