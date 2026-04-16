import { useState } from "react";
import { generateBarcode } from "../../services/integrationApi.js";

function Toast({ message, hidden }) {
  return (
    <div className="toast" aria-hidden={hidden ? "true" : "false"} role="status" aria-live="polite" aria-atomic="true">
      <span className="toast__dot" aria-hidden="true"></span>
      <span className="toast__text">{message}</span>
    </div>
  );
}

const MAX_LEN = 80;

export default function BarcodePage() {
  const [content, setContent] = useState("https://apyhub.com");
  const [outputName, setOutputName] = useState("barcode.png");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ message: "", hidden: true });

  const onSubmit = async (e) => {
    e.preventDefault();
    const text = content.trim();
    if (!text) {
      setToast({ message: "Enter content to encode.", hidden: false });
      return;
    }
    if (text.length > MAX_LEN) {
      setToast({ message: `Content must be ${MAX_LEN} characters or less.`, hidden: false });
      return;
    }
    setBusy(true);
    setToast({ message: "Generating barcode…", hidden: false });
    try {
      const { blob, filename } = await generateBarcode(text, {
        output: outputName || "barcode.png",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setToast({ message: "Image downloaded.", hidden: false });
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
      <section className="dash__panel" aria-labelledby="bc-title">
        <div className="dash__panel-head">
          <div className="dash__pill">ApyHub</div>
          <h2 id="bc-title" className="dash__panel-title">
            Barcode (1D)
          </h2>
          <p className="dash__panel-subtitle">
            JSON body <span className="dash__code">{"{ \"content\": \"...\" }"}</span> to{" "}
            <span className="dash__code">POST /generate/barcode/file</span>. Max {MAX_LEN} characters.
          </p>
        </div>

        <form className="integration__form" onSubmit={onSubmit}>
          <div className="field">
            <label className="label" htmlFor="bc-content">
              Content
            </label>
            <div className="control">
              <input
                id="bc-content"
                className="input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="URL or short text"
                maxLength={MAX_LEN}
                autoComplete="off"
              />
              <span className="ring" aria-hidden="true"></span>
            </div>
            <p className="integration__hint" style={{ marginTop: 8 }}>
              {content.length}/{MAX_LEN} characters
            </p>
          </div>

          <div className="field">
            <label className="label" htmlFor="bc-out">
              Output filename
            </label>
            <div className="control">
              <input
                id="bc-out"
                className="input"
                value={outputName}
                onChange={(e) => setOutputName(e.target.value)}
                placeholder="barcode.png"
                autoComplete="off"
              />
              <span className="ring" aria-hidden="true"></span>
            </div>
          </div>

          <button className="primary integration__submit" type="submit" disabled={busy}>
            <span>{busy ? "Generating…" : "Generate & download PNG"}</span>
            <span className="primary__shine" aria-hidden="true"></span>
          </button>
        </form>
      </section>

      <aside className="dash__side">
        <div className="side__card">
          <h3 className="side__title">Notes</h3>
          <ul className="side__list">
            <li>ApyHub returns a barcode image (default filename output.png).</li>
            <li>Empty content returns 400 from ApyHub.</li>
          </ul>
        </div>
      </aside>

      <Toast message={toast.message} hidden={toast.hidden} />
    </>
  );
}
