import React from 'react';
import { NewsItem } from '../types';
import { MarkdownTableView } from './MarkdownTableView';
import { 
  Newspaper, 
  ChevronLeft, 
  Flame, 
  ShieldAlert, 
  TrendingUp, 
  Building2, 
  AlertCircle 
} from 'lucide-react';

interface NewsViewProps {
  newsArchive: NewsItem[];
  onBackToMenu: () => void;
}

export const NewsView: React.FC<NewsViewProps> = ({ newsArchive, onBackToMenu }) => {
  // Build Markdown table of the News archive
  let newsMarkdown = `| Week | Category | Importance | Headline & Report |
|---|---|---|---|
`;
  if (newsArchive.length === 0) {
    newsMarkdown += `| - | General | Low | No major industry reports recorded yet. Advance a week to generate world events. |\n`;
  } else {
    newsArchive.forEach(n => {
      newsMarkdown += `| Wk ${n.week} | ${n.category} | ${n.importance} | **${n.headline}**: ${n.details} |\n`;
    });
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <button
            type="button"
            onClick={onBackToMenu}
            className="text-xs font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1 mb-1 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Booker Hub
          </button>
          <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
            <span>Wrestling Observer & Industry News Wire</span>
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
              {newsArchive.length} Reports
            </span>
          </h2>
        </div>
      </div>

      {/* Markdown Table */}
      <MarkdownTableView
        title="INDUSTRY INTELLIGENCE WIRE & COMPETITOR DISPATCHES"
        markdown={newsMarkdown}
        defaultToMarkdown={false}
      >
        <div className="text-xs text-zinc-400 font-mono">
          Track competitor movements, medical clearances, locker room unrest, and title changes across the wrestling landscape.
        </div>
      </MarkdownTableView>

      {/* News Feed Cards */}
      <div className="space-y-3">
        {newsArchive.map(item => {
          const isHigh = item.importance === 'High';
          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition ${
                isHigh
                  ? 'bg-zinc-900 border-amber-500/50 shadow-md shadow-amber-500/5'
                  : 'bg-zinc-900/70 border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    Week {item.week}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    item.category === 'Injury'
                      ? 'bg-rose-500/10 text-rose-400'
                      : item.category === 'Rival'
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : item.category === 'Wrestler'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {item.category}
                  </span>
                </div>

                {isHigh && (
                  <span className="text-[10px] text-amber-400 uppercase font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" /> Top Story
                  </span>
                )}
              </div>

              <h3 className="font-bold text-white font-mono text-sm mb-1">{item.headline}</h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">{item.details}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
