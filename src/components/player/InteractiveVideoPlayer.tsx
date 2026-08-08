import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Play, Pause, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Quiz, VideoMarker } from '../../types/quiz';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

interface InteractiveVideoPlayerProps {
  quiz: Quiz;
}

export const InteractiveVideoPlayer: React.FC<InteractiveVideoPlayerProps> = ({ quiz }) => {
  useDocumentTitle(`Video Lesson: ${quiz.settings.title}`);
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<VideoMarker | null>(null);

  const videoMarkers: VideoMarker[] = quiz.videoMarkers || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 max-w-4xl mx-auto w-full">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Video Lesson</span>
        </button>
        <span className="text-xs font-bold text-rose-400 font-mono">Interactive Video</span>
      </div>

      {/* Main Video Box */}
      <div className="max-w-4xl mx-auto w-full my-auto space-y-4">
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 aspect-video flex items-center justify-center shadow-2xl">
          <div className="text-center space-y-3 p-6">
            <Video className="w-16 h-16 text-rose-500 mx-auto" />
            <h2 className="text-lg font-bold text-white">{quiz.settings.title}</h2>
            <p className="text-xs text-slate-400">Timestamp checkpoints active</p>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all shadow-lg cursor-pointer inline-flex items-center space-x-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? 'Pause Lesson' : 'Start Video Lesson'}</span>
            </button>
          </div>

          {/* Interactive Checkpoint Modal Overlay */}
          {activeQuestion && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md p-8 flex flex-col justify-center space-y-4 z-20">
              <span className="text-xs font-bold text-rose-400 uppercase">Video Checkpoint Question</span>
              <h3 className="text-base font-extrabold text-white">{activeQuestion.question.title}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeQuestion.question.options.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setActiveQuestion(null)}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500 text-xs font-bold text-left cursor-pointer transition-all"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
