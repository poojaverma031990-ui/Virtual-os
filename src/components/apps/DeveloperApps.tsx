import React, { useState, useEffect, useRef } from 'react';
import { Play, Code, Eye, Save, Trash2, Copy, Check } from 'lucide-react';

export default function CodePadApp() {
  const [html, setHtml] = useState('<h1>Hello Vibe OS</h1>\n<p>Try editing this code!</p>\n<button onclick="alert(\'Success!\')">Click Me</button>');
  const [css, setCss] = useState('body { font-family: system-ui; background: #0f172a; color: white; padding: 2rem; }\nbutton { padding: 0.5rem 1rem; border-radius: 0.5rem; border: none; background: #8b5cf6; color: white; cursor: pointer; }');
  const [js, setJs] = useState('console.log("Welcome to CodePad!");');
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [previewDoc, setPreviewDoc] = useState('');
  const [copied, setCopied] = useState(false);

  // Persistence for Code Editor
  useEffect(() => {
    const savedHtml = localStorage.getItem('vibe_os_code_html');
    const savedCss = localStorage.getItem('vibe_os_code_css');
    const savedJs = localStorage.getItem('vibe_os_code_js');
    if (savedHtml) setHtml(savedHtml);
    if (savedCss) setCss(savedCss);
    if (savedJs) setJs(savedJs);
  }, []);

  useEffect(() => {
    localStorage.setItem('vibe_os_code_html', html);
    localStorage.setItem('vibe_os_code_css', css);
    localStorage.setItem('vibe_os_code_js', js);
  }, [html, css, js]);

  const updatePreview = () => {
    const combined = `
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>
            try {
              ${js}
            } catch (e) {
              console.error(e);
            }
          </script>
        </body>
      </html>
    `;
    setPreviewDoc(combined);
  };

  useEffect(() => {
    const timer = setTimeout(updatePreview, 500);
    return () => clearTimeout(timer);
  }, [html, css, js]);

  const handleCopy = () => {
    const full = `<!-- HTML -->\n${html}\n\n/* CSS */\n${css}\n\n// JS\n${js}`;
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightCode = (code: string, language: 'html' | 'css' | 'js') => {
    if (language === 'html') {
      return code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/(&lt;[a-z0-9]+|&lt;\/[a-z0-9]+)/gi, '<span class="text-blue-400">$1</span>')
        .replace(/(\s[a-z-]+)=/gi, '<span class="text-cyan-400">$1</span>=')
        .replace(/(".*?"|'.*?')/g, '<span class="text-orange-300">$1</span>')
        .replace(/(&lt;!--.*?--&gt;)/g, '<span class="text-slate-500">$1</span>');
    }
    if (language === 'css') {
      return code
        .replace(/([a-z-]+):/gi, '<span class="text-cyan-400">$1</span>:')
        .replace(/({|}|;)/g, '<span class="text-slate-400">$1</span>')
        .replace(/(\.[a-z0-9_-]+|#[a-z0-9_-]+|[a-z]+)/gi, '<span class="text-blue-400">$1</span>')
        .replace(/(\/\*.*?\*\/)/g, '<span class="text-slate-500">$1</span>');
    }
    if (language === 'js') {
      return code
        .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|from|class|extends|new|try|catch|finally|async|await)\b/g, '<span class="text-fuchsia-400">$1</span>')
        .replace(/\b(console|window|document|Math|JSON|Object|Array)\b/g, '<span class="text-blue-400">$1</span>')
        .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="text-orange-300">$1</span>')
        .replace(/(\/\/.*$)/gm, '<span class="text-slate-500">$1</span>')
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-slate-500">$1</span>');
    }
    return code;
  };

  return (
    <div className="h-full w-full bg-[#1e1e1e] flex flex-col text-[#d4d4d4] font-mono text-sm overflow-hidden">
      {/* Toolbar */}
      <div className="h-10 bg-[#252526] border-b border-[#333] flex items-center justify-between px-4 shrink-0">
        <div className="flex gap-4 h-full">
          {(['html', 'css', 'js'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-full px-4 flex items-center gap-2 border-b-2 transition-colors ${activeTab === tab ? 'border-blue-500 bg-[#1e1e1e] text-white' : 'border-transparent hover:bg-[#2a2d2e]'}`}
            >
              <Code className="w-3 h-3" />
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleCopy} className="p-1.5 hover:bg-white/5 rounded text-slate-400" title="Copy Code">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-500/80 bg-green-500/5 px-2 py-1 rounded">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            LIVE PREVIEW
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Editor Area */}
        <div className="flex-1 border-r border-[#333] flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 p-4 pointer-events-none whitespace-pre-wrap break-all"
            dangerouslySetInnerHTML={{ 
              __html: highlightCode(activeTab === 'html' ? html : activeTab === 'css' ? css : js, activeTab) 
            }}
          />
          <textarea
            value={activeTab === 'html' ? html : activeTab === 'css' ? css : js}
            onChange={(e) => {
              if (activeTab === 'html') setHtml(e.target.value);
              else if (activeTab === 'css') setCss(e.target.value);
              else setJs(e.target.value);
            }}
            spellCheck={false}
            className="flex-1 w-full bg-transparent p-4 outline-none resize-none text-transparent caret-white z-10 selection:bg-blue-500/30"
            placeholder={`Enter your ${activeTab.toUpperCase()} code here...`}
          />
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-white flex flex-col min-h-[300px]">
          <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2 shrink-0">
            <Eye className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Output</span>
          </div>
          <iframe
            srcDoc={previewDoc}
            title="preview"
            className="flex-1 w-full border-none bg-white"
            sandbox="allow-scripts allow-modals"
          />
        </div>
      </div>
    </div>
  );
}
