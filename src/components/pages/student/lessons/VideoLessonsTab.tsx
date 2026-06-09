import React, { useState, useEffect } from "react";
import { VIDEO_LESSONS, getDriveEmbedUrl, VideoLesson } from "../../../../data/lessons/videoLessons";
import { Badge } from "../../../ui";

const LEVEL_COLOR: Record<string, string> = {
  Beginner: "text-green-400 bg-green-900/30 border-green-700/30",
  Intermediate: "text-yellow-400 bg-yellow-900/30 border-yellow-700/30",
  Advanced: "text-red-400 bg-red-900/30 border-red-700/30",
};

export default function VideoLessonsTab({ onIsDeepView }: { onIsDeepView?: (isDeep: boolean) => void }) {
  const [activeLesson, setActiveLesson] = useState<VideoLesson | null>(null);

  useEffect(() => {
    onIsDeepView?.(activeLesson !== null);
  }, [activeLesson, onIsDeepView]);

  // If a lesson is selected, show the player view
  if (activeLesson) {
    return (
      <div className="flex flex-col h-full animate-fadeIn">
        <button
          onClick={() => setActiveLesson(null)}
          className="self-start text-gray-400 hover:text-white flex items-center gap-2 mb-4 text-sm font-semibold transition-colors"
        >
          <span className="text-lg">←</span> Back to Library
        </button>

        <div className="flex-1 flex flex-col lg:flex-row gap-6">
          {/* Main Video Area */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl relative" style={{ aspectRatio: "16/9" }}>
              <iframe
                src={getDriveEmbedUrl(activeLesson.driveFileId)}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
            
            <div className="bg-navy-mid rounded-2xl p-6 border border-divider">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-gold text-xs font-bold tracking-wider uppercase">
                  {activeLesson.chapter}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${LEVEL_COLOR[activeLesson.level]}`}>
                  {activeLesson.level}
                </span>
                <span className="text-gray-400 text-xs font-mono ml-auto">
                  {activeLesson.duration}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">{activeLesson.title}</h2>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {activeLesson.description}
              </p>
            </div>
          </div>

          {/* Up Next Sidebar */}
          <div className="lg:w-80 flex flex-col gap-4">
            <h3 className="text-white font-semibold px-1">More Lessons</h3>
            <div className="flex flex-col gap-3">
              {VIDEO_LESSONS.filter(l => l.id !== activeLesson.id).map(lesson => (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  className="flex flex-col text-left bg-navy hover:bg-navy-mid border border-divider hover:border-gold/30 rounded-xl p-4 transition-all"
                >
                  <p className="text-gold text-[10px] font-bold mb-1">{lesson.chapter}</p>
                  <h4 className="text-white text-sm font-semibold mb-2 line-clamp-2">{lesson.title}</h4>
                  <p className="text-gray-400 text-xs line-clamp-2 mb-3">{lesson.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-gray-500 text-xs font-mono">{lesson.duration}</span>
                    <span className="text-gold text-xs font-semibold group-hover:underline">Play ▶</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="animate-fadeIn">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h2 className="text-white font-bold text-xl mb-1">Queen's Gambit Declined Series</h2>
          <p className="text-gray-400 text-sm">Master the Classical Mainline with these comprehensive video lessons.</p>
        </div>
        <div className="shrink-0 whitespace-nowrap">
          <Badge variant="gold">8 Lessons</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {VIDEO_LESSONS.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => setActiveLesson(lesson)}
            className="flex flex-col text-left bg-navy hover:bg-navy-mid border border-divider hover:border-gold shadow-lg hover:shadow-gold/10 rounded-2xl overflow-hidden transition-all group"
          >
            {/* Thumbnail Placeholder */}
            <div className="h-40 bg-gradient-to-br from-navy to-black relative flex items-center justify-center border-b border-divider group-hover:border-gold/30 w-full">
              <span className="text-4xl">🎬</span>
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 bg-gold text-navy rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                  <span className="text-xl ml-1">▶</span>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                {lesson.duration}
              </div>
            </div>
            
            <div className="p-5 flex flex-col flex-1 w-full">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gold text-[10px] font-bold tracking-wider uppercase">
                  {lesson.chapter}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${LEVEL_COLOR[lesson.level]}`}>
                  {lesson.level}
                </span>
              </div>
              <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 leading-snug group-hover:text-gold transition-colors">
                {lesson.title}
              </h3>
              <p className="text-gray-400 text-xs line-clamp-3 mb-4">
                {lesson.description}
              </p>
              <div className="mt-auto pt-4 border-t border-divider flex items-center justify-end">
                <span className="text-gold text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                  Watch Now →
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
