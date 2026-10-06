import React, { useState } from 'react';
import { PYTHON_FILES } from '../data/samples';
import { CodeFile } from '../types';
import {
  Code2,
  FileCode,
  Copy,
  Check,
  Terminal,
  FolderTree,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export const CodeProjectView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(PYTHON_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-sky-500/10 rounded-lg text-sky-400 border border-sky-500/20">
                <Code2 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-100">
                College Project Source Code & Python Files (100% Full App)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ready-to-run code files for your college Machine Learning project evaluation: Streamlit, SQLite, OpenCV, and YOLOv8n.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-emerald-400">
            <Terminal className="w-3.5 h-3.5" />
            <span>streamlit run app.py</span>
          </div>
        </div>

        {/* Execution Commands */}
        <div className="mt-4 p-3.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-slate-300">
            <span className="text-slate-500">$</span> pip install -r requirements.txt && streamlit run app.py
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText('pip install -r requirements.txt && streamlit run app.py');
              alert('Copied run command to clipboard!');
            }}
            className="text-sky-400 hover:text-sky-300 text-[11px] underline flex items-center gap-1 cursor-pointer"
          >
            <Copy className="w-3 h-3" /> Copy command
          </button>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Directory Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800 text-xs font-semibold text-slate-300">
              <FolderTree className="w-4 h-4 text-sky-400" />
              <span>Project Structure</span>
            </div>

            <div className="space-y-1.5 mt-3">
              {PYTHON_FILES.map((file) => (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                    selectedFile.name === file.name
                      ? 'bg-sky-950/60 border-sky-500/50 text-sky-200 font-semibold'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <FileCode className={`w-4 h-4 mt-0.5 shrink-0 ${selectedFile.name === file.name ? 'text-sky-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="font-mono text-xs text-slate-200">{file.name}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{file.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Evaluation Review Notes Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Evaluation Checklist</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Pretrained YOLOv8n inference (Ultralytics)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>OpenCV bounding boxes & confidence text</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>SQLite persistence (`products`, `transactions`)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Automated 1-click vision stock reconciliation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Low stock threshold triggers & restocking</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Analytics dashboard & exportable reports</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Code Content Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/60">
            <div>
              <span className="font-mono text-xs font-bold text-slate-200">{selectedFile.name}</span>
              <p className="text-[11px] text-slate-400 mt-0.5">{selectedFile.description}</p>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-slate-950 overflow-x-auto max-h-[600px] font-mono text-xs leading-relaxed text-slate-300 select-text">
            <pre>{selectedFile.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
