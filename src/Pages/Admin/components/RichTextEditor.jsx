import React, { useState, useEffect, useRef } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link, Quote, Type, Image as ImageIcon, Loader } from 'lucide-react';

/* ============================
   Rich Text Editor (re-built)
   ============================ */
const RichTextEditor = ({ value, onChange, disabled = false }) => {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const internalChangeRef = useRef(false);

  const [isActive, setIsActive] = useState({ bold: false, italic: false, underline: false, ul: false, ol: false, quote: false });
  const [fontPx, setFontPx] = useState(14);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
        let newStyle = style.trim();
        if (newStyle && !newStyle.endsWith(';')) newStyle += ';';
        if (!/color\s*:/i.test(newStyle)) newStyle += "color:#059669;";
        if (!/text-decoration\s*:/i.test(newStyle)) newStyle += "text-decoration:underline;";
        a.setAttribute("style", newStyle);
      }
    });
  };

  const sanitizeHTML = (dirty) => {
    const ALLOWED_TAGS = new Set(["b", "strong", "i", "em", "u", "a", "ul", "ol", "li", "blockquote", "span", "br", "p", "div", "img"]);
    const ALLOWED_ATTRS = {
      a: new Set(["href", "rel", "target", "style"]),
      span: new Set(["style"]),
      p: new Set(["style"]),
      div: new Set(["style"]),
      blockquote: new Set(["style"]),
      li: new Set(["style"]),
      img: new Set(["src", "alt", "style", "class", "width", "height"])
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

      // Style allowlist: text and image properties
      const style = node.getAttribute?.("style") || "";
      if (style) {
        const safe = style
          .split(";")
          .map(s => s.trim())
          .filter(s => {
            if (/^font-size\s*:\s*\d+(\.\d+)?px$/i.test(s)) return true;
            if (/^text-decoration\s*:\s*\w+/i.test(s)) return true;
            if (/^color\s*:/i.test(s)) return true;
            if (/^(max-)?width\s*:/i.test(s)) return true;
            if (/^height\s*:/i.test(s)) return true;
            if (/^border(-radius)?\s*:/i.test(s)) return true;
            if (/^margin\s*:/i.test(s)) return true;
            if (/^display\s*:/i.test(s)) return true;
            return false;
          })
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
      const root = editorRef.current;
      const node = getSelectionRootNode();
      const isQuote = node ? !!closest(node, "blockquote", root) : false;

      setIsActive({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        ul: document.queryCommandState("insertUnorderedList"),
        ol: document.queryCommandState("insertOrderedList"),
        quote: isQuote
      });
    } catch (err) {
      console.warn("Failed to update toolbar state:", err);
    }

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
      try { document.execCommand("styleWithCSS", false, true); } catch (err) {
        console.warn("styleWithCSS not supported:", err);
      }

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

  // -------- Image Upload (Firebase Storage) --------
  const handleImageUpload = async (e) => {
    if (disabled || isUploadingImage) return;
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image file size must be less than 5MB.");
      e.target.value = '';
      return;
    }

    // Reset input
    e.target.value = '';

    restoreSelection();
    focusEditor();
    
    // Save the exact range prior to the async delay
    const currentRange = savedRangeRef.current;
    setIsUploadingImage(true);

    try {
      const { storage } = await import('../../../firebaseConfig');
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      
      const storageRef = ref(storage, `articleContentImages/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      // Restore exactly where the cursor was before the upload started
      const s = sel();
      if (s && currentRange) {
         s.removeAllRanges();
         s.addRange(currentRange);
      } else {
         restoreSelection();
      }
      focusEditor();

      document.execCommand("insertImage", false, url);
      
      // Select the image and style it to be responsive
      const root = editorRef.current;
      const imgs = root.querySelectorAll(`img[src="${CSS.escape(url)}"]`);
      imgs.forEach(img => {
        img.setAttribute("style", "max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;");
      });
      
      emitChange();
      saveSelection();
    } catch (err) {
      console.error("Image upload failed", err);
      alert("Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
    }
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
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${active ? "bg-green-100 text-green-700" : "text-gray-600"
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

        <ToolbarButton onClick={() => exec("insertUnorderedList")} active={isActive.ul} title="Bullet List">
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("insertOrderedList")} active={isActive.ol} title="Numbered List">
          <ListOrdered size={16} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <ToolbarButton onClick={toggleBlockquote} active={isActive.quote} title="Toggle Quote">
          <Quote size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={insertLink} title="Insert Link">
          <Link size={16} />
        </ToolbarButton>
        
        <label className={`p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center ${(disabled || isUploadingImage) ? "opacity-50 cursor-not-allowed text-gray-400" : "text-gray-600"}`} title="Insert Image">
          {isUploadingImage ? <Loader size={16} className="animate-spin" /> : <ImageIcon size={16} />}
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={disabled || isUploadingImage} />
        </label>

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
        className={`p-3 min-h-[200px] focus:outline-none relative ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white text-gray-800"
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
         /* 🔥 Make all bold text green */
  b, strong {
    color: #059669 !important;
  }
      `}
      </style>
    </div>
  );
};

export default RichTextEditor;
