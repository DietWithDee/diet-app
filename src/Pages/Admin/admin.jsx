import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Plus, Edit2, Trash2, Save, X, AlertCircle, CheckCircle, Loader, Bold, Italic, Underline, List, ListOrdered, Link, Quote, Type } from 'lucide-react';
import { createArticle, getArticles , deleteArticle} from '../../firebaseUtils';
import { sendNewArticleNewsletter } from '../../EmailTemplateSystem/emailServices';
import NoIndex from "../../Components/NoIndex";

// Mock environment variables
const ADMIN_EMAIL = 'admin@dietwithdee.org';
const ADMIN_PASSWORD = 'admin123';

/* ============================
   Rich Text Editor (re-built)
   ============================ */
const RichTextEditor = ({ value, onChange, disabled = false }) => {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const internalChangeRef = useRef(false);

  const [isActive, setIsActive] = useState({ bold: false, italic: false, underline: false });
  const [fontPx, setFontPx] = useState(14);

  // -------- Utilities --------
  const clamp = (v, min = 12, max = 36) => Math.max(min, Math.min(max, v));
  const sel = () => (typeof window !== "undefined" ? window.getSelection() : null);

  const withinEditor = (node) => {
    const root = editorRef.current;
    if (!root || !node) return false;
    return root === node || root.contains(node);
  };

  const saveSelection = () => {
    if (disabled) return;
    const s = sel();
    if (!s || s.rangeCount === 0) return;
    const r = s.getRangeAt(0);
    if (withinEditor(r.commonAncestorContainer)) {
      savedRangeRef.current = r.cloneRange();
    }
  };

  const restoreSelection = () => {
    if (disabled) return;
    const r = savedRangeRef.current;
    const s = sel();
    if (!r || !s) return;
    s.removeAllRanges();
    s.addRange(r);
  };

  const focusEditor = () => {
    if (!disabled && editorRef.current) editorRef.current.focus();
  };

  const getSelectionRootNode = () => {
    const s = sel();
    if (!s || s.rangeCount === 0) return null;
    const r = s.getRangeAt(0);
    const n = r.commonAncestorContainer;
    return n.nodeType === 1 ? n : n.parentNode;
  };

  const closest = (el, selector, stopEl) => {
    let node = el;
    while (node && node !== stopEl) {
      if (node.matches?.(selector)) return node;
      node = node.parentNode;
    }
    return null;
  };

  const ensureAbsoluteUrl = (raw) => {
    try {
      const u = new URL(raw);
      return u.href;
    } catch {
      if (!raw) return "";
      if (/^(https?:)?\/\//i.test(raw)) {
        return raw.startsWith("//") ? `https:${raw}` : raw;
      }
      return `https://${raw}`;
    }
  };

  const normalizeLinks = (container) => {
    if (!container) return;
    container.querySelectorAll("a").forEach((a) => {
      a.target = "_blank";
      a.rel = "noopener noreferrer nofollow";
      const style = a.getAttribute("style") || "";
      if (!/color\s*:/i.test(style) || !/text-decoration\s*:/i.test(style)) {
        a.setAttribute(
          "style",
          `${style}${/color\s*:/i.test(style) ? "" : "color:#059669;"}${/text-decoration\s*:/i.test(style) ? "" : "text-decoration:underline;"}`
        );
      }
    });
  };

  const sanitizeHTML = (dirty) => {
    // allow a small safe subset
    const ALLOWED_TAGS = new Set(["b","strong","i","em","u","a","ul","ol","li","blockquote","span","br","p","div"]);
    const ALLOWED_ATTRS = {
      a: new Set(["href","rel","target","style"]),
      span: new Set(["style"]),
      p: new Set(["style"]),
      div: new Set(["style"]),
      blockquote: new Set(["style"]),
      li: new Set(["style"])
    };
    const parser = document.createElement("div");
    parser.innerHTML = dirty;

    const walk = (node) => {
      if (node.nodeType === 3) return; // text
      if (node.nodeType !== 1) { node.remove(); return; }

      const tag = node.tagName.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) {
        const parent = node.parentNode;
        while (node.firstChild) parent.insertBefore(node.firstChild, node);
        parent.removeChild(node);
        return;
      }

      // scrub attributes
      [...node.attributes].forEach(attr => {
        const name = attr.name.toLowerCase();
        const allowed = ALLOWED_ATTRS[tag];
        if (!allowed?.has(name)) node.removeAttribute(attr.name);
      });

      // Style allowlist: only font-size, text-decoration, color for spans/paragraph-ish
      const style = node.getAttribute?.("style") || "";
      if (style) {
        const safe = style
          .split(";")
          .map(s => s.trim())
          .filter(s => /^font-size\s*:\s*\d+(\.\d+)?px$/i.test(s) || /^text-decoration\s*:\s*\w+/i.test(s) || /^color\s*:\s*#[0-9a-f]{3,8}$/i.test(s))
          .join(";");
        if (safe) node.setAttribute("style", safe);
        else node.removeAttribute("style");
      }

      if (tag === "a") {
        const href = node.getAttribute("href") || "";
        node.setAttribute("href", ensureAbsoluteUrl(href));
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer nofollow");
      }

      [...node.childNodes].forEach(walk);
    };

    [...parser.childNodes].forEach(walk);
    return parser.innerHTML;
  };

  const setEditorHTML = (html) => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = html || "";
    normalizeLinks(editorRef.current);
  };

  const emitChange = () => {
    if (!onChange || !editorRef.current) return;
    internalChangeRef.current = true;
    const html = editorRef.current.innerHTML;
    onChange(html);
    setTimeout(() => { internalChangeRef.current = false; }, 0);
  };

  const updateToolbarState = () => {
    try {
      setIsActive({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
      });
    } catch {}
    setFontPx(getCurrentFontSizePx());
  };

  const getCurrentFontSizePx = () => {
    const root = editorRef.current;
    if (!root) return 14;
    const node = getSelectionRootNode() || root;
    const el = closest(node, 'span[style], p, div, li, blockquote', root) || root;
    const cs = window.getComputedStyle(el);
    const px = parseFloat(cs.fontSize) || 14;
    return Math.round(px);
  };

  const exec = (command, val = null) => {
    if (disabled) return;
    restoreSelection();
    focusEditor();
    document.execCommand(command, false, val);
    normalizeLinks(editorRef.current);
    emitChange();
    updateToolbarState();
    saveSelection();
  };

  // -------- Font sizing (precise, CSS-based) --------
  const setSelectionFontSize = (px) => {
    if (disabled) return;
    restoreSelection();
    focusEditor();
    const s = sel();
    if (!s || s.rangeCount === 0) return;
    const r = s.getRangeAt(0);

    if (r.collapsed) {
      const span = document.createElement("span");
      span.style.fontSize = `${px}px`;
      span.appendChild(document.createTextNode("\u200B"));
      r.insertNode(span);

      const newR = document.createRange();
      newR.setStart(span.firstChild, 1);
      newR.collapse(true);
      s.removeAllRanges();
      s.addRange(newR);
      savedRangeRef.current = newR.cloneRange();
    } else {
      try { document.execCommand("styleWithCSS", false, true); } catch {}
      document.execCommand("fontSize", false, 7);
      editorRef.current.querySelectorAll('font[size="7"]').forEach((f) => {
        const span = document.createElement("span");
        span.style.fontSize = `${px}px`;
        while (f.firstChild) span.appendChild(f.firstChild);
        f.parentNode.replaceChild(span, f);
      });
    }

    emitChange();
    setFontPx(px);
    saveSelection();
  };

  const increaseFont = () => setSelectionFontSize(clamp(getCurrentFontSizePx() + 2));
  const decreaseFont = () => setSelectionFontSize(clamp(getCurrentFontSizePx() - 2));

  // -------- Quote toggle (idempotent) --------
  const toggleBlockquote = () => {
    if (disabled) return;
    restoreSelection();
    focusEditor();

    const root = editorRef.current;
    if (!root) return;
    const node = getSelectionRootNode();
    const existing = node ? closest(node, "blockquote", root) : null;

    if (existing) {
      const parent = existing.parentNode;
      while (existing.firstChild) parent.insertBefore(existing.firstChild, existing);
      parent.removeChild(existing);
    } else {
      document.execCommand("formatBlock", false, "blockquote");
      const selNode = getSelectionRootNode();
      const applied = selNode ? closest(selNode, "blockquote", root) : null;
      if (applied) {
        applied.setAttribute(
          "style",
          "border-left:4px solid #10b981;padding-left:16px;margin:16px 0;font-style:italic;color:#059669;"
        );
      }
    }

    emitChange();
    updateToolbarState();
    saveSelection();
  };

  // -------- Link insert --------
  const insertLink = () => {
    if (disabled) return;
    const raw = prompt("Enter URL:");
    if (!raw) return;
    const url = ensureAbsoluteUrl(raw);

    restoreSelection();
    focusEditor();
    document.execCommand("createLink", false, url);

    const root = editorRef.current;
    const n = getSelectionRootNode();
    const a = (n && closest(n, "a", root)) || root?.querySelector(`a[href="${CSS.escape(url)}"]`);
    if (a) {
      a.target = "_blank";
      a.rel = "noopener noreferrer nofollow";
      const style = a.getAttribute("style") || "";
      a.setAttribute("style", `${style}color:#059669;text-decoration:underline;`);
    }

    emitChange();
    saveSelection();
  };

  // -------- Paste handling: strip unsafe markup/styles --------
  const handlePaste = (e) => {
    if (disabled) return;
    e.preventDefault();
    const clipboard = e.clipboardData;
    const html = clipboard.getData("text/html");
    const text = clipboard.getData("text/plain");

    let safe = "";
    if (html) {
      safe = sanitizeHTML(html);
    } else if (text) {
      safe = text
        .split(/\r?\n/)
        .map((line) => (line.trim() ? `<p>${line.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>` : "<br/>"))
        .join("");
    }

    restoreSelection();
    focusEditor();
    document.execCommand("insertHTML", false, safe);
    normalizeLinks(editorRef.current);
    emitChange();
    updateToolbarState();
    saveSelection();
  };

  // -------- Keyboard shortcuts --------
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === "Enter") {
      const node = getSelectionRootNode();
      const inList = closest(node, "ul,ol", editorRef.current);
      if (!inList && e.shiftKey) {
        e.preventDefault();
        exec("insertLineBreak");
        return;
      }
    }

    if (e.ctrlKey || e.metaKey) {
      const k = e.key.toLowerCase();
      if (k === "b" || k === "i" || k === "u") e.preventDefault();
      if (k === "b") exec("bold");
      if (k === "i") exec("italic");
      if (k === "u") exec("underline");
    }
  };

  const handleEditorEvents = () => {
    updateToolbarState();
    saveSelection();
  };

  // -------- Sync external value in (without breaking caret) --------
  useEffect(() => {
    if (internalChangeRef.current) return;
    if (!editorRef.current) return;

    const current = editorRef.current.innerHTML;
    if ((value || "") !== current) {
      setEditorHTML(value || "");
      setFontPx(getCurrentFontSizePx());
    }
  }, [value]);

  // -------- Placeholder styling (simulated) --------
  useEffect(() => {
    const root = editorRef.current;
    if (!root) return;
    const setFlag = () => {
      root.dataset.empty = root.textContent.trim().length === 0 ? "true" : "false";
    };
    const observer = new MutationObserver(setFlag);
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    setFlag();
    return () => observer.disconnect();
  }, []);

  const ToolbarButton = ({ onClick, active, children, title, className = "" }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        active ? "bg-green-100 text-green-700" : "text-gray-600"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      aria-pressed={!!active}
      aria-label={title}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 bg-gray-50 flex flex-wrap items-center gap-1 text-gray-800">
        <ToolbarButton onClick={() => exec("bold")} active={isActive.bold} title="Bold (Ctrl+B)">
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("italic")} active={isActive.italic} title="Italic (Ctrl+I)">
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("underline")} active={isActive.underline} title="Underline (Ctrl+U)">
          <Underline size={16} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <ToolbarButton onClick={() => exec("insertUnorderedList")} title="Bullet List">
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("insertOrderedList")} title="Numbered List">
          <ListOrdered size={16} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <ToolbarButton onClick={toggleBlockquote} title="Toggle Quote">
          <Quote size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={insertLink} title="Insert Link">
          <Link size={16} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Font size controls */}
        <ToolbarButton onClick={decreaseFont} title="Decrease font size" className="px-3">
          <div className="flex items-center gap-1">
            <Type size={14} />
            <span className="text-xs font-medium">A-</span>
          </div>
        </ToolbarButton>

        <div
          title="Current font size at cursor"
          className="px-2 py-1 rounded-md border border-gray-300 bg-white text-gray-700 text-xs font-semibold select-none"
          aria-live="polite"
        >
          {fontPx}px
        </div>

        <ToolbarButton onClick={increaseFont} title="Increase font size" className="px-3">
          <div className="flex items-center gap-1">
            <Type size={16} />
            <span className="text-xs font-medium">A+</span>
          </div>
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        className={`p-3 min-h-[200px] focus:outline-none relative ${
          disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white text-gray-800"
        }`}
        style={{
          fontSize: "14px",
          lineHeight: "1.6",
          position: "relative",
        }}
        suppressContentEditableWarning
        onInput={() => {
          normalizeLinks(editorRef.current);
          emitChange();
          handleEditorEvents();
        }}
        onKeyUp={handleEditorEvents}
        onMouseUp={handleEditorEvents}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={() => {
          setFontPx(getCurrentFontSizePx());
          saveSelection();
        }}
        role="textbox"
        aria-multiline="true"
        data-empty="true"
      />

      {/* Inline placeholder (CSS) */}
      <style>{`
        [data-empty="true"]:before {
          content: "Write your article content here...";
          position: absolute;
          left: 12px;
          top: 12px;
          pointer-events: none;
          color: #9CA3AF;
        }
      `}</style>
    </div>
  );
};

