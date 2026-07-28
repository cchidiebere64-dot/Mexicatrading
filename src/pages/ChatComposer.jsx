import { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, Mic, X, Play, Pause, Trash2 } from "lucide-react";
import { T, Spinner, inputStyle } from "./system.jsx";

const c = T.color;
const MAX_SECONDS = 120;

/* ═══════════════════════════════════════════════════════════
   Bubble content — renders text, image or voice note
═══════════════════════════════════════════════════════════ */
export function MessageBody({ m }) {
  if (m.kind === "image" && m.mediaUrl) {
    return (
      <>
        <a href={m.mediaUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
          <img src={m.mediaUrl} alt="Attachment"
            style={{
              display: "block", maxWidth: "100%", maxHeight: 260,
              objectFit: "cover", border: `1px solid ${c.line}`,
            }} />
        </a>
        {m.body && (
          <p style={{ fontSize: T.size.sm, color: c.text, lineHeight: 1.65, marginTop: 8, whiteSpace: "pre-line" }}>
            {m.body}
          </p>
        )}
      </>
    );
  }

  if (m.kind === "audio" && m.mediaUrl) {
    return <VoicePlayer src={m.mediaUrl} duration={m.mediaDuration} caption={m.body} />;
  }

  return (
    <p style={{ fontSize: T.size.sm, color: c.text, lineHeight: 1.65, whiteSpace: "pre-line", wordBreak: "break-word" }}>
      {m.body}
    </p>
  );
}

/* ── Voice note player ── */
function VoicePlayer({ src, duration, caption }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const fmt = (s) => {
    const n = Math.max(0, Math.round(s || 0));
    return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
  };

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); } else { a.play().catch(() => {}); }
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => { setPlaying(false); setProgress(0); };
    const onTime = () => {
      if (a.duration && isFinite(a.duration)) setProgress((a.currentTime / a.duration) * 100);
    };
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnd);
    a.addEventListener("timeupdate", onTime);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("timeupdate", onTime);
    };
  }, []);

  return (
    <>
      <div className="flex items-center gap-3" style={{ minWidth: 190 }}>
        <button onClick={toggle} aria-label={playing ? "Pause" : "Play"}
          className="flex items-center justify-center shrink-0"
          style={{ width: 34, height: 34, background: c.gain, color: "#fff", border: "none" }}>
          {playing ? <Pause size={15} /> : <Play size={15} />}
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ height: 2, background: "rgba(255,255,255,.12)" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: c.gain, transition: "width .15s linear" }} />
          </div>
          <p className="mono" style={{ fontSize: T.size.micro, color: c.text4, marginTop: 5 }}>
            {fmt(duration)}
          </p>
        </div>
      </div>

      <audio ref={audioRef} src={src} preload="metadata" style={{ display: "none" }} />

      {caption && (
        <p style={{ fontSize: T.size.sm, color: c.text, lineHeight: 1.65, marginTop: 8, whiteSpace: "pre-line" }}>
          {caption}
        </p>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   Composer — text, image picker, voice recorder
   onSend({ body, file, kind, duration })
═══════════════════════════════════════════════════════════ */
export function Composer({ onSend, sending, placeholder = "Type your message", onTyping }) {
  const [draft, setDraft] = useState("");
  const [preview, setPreview] = useState(null);   // { dataUrl, kind, duration, name }
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [micError, setMicError] = useState("");

  const fileRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const secondsRef = useRef(0);

  const toDataUrl = (file) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

  const pickImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setMicError("That image is over 8MB. Try a smaller one.");
      setTimeout(() => setMicError(""), 4000);
      return;
    }
    const dataUrl = await toDataUrl(file);
    setPreview({ dataUrl, kind: "image", name: file.name });
  };

  /* ── Recording ── */
  const startRecording = async () => {
    setMicError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Pick a format this browser actually supports
      let mimeType = "";
      const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
      for (const t of candidates) {
        if (window.MediaRecorder?.isTypeSupported?.(t)) { mimeType = t; break; }
      }

      const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];
      secondsRef.current = 0;

      rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };

      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        const secs = secondsRef.current;

        if (!blob.size || secs < 1) {
          setMicError("That recording was too short. Hold on a moment before sending.");
          setTimeout(() => setMicError(""), 4000);
          setPreview(null);
          setSeconds(0);
          return;
        }

        const dataUrl = await toDataUrl(blob);
        setPreview({ dataUrl, kind: "audio", duration: secs });
      };

      recorderRef.current = rec;
      // timeslice keeps chunks flowing so nothing is lost on stop
      rec.start(500);
      setRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        setSeconds(secondsRef.current);
        if (secondsRef.current >= MAX_SECONDS) stopRecording();
      }, 1000);
    } catch (err) {
      setMicError("Microphone blocked. Allow access in your browser settings.");
      setTimeout(() => setMicError(""), 5000);
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    setRecording(false);
    try { recorderRef.current?.stop(); } catch {}
  };

  const cancelRecording = () => {
    clearInterval(timerRef.current);
    setRecording(false);
    chunksRef.current = [];
    secondsRef.current = 0;
    try {
      recorderRef.current?.stream?.getTracks?.().forEach((t) => t.stop());
      recorderRef.current?.stop();
    } catch {}
    setSeconds(0);
    setPreview(null);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const submit = (e) => {
    e?.preventDefault();
    if (sending) return;
    if (!draft.trim() && !preview) return;

    onSend({
      body: draft.trim(),
      file: preview?.dataUrl || null,
      kind: preview?.kind || "text",
      duration: preview?.duration || 0,
    });

    setDraft("");
    setPreview(null);
    setSeconds(0);
    secondsRef.current = 0;
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const canSend = Boolean(draft.trim() || preview);

  return (
    <div style={{ borderTop: `1px solid ${c.line}` }}>

      {micError && (
        <p style={{ fontSize: T.size.xs, color: c.loss, padding: `10px ${T.space.md}px 0` }}>
          {micError}
        </p>
      )}

      {/* ── Attachment preview ── */}
      {preview && (
        <div className="flex items-center gap-3"
          style={{ padding: T.space.md, borderBottom: `1px solid ${c.lineSoft}` }}>
          {preview.kind === "image" ? (
            <img src={preview.dataUrl} alt="" style={{ width: 46, height: 46, objectFit: "cover", border: `1px solid ${c.line}` }} />
          ) : (
            <div className="flex items-center justify-center shrink-0"
              style={{ width: 46, height: 46, background: "rgba(63,143,95,.12)", border: `1px solid rgba(63,143,95,.3)` }}>
              <Mic size={16} style={{ color: c.gain }} />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: T.size.xs, color: c.text2 }}>
              {preview.kind === "image" ? "Image ready" : `Voice note · ${fmt(preview.duration || 0)}`}
            </p>
            <p className="mono truncate" style={{ fontSize: T.size.micro, color: c.text4 }}>
              {preview.name || "Tap send to share"}
            </p>
          </div>

          <button onClick={() => setPreview(null)} aria-label="Remove attachment"
            className="flex items-center justify-center shrink-0"
            style={{ width: 30, height: 30, background: c.fill, border: `1px solid ${c.line}`, color: c.text4 }}>
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── Recording bar ── */}
      {recording ? (
        <div className="flex items-center gap-3" style={{ padding: T.space.md }}>
          <span style={{
            width: 9, height: 9, borderRadius: "50%", background: c.loss,
            animation: "recPulse 1.1s ease-in-out infinite", flexShrink: 0,
          }} />
          <p className="mono tabular" style={{ fontSize: T.size.sm, color: c.text, flex: 1 }}>
            {fmt(seconds)} <span style={{ color: c.text4 }}>/ {fmt(MAX_SECONDS)}</span>
          </p>

          <button onClick={cancelRecording} aria-label="Cancel recording"
            className="flex items-center justify-center"
            style={{ width: 40, height: 40, background: c.fill, border: `1px solid ${c.line}`, color: c.loss }}>
            <Trash2 size={15} />
          </button>
          <button onClick={stopRecording} aria-label="Stop recording"
            className="flex items-center justify-center"
            style={{ width: 46, height: 40, background: c.gain, border: `1px solid ${c.gain}`, color: "#fff" }}>
            <Send size={15} />
          </button>

          <style>{`@keyframes recPulse { 0%,100% { opacity:1; } 50% { opacity:.25; } }`}</style>
        </div>
      ) : (
        <form onSubmit={submit} style={{ padding: T.space.md, display: "flex", gap: 8, alignItems: "flex-end" }}>

          <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} style={{ display: "none" }} />

          <button type="button" onClick={() => fileRef.current?.click()} aria-label="Attach image"
            className="flex items-center justify-center shrink-0"
            style={{ width: 44, height: 44, background: c.fill, border: `1px solid ${c.line}`, color: c.text3 }}>
            <ImageIcon size={16} />
          </button>

          <button type="button" onClick={startRecording} aria-label="Record voice note"
            className="flex items-center justify-center shrink-0"
            style={{ width: 44, height: 44, background: c.fill, border: `1px solid ${c.line}`, color: c.text3 }}>
            <Mic size={16} />
          </button>

          <textarea
            value={draft}
            onChange={(e) => { setDraft(e.target.value); onTyping?.(e.target.value); }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
            rows={1}
            placeholder={placeholder}
            style={{ ...inputStyle, flex: 1, resize: "none", minHeight: 44, maxHeight: 120, lineHeight: 1.5 }} />

          <button type="submit" disabled={!canSend || sending} aria-label="Send"
            className="flex items-center justify-center shrink-0"
            style={{
              width: 46, height: 44,
              background: canSend ? c.gain : c.fill,
              border: `1px solid ${canSend ? c.gain : c.line}`,
              color: canSend ? "#fff" : c.text4,
              transition: "background .2s, border-color .2s, color .2s",
            }}>
            {sending ? <Spinner size={14} tone="#fff" /> : <Send size={15} />}
          </button>
        </form>
      )}
    </div>
  );
}
