import React, { useState } from 'react';
import { PYTHON_FILES } from '../data/samples';
import { Copy, Check, FileCode, Terminal, BookOpen, Layers } from 'lucide-react';

export const CodeViewer: React.FC = () => {
  const [selectedFileName, setSelectedFileName] = useState<string>('app.py');
  const [copied, setCopied] = useState<boolean>(false);

  const selectedFile = PYTHON_FILES.find(f => f.name === selectedFileName) || PYTHON_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.py')) return <FileCode className="w-4 h-4 text-emerald-500" />;
    if (fileName.endsWith('.txt')) return <Terminal className="w-4 h-4 text-amber-500" />;
    return <BookOpen className="w-4 h-4 text-sky-500" />;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl text-slate-200">
      {/* File Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between bg-slate-950/80 px-4 py-2.5 border-b border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {PYTHON_FILES.map((file) => (
            <button
              key={file.name}
              onClick={() => setSelectedFileName(file.name)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-mono font-medium transition-all ${
                selectedFileName === file.name
                  ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {getFileIcon(file.name)}
              <span>{file.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-all shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Description Banner */}
      <div className="bg-slate-950/40 px-5 py-2.5 text-xs text-slate-400 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>{selectedFile.description}</span>
        </div>
        <span className="font-mono text-slate-500 uppercase">{selectedFile.language}</span>
      </div>

      {/* Code Display Area */}
      <div className="p-4 overflow-x-auto max-h-[600px] font-mono text-xs leading-relaxed text-slate-300">
        <pre className="whitespace-pre">
          <code>{selectedFile.content}</code>
        </pre>
      </div>
    </div>
  );
};
