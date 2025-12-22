import { useState } from 'react';
import { useGameStore } from '@/stores/game';
import { useUIStore } from '@/stores/ui';
import { MapPin, Clock, User, BookOpen, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

export function StatusBar() {
  const { location, time, identity, story } = useGameStore();
  const { statusMessage } = useUIStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (t: typeof time) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${t.year}-${pad(t.month)}-${pad(t.day)} ${pad(t.hour)}:${pad(t.minute)}`;
  };

  return (
    <div className="w-full bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400 select-none relative z-30">
      {/* Mobile Collapsed View */}
      <div className="md:hidden flex items-center justify-between p-2 px-4 h-10">
        {statusMessage ? (
           <div className="flex items-center gap-2 text-amber-500 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>{statusMessage}</span>
          </div>
        ) : (
           <div className="flex items-center gap-2 text-zinc-500">
             <span className="w-2 h-2 rounded-full bg-zinc-700"></span>
             <span>就绪</span>
           </div>
        )}
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-zinc-800 rounded text-zinc-500"
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded / Desktop View */}
      <div className={`${isExpanded ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-2 gap-4 md:gap-0 bg-zinc-900 md:bg-transparent absolute md:relative w-full border-b md:border-none border-zinc-800 shadow-xl md:shadow-none`}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 w-full md:w-auto">
          <div className="flex items-center gap-2" title="当前位置">
            <MapPin className="w-3 h-3 text-zinc-500" />
            <span className="text-zinc-300">{location}</span>
          </div>
          
          <div className="flex items-center gap-2" title="日期与时间">
            <Clock className="w-3 h-3 text-zinc-500" />
            <span>{formatTime(time)}</span>
          </div>
        </div>

        {statusMessage && (
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-2 text-amber-500 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 w-full md:w-auto">
          <div className="flex items-center gap-2" title="身份">
            <User className="w-3 h-3 text-zinc-500" />
            <span className="text-zinc-300">{identity}</span>
          </div>

          <div className="flex items-center gap-2" title="当前章节">
            <BookOpen className="w-3 h-3 text-zinc-500" />
            <span>章节 {story.currentChapter}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
