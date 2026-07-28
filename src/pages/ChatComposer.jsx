import { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, Mic, X, Play, Pause, Trash2, Video, Film } from "lucide-react";
import { T, Spinner, inputStyle } from "./system.jsx";

const c = T.color;
const MAX_SECONDS = 120;                    // voice notes
const MAX_VIDEO_SECONDS = 60;               // screen recordings
const MAX_VIDEO_BYTES = 30 * 1024 * 1024;   // 30MB
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;    // 8MB

const fmt = (s) => {
  const n = Math.max(0, Math.round(s || 0));
  return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
};

/* ═══════════════════════════════════════════════════════════
   Bubble content — text, image, video or voice note
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

  if (m.kind === "video" && m.mediaUrl) {
    return (
      <>
        <video
          src={m.mediaUrl}
          poster={m.mediaThumb || undefined}
          controls
          playsInline
          preload="metadata"
          style={{
            display: "block", width: "100%", maxWidth: 320, maxHeight: 300,
            border: `1px solid ${c.line}`, background: "#000",
          }} />
        {m.mediaDuration > 0 && (
          <p className="mono" style={{ fontSize: T.size.micro, color: c.text4, marginTop: 5 }}>
            {fmt(m.mediaDuration)}
          </p>
        )}
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

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.pause();
    else a.play().catch(() => {});
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
   Composer
   onSend({ body, file, kind, duration })
═══════════════════════════════════════════════════════════ */
export function Composer({ onSend, sending, placeholder = "Type your message", onTyping }) {
  const [draft, setDraft] = useState("");
  const [preview, setPreview] = useState(null);   // { dataUrl, kind, duration, name }
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [micError, setMicError] = useState("");
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const secondsRef = useRef(0);
  const previewAudioRef = useRef(null);

  const warn = (msg, ms = 5000) => {
    setMicError(msg);
    setTimeout(() => setMicError(""), ms);
  };

  /* Reads a file/blob and normalises the data URL.
     "data:audio/webm;codecs=opus;base64,..." has two parameters, which
     breaks upstream parsers — reduce it to one. */
  const toDataUrl = (file) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const out = String(r.result).replace(
        /^data:([^;,]+)(;[^,]*)?;base64,/,
        (_all, mime) => `data:${mime};base64,`
      );
      resolve(out);
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });

  /* ── Image ── */
  const pickImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) return warn("That image is over 8MB. Try a smaller one.", 4000);
    const dataUrl = await toDataUrl(file);
    setPreview({ dataUrl, kind: "image", name: file.name });
  };

  /* ── Video ── */
  const pickVideo = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_VIDEO_BYTES) return warn("That video is over 30MB. Try a shorter clip.");

    // check its length before accepting it
    const url = URL.createObjectURL(file);
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.src = url;

    const secs = await new Promise((resolve) => {
      probe.onloadedmetadata = () => resolve(probe.duration || 0);
      probe.onerror = () => resolve(0);
      setTimeout(() => resolve(0), 4000);
    });
    URL.revokeObjectURL(url);

    if (secs > MAX_VIDEO_SECONDS + 1) {
      return warn(`Videos are limited to ${MAX_VIDEO_SECONDS} seconds. Trim it and try again.`);
    }

    const dataUrl = await toDataUrl(file);
    setPreview({ dataUrl, kind: "video", duration: Math.round(secs), name: file.name });
  };

  /* ── Voice recording ── */
  const startRecording = async () => {
    setMicError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      let mimeType = "";
      for (const t of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"]) {
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
          setPreview(null);
          setSeconds(0);
          return warn("That recording was too short. Hold on a moment before sending.", 4000);
        }

        const dataUrl = await toDataUrl(blob);
        setPreview({ dataUrl, kind: "audio", duration: secs });
      };

      recorderRef.current = rec;
      rec.start(500); // keep chunks flowing so nothing is lost on stop
      setRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        setSeconds(secondsRef.current);
        if (secondsRef.current >= MAX_SECONDS) stopRecording();
      }, 1000);
    } catch (err) {
      warn("Microphone blocked. Allow access in your browser settings.");
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

  /* ── Playback of a recorded note before sending ── */
  const togglePreviewAudio = () => {
    const a = previewAudioRef.current;
    if (!a) return;
    if (previewPlaying) a.pause();
    else a.play().catch(() => warn("Couldn't play that back on this device.", 4000));
  };

  useEffect(() => {
    setPreviewPlaying(false);
    const a = previewAudioRef.current;
    if (a) { a.pause(); a.currentTime = 0; }
  }, [preview]);

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

  const canSend = Boolean(draft.trim() || preview);

  const toolBtn = {
    width: 44, height: 44,
    background: c.fill, border: `1px solid ${c.line}`, color: c.text3,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  };

  return (
    <div style={{ borderTop: `1px solid ${c.line}` }}>

      {micError && (
        <p style={{ fontSize: T.size.xs, color: c.loss, padding: `10px ${T.space.md}px 0`, lineHeight: 1.5 }}>
          {micError}
        </p>
      )}

      {/* ── Attachment preview ── */}
      {preview && (
        <div className="flex items-center gap-3"
          style={{ padding: T.space.md, borderBottom: `1px solid ${c.lineSoft}` }}>

          {preview.kind === "image" ? (
            <img src={preview.dataUrl} alt=""
              style={{ width: 46, height: 46, objectFit: "cover", border: `1px solid ${c.line}`, flexShrink: 0 }} />
          ) : preview.kind === "video" ? (
            <div className="flex items-center justify-center shrink-0"
              style={{ width: 46, height: 46, background: "rgba(63,143,95,.12)", border: `1px solid rgba(63,143,95,.3)` }}>
              <Film size={17} style={{ color: c.gain }} />
            </div>
          ) : (
            <button type="button" onClick={togglePreviewAudio}
              aria-label={previewPlaying ? "Pause" : "Play back"}
              className="flex items-center justify-center shrink-0"
              style={{ width: 46, height: 46, background: c.gain, border: `1px solid ${c.gain}`, color: "#fff" }}>
              {previewPlaying ? <Pause size={17} /> : <Play size={17} />}
            </button>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: T.size.xs, color: c.text2 }}>
              {preview.kind === "image" ? "Image ready"
                : preview.kind === "video" ? `Video · ${fmt(preview.duration || 0)}`
                : `Voice note · ${fmt(preview.duration || 0)}`}
            </p>
            <p className="mono truncate" style={{ fontSize: T.size.micro, color: c.text4 }}>
              {preview.kind === "audio"
                ? (previewPlaying ? "Playing…" : "Tap play to listen back")
                : (preview.name || "Tap send to share")}
            </p>
          </div>

          <button type="button" onClick={() => setPreview(null)} aria-label="Remove attachment"
            className="flex items-center justify-center shrink-0"
            style={{ width: 30, height: 30, background: c.fill, border: `1px solid ${c.line}`, color: c.text4 }}>
            <X size={13} />
          </button>

          {preview.kind === "audio" && (
            <audio
              ref={previewAudioRef}
              src={preview.dataUrl}
              preload="metadata"
              onPlay={() => setPreviewPlaying(true)}
              onPause={() => setPreviewPlaying(false)}
              onEnded={() => setPreviewPlaying(false)}
              style={{ display: "none" }}
            />
          )}
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

          <button type="button" onClick={cancelRecording} aria-label="Cancel recording"
            className="flex items-center justify-center"
            style={{ width: 40, height: 40, background: c.fill, border: `1px solid ${c.line}`, color: c.loss }}>
            <Trash2 size={15} />
          </button>
          <button type="button" onClick={stopRecording} aria-label="Finish recording"
            className="flex items-center justify-center"
            style={{ width: 46, height: 40, background: c.gain, border: `1px solid ${c.gain}`, color: "#fff" }}>
            <Send size={15} />
          </button>

          <style>{`@keyframes recPulse { 0%,100% { opacity:1; } 50% { opacity:.25; } }`}</style>
        </div>
      ) : (
        <form onSubmit={submit} style={{ padding: T.space.md, display: "flex", gap: 8, alignItems: "flex-end" }}>

          <input ref={imageRef} type="file" accept="image/*" onChange={pickImage} style={{ display: "none" }} />
          <input ref={videoRef} type="file" accept="video/*" onChange={pickVideo} style={{ display: "none" }} />

          <button type="button" onClick={() => imageRef.current?.click()} aria-label="Attach image" style={toolBtn}>
            <ImageIcon size={16} />
          </button>

          <button type="button" onClick={() => videoRef.current?.click()} aria-label="Attach video" style={toolBtn}>
            <Video size={16} />
          </button>

          <button type="button" onClick={startRecording} aria-label="Record voice note" style={toolBtn}>
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
