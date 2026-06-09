import React, { useState } from "react";
import VideoLessonsTab from "./lessons/VideoLessonsTab";
import InteractiveLearnTab from "./lessons/InteractiveLearnTab";

type Tab = "interactive" | "video";

export default function VideoLessonPlayer() {
  const [activeTab, setActiveTab] = useState<Tab>("interactive");
  const [isDeepView, setIsDeepView] = useState(false);

  return (
    <div className="bg-dark-bg min-h-screen flex flex-col font-sans">
      {/* ── Header ── */}
      {!isDeepView && (
        <div className="px-6 pt-8 pb-6 border-b border-divider sticky top-0 bg-dark-bg/90 backdrop-blur z-20">
          
          {/* Tab Navigation */}
        <div className="flex items-center gap-4 border-b border-divider pb-[-1px]">
          <button
            onClick={() => setActiveTab("interactive")}
            className={`pb-3 px-2 text-sm font-bold border-b-2 transition-all ${
              activeTab === "interactive"
                ? "border-gold text-gold"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Interactive Learn
          </button>
          <button
            onClick={() => setActiveTab("video")}
            className={`pb-3 px-2 text-sm font-bold border-b-2 transition-all ${
              activeTab === "video"
                ? "border-gold text-gold"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Video Lessons
          </button>
        </div>
      </div>
      )}

      {/* ── Content Area ── */}
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {activeTab === "interactive" ? (
          <InteractiveLearnTab onIsDeepView={setIsDeepView} />
        ) : (
          <VideoLessonsTab onIsDeepView={setIsDeepView} />
        )}
      </div>
    </div>
  );
}
