import React, { useState, useRef } from 'react';
import { GameState } from '../types';
import { 
  exportSaveGameToFile, 
  exportSaveGameToString, 
  validateAndParseSaveGame, 
  quickSaveToLocalStorage, 
  quickLoadFromLocalStorage 
} from '../utils/saveGame';
import { formatNumber } from '../utils/format';
import { 
  Download, 
  Upload, 
  Copy, 
  Check, 
  HardDrive, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  RotateCcw,
  Sparkles,
  Calendar,
  Users,
  DollarSign
} from 'lucide-react';

interface SaveGameModalProps {
  gameState: GameState;
  onRestoreSave: (newState: GameState) => void;
  onClose: () => void;
}

export const SaveGameModal: React.FC<SaveGameModalProps> = ({
  gameState,
  onRestoreSave,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);
  const [quickSaveStatus, setQuickSaveStatus] = useState<string | null>(null);
  
  // Import state
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<GameState | null>(null);
  const [quickLoadInfo, setQuickLoadInfo] = useState<{ available: boolean; time?: string }>({ available: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check quick load availability on mount
  React.useEffect(() => {
    const ql = quickLoadFromLocalStorage();
    if (ql.success && ql.gameState) {
      setQuickLoadInfo({ available: true, time: ql.savedAt });
    }
  }, []);

  const handleExportDownload = () => {
    const filename = exportSaveGameToFile(gameState);
    setQuickSaveStatus(`Successfully downloaded "${filename}"!`);
    setTimeout(() => setQuickSaveStatus(null), 4000);
  };

  const handleCopyClipboard = () => {
    const str = exportSaveGameToString(gameState);
    navigator.clipboard.writeText(str).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleQuickSave = () => {
    const ok = quickSaveToLocalStorage(gameState);
    if (ok) {
      setQuickSaveStatus('Career quick-saved to browser storage slot!');
      setQuickLoadInfo({ available: true, time: new Date().toISOString() });
      setTimeout(() => setQuickSaveStatus(null), 3000);
    } else {
      setQuickSaveStatus('Failed to write quick save to browser storage.');
    }
  };

  const handleQuickLoad = () => {
    const ql = quickLoadFromLocalStorage();
    if (ql.success && ql.gameState) {
      if (window.confirm(`Load quick-save from ${new Date(ql.savedAt || '').toLocaleString()}? Current unsaved week progress will be replaced.`)) {
        onRestoreSave(ql.gameState);
        onClose();
      }
    } else {
      setImportError(ql.error || 'No valid quick-save found.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
      const res = validateAndParseSaveGame(content);
      if (res.success && res.gameState) {
        setImportError(null);
        setImportPreview(res.gameState);
      } else {
        setImportError(res.error || 'Failed to read valid save data.');
        setImportPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleValidateInput = () => {
    if (!importJsonText.trim()) {
      setImportError('Please paste save game JSON text or upload a file.');
      return;
    }
    const res = validateAndParseSaveGame(importJsonText);
    if (res.success && res.gameState) {
      setImportError(null);
      setImportPreview(res.gameState);
    } else {
      setImportError(res.error || 'Invalid save game format.');
      setImportPreview(null);
    }
  };

  const handleConfirmImport = () => {
    if (!importPreview) return;
    if (window.confirm(`Restore save file for "${importPreview.promotion.name}" (Week ${importPreview.currentWeek}, ${importPreview.currentYear})? This will replace your current session.`)) {
      onRestoreSave(importPreview);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono mb-1">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Save & Load Center</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-mono">
              Save Game Import & Export
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Backup your entire promotion, GM progress, roster, storylines, and history to JSON, or restore a previous career save.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold transition ${
              activeTab === 'export'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export Save Game</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold transition ${
              activeTab === 'import'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Import Save Game</span>
          </button>
        </div>

        {/* Tab 1: Export Save */}
        {activeTab === 'export' && (
          <div className="space-y-5">
            {/* Save metadata summary card */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>Active Promotion Dossier</span>
                <span className="text-emerald-400 font-bold">READY TO BACKUP</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300 font-mono text-lg">
                  {gameState.promotion.shortName}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{gameState.promotion.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-400 mt-0.5">
                    <span className="flex items-center gap-1 text-zinc-300">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      Week {gameState.currentWeek}, {gameState.currentYear}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-zinc-300">
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                      {gameState.promotion.roster.length} Superstars
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <DollarSign className="w-3.5 h-3.5" />
                      ${formatNumber(gameState.promotion.budget)}
                    </span>
                  </div>
                </div>
              </div>

              {gameState.promotion.currentGM && (
                <div className="text-xs font-mono bg-zinc-900/80 p-2.5 rounded border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-400">Active General Manager:</span>
                  <span className="text-amber-300 font-bold">
                    {gameState.promotion.currentGM.avatar} {gameState.promotion.currentGM.name} ({gameState.promotion.currentGM.title})
                  </span>
                </div>
              )}
            </div>

            {quickSaveStatus && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{quickSaveStatus}</span>
              </div>
            )}

            {/* Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportDownload}
                className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition shadow-md shadow-amber-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download .JSON Save File</span>
              </button>

              <button
                type="button"
                onClick={handleCopyClipboard}
                className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono font-bold text-xs border border-zinc-700 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied JSON to Clipboard!' : 'Copy Save JSON Text'}</span>
              </button>
            </div>

            {/* Quick-Save Slot */}
            <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-white font-mono">Browser QuickSave Slot</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Save a quick snapshot directly in this browser for instant loading later without downloading files.
                </p>
                {quickLoadInfo.available && quickLoadInfo.time && (
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">
                    Last QuickSave: {new Date(quickLoadInfo.time).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleQuickSave}
                className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold border border-zinc-700 flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>QuickSave Slot</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Import Save */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            {/* Quick Load Slot Option */}
            {quickLoadInfo.available && (
              <div className="bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-500/30 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-emerald-300 font-mono flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    QuickSave Snapshot Found
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    From {quickLoadInfo.time ? new Date(quickLoadInfo.time).toLocaleString() : 'Recent session'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickLoad}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs transition"
                >
                  Load QuickSave
                </button>
              </div>
            )}

            {/* File Upload Zone */}
            <div>
              <label className="block text-xs font-bold font-mono text-zinc-300 mb-1.5">
                Upload Save Game File (.json)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-zinc-700 hover:border-amber-500/80 rounded-xl p-5 text-center bg-zinc-950/50 hover:bg-zinc-950 transition flex flex-col items-center justify-center gap-2"
              >
                <Upload className="w-6 h-6 text-zinc-400 group-hover:text-amber-400" />
                <span className="text-xs font-mono text-zinc-300">
                  Click to select <strong className="text-amber-400 font-bold">.json save file</strong> from your computer
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Compatible with all exported wrestling promotion saves
                </span>
              </button>
            </div>

            {/* Paste Raw JSON Text */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold font-mono text-zinc-300">
                  Or Paste Raw JSON Content
                </label>
                {importJsonText && (
                  <button
                    type="button"
                    onClick={() => {
                      setImportJsonText('');
                      setImportPreview(null);
                      setImportError(null);
                    }}
                    className="text-[10px] font-mono text-zinc-400 hover:text-white"
                  >
                    Clear Text
                  </button>
                )}
              </div>
              <textarea
                value={importJsonText}
                onChange={(e) => {
                  setImportJsonText(e.target.value);
                  setImportPreview(null);
                }}
                placeholder="Paste the contents of your exported wrestling save file here..."
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 font-mono text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleValidateInput}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs font-bold border border-zinc-700"
                >
                  Validate JSON
                </button>
              </div>
            </div>

            {/* Error Message */}
            {importError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {/* Preview of Validated Save */}
            {importPreview && (
              <div className="bg-zinc-950 p-4 rounded-xl border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Valid Save File Verified
                  </span>
                  <span className="text-zinc-500">Ready to restore</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center font-mono text-base border border-emerald-500/40">
                    {importPreview.promotion.shortName}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{importPreview.promotion.name}</h4>
                    <p className="text-xs text-zinc-400 font-mono">
                      Week {importPreview.currentWeek}, Year {importPreview.currentYear} • {importPreview.promotion.roster.length} Wrestlers • ${formatNumber(importPreview.promotion.budget)} Capital
                    </p>
                  </div>
                </div>

                {importPreview.promotion.currentGM && (
                  <p className="text-xs font-mono text-zinc-400 bg-zinc-900 p-2 rounded border border-zinc-800">
                    GM: <strong className="text-amber-400">{importPreview.promotion.currentGM.name}</strong> ({importPreview.promotion.currentGM.title})
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restore & Launch This Career Save</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