// Notification Component
const Notification = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 ${
      type === 'success' 
        ? 'bg-green-50 border-green-500 text-green-800' 
        : 'bg-red-50 border-red-500 text-red-800'
    }`}>
      <div className="flex items-center gap-2">
        {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-60">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div 
      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
      style={{ width: `${progress}%` }}
    />
  </div>
);

// Login Component
const AdminLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (formData.email === ADMIN_EMAIL && formData.password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError('Invalid email or password');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-green-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-600">
              DietWithDee
            </h1>
            <p className="text-gray-600 mt-2">Admin Panel</p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                  placeholder="admin@dietwithdee.org"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12 text-gray-800"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="animate-spin" size={20} />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500 text-center">
            Demo credentials: admin@dietwithdee.org / admin123
          </div>
        </div>
      </div>
    </div>
  );
};

// Articles Management Component
const ArticlesManager = ({ articles, setArticles, showNotification, loadArticles }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: ''
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // Validate and preview image URL
  const handleImageUrlChange = (url) => {
    setFormData({...formData, imageUrl: url});
    
    if (url) {
      try {
        new URL(url);
        setImagePreview(url);
      } catch {
        setImagePreview('');
      }
    } else {
      setImagePreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const result = await createArticle(formData.title, formData.content, formData.imageUrl);
      
      clearInterval(interval);
      setUploadProgress(100);

      if (result.success) {
        showNotification('success', 'Article created successfully!');
        await loadArticles();

        try {
          const newsletterResult = await sendNewArticleNewsletter(
            formData.title, 
            formData.imageUrl, 
            result.id
          );
          
          if (newsletterResult.success) {
            showNotification('success', `Newsletter sent to ${newsletterResult.sent} subscribers!`);
          } else {
            showNotification('error', 'Article created but newsletter failed to send');
          }
        } catch (error) {
          console.error('Newsletter error:', error);
          showNotification('error', 'Article created but newsletter failed to send');
        }
        
        setFormData({ title: '', content: '', imageUrl: '' });
        setImagePreview('');
        setIsEditing(false);
        setEditingId(null);
      } else {
        showNotification('error', 'Failed to create article. Please try again.');
      }
    } catch (error) {
      console.error('Error creating article:', error);
      showNotification('error', 'Failed to create article. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }

  setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleEdit = (article) => {
    setFormData({
      title: article.title,
      content: article.content,
      imageUrl: article.coverImage || ''
    });
    setImagePreview(article.coverImage || '');
    setEditingId(article.id);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      setArticles(articles.filter(a => a.id !== id));
      deleteArticle(id);
      showNotification('success', 'Article deleted successfully!');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    if (timestamp.toDate) return timestamp.toDate().toLocaleDateString();
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-green-700">Articles Management</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-bold"
        >
          <Plus size={20} />
          New Article
        </button>
      </div>

      {isEditing && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {editingId ? 'Edit Article' : 'Create New Article'}
            </h3>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingId(null);
                setFormData({ title: '', content: '', imageUrl: '' });
                setImagePreview('');
                setUploadProgress(0);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                placeholder="Article title"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Content
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData({...formData, content})}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-2">
                Use the toolbar to format your text. Keyboard shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                placeholder="https://example.com/image.jpg"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a valid image URL (jpg, png, gif, webp)
              </p>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-32 object-cover rounded"
                      onError={() => setImagePreview('')}
                    />
                  </div>
                </div>
              )}
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Creating article...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <ProgressBar progress={uploadProgress} />
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {editingId ? 'Update' : 'Create'} Article
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingId(null);
                  setFormData({ title: '', content: '', imageUrl: '' });
                  setImagePreview('');
                }}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {articles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No articles yet. Create your first article!</p>
          </div>
        ) : (
          articles.map(article => (
            <div key={article.id} className="bg-white rounded-xl shadow-md p-6 border border-green-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  {article.coverImage && (
                    <div className="mb-3">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-20 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{article.title}</h3>
                  <div 
                    className="text-gray-600 text-sm mb-2 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: article.content.length > 150 
                        ? article.content.substring(0, 150) + '...'
                        : article.content
                    }}
                  />
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Created: {formatDate(article.createdAt)}</span>
                    {article.coverImage && (
                      <span className="text-blue-600">🖼️ Has Image</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(article)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard = ({ onLogout }) => {
  const [articles, setArticles] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const result = await getArticles();
      if (result.success) {
        setArticles(result.data || []);
      } else {
        showNotification('error', 'Failed to load articles');
        console.error('Error loading articles:', result.error);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
      showNotification('error', 'Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleLogout = () => {
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />
      )}

      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-600">
              DietWithDee Admin
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            <div className="flex-1 py-4 px-6 text-center font-medium text-green-600 border-b-2 border-green-600 bg-green-50">
              Articles
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin text-green-600" size={32} />
                <span className="ml-2 text-gray-600">Loading articles...</span>
              </div>
            ) : (
              <ArticlesManager
                articles={articles}
                setArticles={setArticles}
                showNotification={showNotification}
                loadArticles={loadArticles}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


// Main App Component
const AdminApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };


  return (
    <NoIndex>
    <div>
      {isAuthenticated ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}
    </div>
    </NoIndex>
  );
};

export default AdminApp;
