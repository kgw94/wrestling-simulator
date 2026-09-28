import React, { useState } from 'react';
import { Copy, Check, Terminal, Table as TableIcon } from 'lucide-react';

interface MarkdownTableViewProps {
  title: string;
  markdown: string;
  children?: React.ReactNode;
  defaultToMarkdown?: boolean;
}

export const MarkdownTableView: React.FC<MarkdownTableViewProps> = ({
  title,
  markdown,
  children,
  defaultToMarkdown = false,
}) => {
  const [viewMode, setViewMode] = useState<'interactive' | 'markdown'>(
    defaultToMarkdown ? 'markdown' : 'interactive'
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-md my-4">
      <div className="bg-zinc-950 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-zinc-200 tracking-wide font-mono">
            {title}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          {children && (
            <div className="flex rounded bg-zinc-900 border border-zinc-700/70 p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setViewMode('interactive')}
                className={`px-2.5 py-1 rounded transition flex items-center gap-1.5 ${
                  viewMode === 'interactive'
                    ? 'bg-amber-500 text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Interactive Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('markdown')}
                className={`px-2.5 py-1 rounded transition flex items-center gap-1.5 ${
                  viewMode === 'markdown'
                    ? 'bg-amber-500 text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Clean Markdown</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1 border border-zinc-700 transition"
            title="Copy Raw Markdown Table"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy MD</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-4">
        {viewMode === 'markdown' || !children ? (
          <div className="relative">
            <pre className="font-mono text-xs text-zinc-300 bg-zinc-950 p-4 rounded border border-zinc-800/80 overflow-x-auto whitespace-pre leading-relaxed">
              {markdown}
            </pre>
          </div>
        ) : (
          <div>{children}</div>
        )}
      </div>
    </div>
  );
};
