import { useRef, useState } from "react";
import { removeImageBackground } from "../../services/integrationApi.js";

function Toast({ message, hidden }) {
  return (
    <div className="toast" aria-hidden={hidden ? "true" : "false"} role="status" aria-live="polite" aria-atomic="true">
      <span className="toast__dot" aria-hidden="true"></span>
      <span className="toast__text">{message}</span>
    </div>
  );
}

const ACCEPT =
  ".webp,.jpg,.jpeg,.png,.bmp,.gif,.tif,.tiff,image/webp,image/jpeg,image/png,image/bmp,image/gif,image/tiff";

export default function RemoveBackgroundPage() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [outputName, setOutputName] = useState("no-background.png");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ message: "Ready.", hidden: false });
  const [dragOver, setDragOver] = useState(false);

  const extOk = (name) => /\.(webp|jpe?g|png|bmp|gif|tiff?)$/i.test(name || "");

  const onPickFile = (f) => {
    if (!f) return;
    const mimeOk = /^image\//.test(f.type || "");
    if (!mimeOk && !extOk(f.name)) {
      setToast({
        message: "Use WebP, JPG, JPEG, PNG, BMP, GIF, or TIFF (ApyHub remove-background).",
        hidden: false,
      });
      return;
    }
    setFile(f);
    setToast({ message: `Selected: ${f.name}`, hidden: false });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setToast({ message: "Choose an image first.", hidden: false });
      return;
    }
    setBusy(true);
    setToast({ message: "Removing background…", hidden: false });
    try {
      const { blob, filename } = await removeImageBackground(file, {
        output: outputName || "no-background.png",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setToast({ message: "Download started.", hidden: false });
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Request failed.",
        hidden: false,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="dash__panel" aria-labelledby="rb-title">
        <div className="dash__panel-head">
          <div className="dash__pill">ApyHub</div>
          <h2 id="rb-title" className="dash__panel-title">
            Remove background
          </h2>
          <p className="dash__panel-subtitle">
            Upload an image; the server calls{" "}
            <span className="dash__code">POST /processor/image/remove-background/file</span> with multipart{" "}
            <span className="dash__code">image</span> and your <span className="dash__code">apy-token</span>.
          </p>
        </div>

        <form className="integration__form" onSubmit={onSubmit}>
          <div
            className={`integration__drop ${dragOver ? "integration__drop--active" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              onPickFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              className="integration__file-input"
              onChange={(e) => onPickFile(e.target.files?.[0])}
            />
            {file ? (
              <>
                <strong>{file.name}</strong>
                <span className="integration__hint">{(file.size / 1024).toFixed(1)} KB — click to replace</span>
              </>
            ) : (
              <>
                <strong>Drop an image here</strong>
                <span className="integration__hint">WebP, JPG, PNG, BMP, GIF, TIFF…</span>
              </>
            )}
          </div>

          <div className="integration__row">
            <div className="field">
              <label className="label" htmlFor="rb-out">
                Output filename
              </label>
              <div className="control">
                <input
                  id="rb-out"
                  className="input"
                  value={outputName}
                  onChange={(e) => setOutputName(e.target.value)}
                  placeholder="no-background.png"
                  autoComplete="off"
                />
                <span className="ring" aria-hidden="true"></span>
              </div>
            </div>
          </div>

          <button className="primary integration__submit" type="submit" disabled={busy}>
            <span>{busy ? "Processing…" : "Remove background & download"}</span>
            <span className="primary__shine" aria-hidden="true"></span>
          </button>
        </form>
      </section>

      <aside className="dash__side">
        <div className="side__card">
          <h3 className="side__title">Formats</h3>
          <ul className="side__list">
            <li>WebP, JPG, JPEG, PNG, BMP, GIF, TIFF</li>
            <li>ApyHub may return 429 if rate-limited.</li>
          </ul>
        </div>
      </aside>

      <Toast message={toast.message} hidden={toast.hidden} />
    </>
  );
}
