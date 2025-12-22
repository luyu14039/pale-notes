import { useGameStore } from '@/stores/game';
import { Users, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface RelationshipPanelProps {
  className?: string;
}

export function RelationshipPanel({ className = '' }: RelationshipPanelProps) {
  const { characters } = useGameStore();
  const [expandedCharId, setExpandedCharId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedCharId(expandedCharId === id ? null : id);
  };

  return (
    <div className={`h-full p-4 space-y-6 overflow-y-auto bg-surface/50 border-l border-text-muted/30 ${className}`}>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif text-text-secondary uppercase tracking-wider">人物关系 (Relationships)</h3>
        </div>
        
        {characters.length === 0 ? (
          <div className="text-xs text-text-muted italic text-center py-8">
            在这座城市里，你是孤独的。
          </div>
        ) : (
          <div className="space-y-2">
            {characters.map((char) => {
              const isExpanded = expandedCharId === char.id;
              return (
                <div 
                  key={char.id} 
                  onClick={() => toggleExpand(char.id)}
                  className={`p-3 bg-background/50 rounded border transition-all duration-300 cursor-pointer group
                    ${isExpanded ? 'border-accent-grail/50 bg-background/80' : 'border-text-muted/20 hover:border-accent-grail/50'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-surface rounded text-text-secondary group-hover:text-accent-grail transition-colors">
                      <Users size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium text-text-primary">{char.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-1.5 py-0.5 bg-surface rounded text-accent-grail border border-accent-grail/20">
                                {char.relationship}
                            </span>
                            {isExpanded ? <ChevronUp size={12} className="text-text-muted" /> : <ChevronDown size={12} className="text-text-muted" />}
                          </div>
                      </div>
                      
                      <p className={`text-xs text-text-secondary mt-1 transition-all ${isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}>
                        {char.description}
                      </p>
                      
                      <div className="flex gap-2 mt-2 text-[10px] text-text-muted flex-wrap">
                          {char.location && (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-surface rounded border border-text-muted/20">
                                  <MapPin size={10} /> {char.location}
                              </span>
                          )}
                          <span className="px-1.5 py-0.5 bg-surface rounded border border-text-muted/20">
                              {char.status}
                          </span>
                          {isExpanded && char.stats && Object.entries(char.stats).map(([key, val]) => (
                             <span key={key} className="px-1.5 py-0.5 bg-surface rounded border border-text-muted/20 uppercase">
                                {key}: {val}
                             </span>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
