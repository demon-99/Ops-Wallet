import { useRef, useState } from "react";
import { convertImageToPdf } from "../../services/integrationApi.js";

function Toast({ message, hidden }) {
  return (
    <div className="toast" aria-hidden={hidden ? "true" : "false"} role="status" aria-live="polite" aria-atomic="true">
      <span className="toast__dot" aria-hidden="true"></span>
      <span className="toast__text">{message}</span>
    </div>
  );
}

export default function ImageToPdfPage() {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [outputName, setOutputName] = useState("output.pdf");
  const [landscape, setLandscape] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ message: "Ready.", hidden: false });
  const [dragOver, setDragOver] = useState(false);

  const onPickFile = (f) => {
    if (!f) return;
    const okMime = f.type === "image/jpeg" || f.type === "image/png";
    const okExt = /\.(jpe?g|png)$/i.test(f.name || "");
    if (!okMime && !okExt) {
      setToast({ message: "ApyHub accepts JPEG, JPG, and PNG only.", hidden: false });
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
    setToast({ message: "Converting to PDF…", hidden: false });
    try {
      const { blob, filename } = await convertImageToPdf(file, {
        output: outputName || "output.pdf",
        landscape,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setToast({ message: "PDF downloaded.", hidden: false });
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Conversion failed.",
        hidden: false,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="dash__panel" aria-labelledby="conv-title">
        <div className="dash__panel-head">
          <div className="dash__pill">ApyHub</div>
          <h2 id="conv-title" className="dash__panel-title">
            Image → PDF
          </h2>
          <p className="dash__panel-subtitle">
            JPEG, JPG, or PNG → PDF via ApyHub (multipart <span className="dash__code">file</span> + header{" "}
            <span className="dash__code">apy-token</span>). Token stays server-side.
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
              const f = e.dataTransfer.files?.[0];
              onPickFile(f);
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
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
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
                <strong>Drop a JPEG or PNG here</strong>
                <span className="integration__hint">or click to browse</span>
              </>
            )}
          </div>

          <div className="integration__row">
            <div className="field">
              <label className="label" htmlFor="out-name">
                Output filename
              </label>
              <div className="control">
                <input
                  id="out-name"
                  className="input"
                  value={outputName}
                  onChange={(e) => setOutputName(e.target.value)}
                  placeholder="output.pdf"
                  autoComplete="off"
                />
                <span className="ring" aria-hidden="true"></span>
              </div>
            </div>
            <label className="integration__landscape check">
              <input type="checkbox" checked={landscape} onChange={(e) => setLandscape(e.target.checked)} />
              <span>Landscape PDF</span>
            </label>
          </div>

          <button className="primary integration__submit" type="submit" disabled={busy}>
            <span>{busy ? "Converting…" : "Convert & download PDF"}</span>
            <span className="primary__shine" aria-hidden="true"></span>
          </button>
        </form>
      </section>

      <aside className="dash__side">
        <div className="side__card">
          <h3 className="side__title">Notes</h3>
          <ul className="side__list">
            <li>Requests go through your `integration_service` (8082).</li>
            <li>ApyHub may return 429 if you hit rate limits.</li>
          </ul>
        </div>
      </aside>

      <Toast message={toast.message} hidden={toast.hidden} />
    </>
  );
}

