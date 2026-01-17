"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";


export interface SidebarModel {
  id: string; // UUID serialized as string
  version: number;
  status: string;
  adapter_url?: string | null;
  row_count?: number | null;
}

export interface SidebarData {
  org_id: string;

  chat: {
    live_model_id: string | null;
    live_model_version: number | null;
  };

  training: {
    latest_model_id: string | null;
    latest_model_version: number | null;
    latest_status: string;
  };

  feedback: {
    count: number;
  };

  models: SidebarModel[];
}


export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<SidebarData | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    if (token) {
      fetchSidebarData();
      const interval = setInterval(fetchSidebarData, 60000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchSidebarData = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/sidebar/get-sidebar`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.ok) {
        const sidebarData = await res.json();
        setData(sidebarData);
      }
    } catch (error) {
      console.error("Failed to fetch sidebar data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    router.push("/login");
  };

  const getStatusColor = (status: string) => {
    const colors = {
      COLLECTING_FEEDBACK: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      TRAINING_REQUESTED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      TRAINING_IN_PROGRESS: "bg-orange-500/10 text-orange-400 border-orange-500/30",
      FINISHED: "bg-green-500/10 text-green-400 border-green-500/30",
      FAILED: "bg-red-500/10 text-red-400 border-red-500/30",
      DONE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      NO_MODEL: "bg-gray-500/10 text-gray-400 border-gray-500/30",
    };
    type Status = keyof typeof colors
    return colors[status as Status] || colors.NO_MODEL;
  };

  const getStatusIcon = (status: string) => {
    if (status === "TRAINING_IN_PROGRESS") {
      return (
        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      );
    }
    return <div className="w-2 h-2 rounded-full bg-current" />;
  };

  const NavItem = ({ href, icon, label, badge, subInfo, highlight = false }: { href: string; icon: React.ReactNode; label: string; badge?: React.ReactNode; subInfo?: string; highlight?: boolean }) => {
    const isActive = pathname === href;
    return (
      <button
        onClick={() => router.push(href)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all group ${
          isActive
            ? "bg-linear-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/40"
            : "hover:bg-gray-800/60 border border-transparent"
        } ${highlight ? "ring-2 ring-green-500/50 animate-pulse" : ""}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`shrink-0 ${isActive ? "text-blue-400" : "text-gray-400 group-hover:text-gray-300"}`}>
            {icon}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <div className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-gray-300"}`}>
                {label}
              </div>
              {subInfo && (
                <div className="text-xs text-gray-500 mt-0.5">
                  {subInfo}
                </div>
              )}
            </div>
          )}
        </div>
        {!isCollapsed && badge && (
          <div className="shrink-0">{badge}</div>
        )}
      </button>
    );
  };

  const SectionHeader = ({ children }: { children: React.ReactNode }) => (
    !isCollapsed && (
      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {children}
      </div>
    )
  );

  if (!isAuthenticated) {
    return (
      <div className="w-72 h-screen bg-linear-to-b from-gray-950 to-black border-r border-gray-800 flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">LoRA Factory</h2>
            <p className="text-sm text-gray-400">Sign in to start training</p>
          </div>
          <div className="space-y-3 w-full">
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/register")}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-xl transition-all border border-gray-700"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  const readyForTraining = (data?.feedback?.count ?? 0) >= 20;

  return (
    <div
      className={`${
        isCollapsed ? "w-20" : "w-72"
      } h-screen bg-linear-to-b font-sans from-gray-950 to-black border-r border-gray-800 flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div onClick={() => router.push('/home')} className="flex cursor-pointer items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">H.I.T.L</h1>
                {/* <p className="text-xs text-gray-500">Org: {data?.org_id?.substring(0, 8)}...</p> */}
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <svg
              className={`w-5 h-5 transition-transform ${
                isCollapsed ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-1 space-y-6">
        {/* Feedback Loop Section */}
        <div className="space-y-2">
          {/* <SectionHeader>Feedback Loop</SectionHeader> */}
          <NavItem
            href="/chat"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            }
            label="Chat"
            subInfo={
              (data?.chat?.live_model_version ?? 0) >= 0
                ? `Model v${data?.chat?.live_model_version}`
                : "No model active"
            }
            badge={
              <div className="flex items-center gap-2">
                {(data?.chat?.live_model_version ?? 0) >= 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-400 font-medium">
                      Live
                    </span>
                  </div>
                )}
                {(data?.feedback?.count ?? 0) > 0 && (
                  <div className="px-2 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
                    <span className="text-xs text-blue-400 font-bold">
                      {data?.feedback.count}
                    </span>
                  </div>
                )}
              </div>
            }
          />
        </div>

        {/* Dataset Builder Section */}
        <div className="space-y-2">
          {/* <SectionHeader>Dataset</SectionHeader> */}
          <NavItem
            href="/create-dataset"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                />
              </svg>
            }
            label="Create Dataset"
            subInfo={`${data?.feedback?.count || 0} feedback items`}
            highlight={readyForTraining}
            
          />
        </div>

        {/* Training Section */}
        <div className="space-y-2">
          {/* <SectionHeader>Training</SectionHeader> */}
          <NavItem
            href="/training-orchestration"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            }
            label="Training"
            subInfo={`v${data?.training.latest_model_version}`}
            badge={
              data?.training?.latest_status &&
              data.training.latest_status !== "NO_MODEL" && (
                <div
                  className={`px-2 py-1 rounded-full border flex items-center gap-1.5 ${getStatusColor(
                    data.training.latest_status
                  )}`}
                >
                  {getStatusIcon(data.training.latest_status)}
                  <span className="text-xs font-medium">
                    {data.training.latest_status.replace(/_/g, " ").substring(0, 15)}
                  </span>
                </div>
              )
            }
          />
        </div>

        {/* adapter-configuration */}
        <div className="space-y-2">
          {/* <SectionHeader>Output</SectionHeader> */}
          <NavItem
            href="/adapter-configuration"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            }
            label="Generate Adapter"
            subInfo={`${
              data?.models.filter((model) => model.status === "READY").length ||
              0
            } adapters generated`}
            badge={
              (data?.models?.length ?? 0) > 0 && (
                <div className="px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                  <span className="text-xs text-purple-400 font-bold">
                    {
                      data?.models?.filter((model) => model.status === "READY")
                        .length
                    }
                  </span>
                </div>
              )
            }
          />
        </div>

        {/* Models Section */}
        <div className="space-y-2">
          {/* <SectionHeader>Output</SectionHeader> */}
          <NavItem
            href="/models"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18h12"
                />
              </svg>
            }
            label="History"
            subInfo={`${data?.models?.length || 0} models trained`}
            badge={
              (data?.models?.length ?? 0) > 0 && (
                <div className="px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                  <span className="text-xs text-purple-400 font-bold">
                    {data?.models.length}
                  </span>
                </div>
              )
            }
          />
        </div>

        {/* Settings & Help */}
        <div className="space-y-2 pt-4 border-t border-gray-800">
          <NavItem
            href="/docs"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l-2 2 2 2M14 14l2 2-2 2"
                />
              </svg>
            }
            label="Docs"
          />
          <NavItem
            href="/settings"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
            label="Settings"
          />
          <NavItem
            href="/help"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            label="Help "
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all text-gray-400 hover:text-red-400 border border-transparent hover:border-red-500/30"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}