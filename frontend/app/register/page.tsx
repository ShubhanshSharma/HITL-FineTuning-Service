// app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BasicInfoForm from "./components/BasicInfoForm";
import LLMConfigForm from "./components/LLMConfigForm";

export interface RegistrationData {
  company_name: string;
  contact_name: string;
  email: string;
  password: string;
  llmEndpoint: string;
  api_key: string;
  model: string;
  webhookEndpoint: string;
}

export interface LLMConfig {
  template: string;
  endpoint: string;
  method: string;
  auth: {
    type: string;
    header: string;
    prefix: string;
  };
  payload_defaults: {
    temperature: number;
    max_tokens: number;
  };
  request_mapping: {
    model: string;
    messages: string;
    temperature: string;
    max_tokens: string;
  };
  response_mapping: {
    text: string;
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  const handleBasicInfoSubmit = (data: RegistrationData) => {
    setRegistrationData(data);
    setStep(2);
  };

  const handleBackToBasicInfo = () => {
    setStep(1);
  };

  const handleRegistrationComplete = () => {
    router.push("/chat");
  };

  return (
    <div className="min-h-screen bg-black font-sans text-white">
      {step === 1 && (
        <BasicInfoForm onSubmit={handleBasicInfoSubmit} />
      )}
      
      {step === 2 && registrationData && (
        <LLMConfigForm
          registrationData={registrationData}
          onBack={handleBackToBasicInfo}
          onComplete={handleRegistrationComplete}
        />
      )}
    </div>
  );
}