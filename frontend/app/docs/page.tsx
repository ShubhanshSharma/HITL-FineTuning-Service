"use client";

import { useRouter } from "next/navigation";

export default function DocsPage() {
  const router = useRouter();

  const docs = [
    {
      id: "what-is-PEFT",
      title: "What is Parameter Efficient Finetuning(PEFT)?",
      description: "Understand the concept of PEFT.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      id: "what-is-HITL",
      title: "What is HITL",
      description: "Learn about HITL and how it is used for training.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: "adapter-configuration",
      title: "Adapter Configuration",
      description: "Complete guide to configuring LoRA parameters like rank, alpha, and target modules.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: "LoRA-and-QLoRA",
      title: "LoRA & QLoRA",
      description: "Understand LoRA and QLoRA.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen font-sans bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Back</span>
          </button>
          <h1 className="text-3xl font-bold text-white">Documentation</h1>
          <p className="text-gray-400 mt-2">Everything you need to know about finetuning with HITL LoRA Finetuning</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-3">
          {docs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => router.push(`/docs/${doc.id}`)}
              className="w-full text-left bg-gray-900/30 hover:bg-gray-900/60 border border-gray-800 hover:border-gray-700 rounded-lg p-6 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-gray-700 transition-all">
                  {doc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-white mb-1 group-hover:text-gray-100">
                    {doc.title}
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {doc.description}
                  </p>
                </div>
                <div className="shrink-0">
                  <svg
                    className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer Help */}
        {/* <div className="mt-16 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500 text-center">
            Can't find what you're looking for?{" "}
            <a href="mailto:support@lorafactory.com" className="text-gray-400 hover:text-white transition-colors">
              Contact support
            </a>
          </p>
        </div> */}
      </div>
    </div>
  );
}