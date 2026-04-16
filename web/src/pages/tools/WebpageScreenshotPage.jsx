import { useState } from "react";
import { captureWebpageScreenshot } from "../../services/integrationApi.js";

function Toast({ message, hidden }) {
  return (
    <div className="toast" aria-hidden={hidden ? "true" : "false"} role="status" aria-live="polite" aria-atomic="true">
      <span className="toast__dot" aria-hidden="true"></span>
      <span className="toast__text">{message}</span>
    </div>
  );
}

export default function WebpageScreenshotPage() {
  const [pageUrl, setPageUrl] = useState("https://apyhub.com");
  const [outputName, setOutputName] = useState("screenshot.png");
  const [delaySec, setDelaySec] = useState("3");
  const [quality, setQuality] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState({ message: "", hidden: true });

  const onSubmit = async (e) => {
    e.preventDefault();
    const u = pageUrl.trim();
    if (!u) {
      setToast({ message: "Enter a page URL.", hidden: false });
      return;
    }
    if (!/^https?:\/\//i.test(u)) {
      setToast({ message: "URL must start with http:// or https://", hidden: false });
      return;
    }
    setBusy(true);
    setToast({ message: "Capturing screenshot (may take a while)…", hidden: false });
    try {
      const delayNum = delaySec === "" ? undefined : Number(delaySec);
      const qualityNum = quality === "" ? undefined : Number(quality);
      const { blob, filename } = await captureWebpageScreenshot({
        url: u,
        output: outputName || "screenshot.png",
        delay: Number.isFinite(delayNum) ? delayNum : undefined,
        quality: Number.isFinite(qualityNum) ? qualityNum : undefined,
      });
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = /\.(png|jpe?g|webp)$/i.test(filename) ? filename : `${filename}.png`;
      a.click();
      URL.revokeObjectURL(objectUrl);
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
      <section className="dash__panel" aria-labelledby="ss-title">
        <div className="dash__panel-head">
          <div className="dash__pill">ApyHub</div>
          <h2 id="ss-title" className="dash__panel-title">
            Webpage screenshot
          </h2>
          <p className="dash__panel-subtitle">
            <span className="dash__code">GET /generate/screenshot/webpage/image-file</span> — full-page capture. Optional{" "}
            <span className="dash__code">delay</span> (seconds, default 3) and <span className="dash__code">quality</span>{" "}
            (1–5).
          </p>
        </div>

        <form className="integration__form" onSubmit={onSubmit}>
          <div className="field">
            <label className="label" htmlFor="ss-url">
              Page URL
            </label>
            <div className="control">
              <input
                id="ss-url"
                className="input"
                type="url"
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                placeholder="https://example.com"
                autoComplete="off"
              />
              <span className="ring" aria-hidden="true"></span>
            </div>
          </div>

          <div className="integration__row">
            <div className="field">
              <label className="label" htmlFor="ss-delay">
                Delay (seconds)
              </label>
              <div className="control">
                <input
                  id="ss-delay"
                  className="input"
                  type="number"
                  min={0}
                  step={1}
                  value={delaySec}
                  onChange={(e) => setDelaySec(e.target.value)}
                  placeholder="3"
                />
                <span className="ring" aria-hidden="true"></span>
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="ss-quality">
                Quality (1–5)
              </label>
              <div className="control">
                <select
                  id="ss-quality"
                  className="input"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                >
                  <option value="">Default (highest)</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
                <span className="ring" aria-hidden="true"></span>
              </div>
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="ss-out">
              Output filename
            </label>
            <div className="control">
              <input
                id="ss-out"
                className="input"
                value={outputName}
                onChange={(e) => setOutputName(e.target.value)}
                placeholder="screenshot.png"
                autoComplete="off"
              />
              <span className="ring" aria-hidden="true"></span>
            </div>
          </div>

          <button className="primary integration__submit" type="submit" disabled={busy}>
            <span>{busy ? "Capturing…" : "Capture & download"}</span>
            <span className="primary__shine" aria-hidden="true"></span>
          </button>
        </form>
      </section>

      <aside className="dash__side">
        <div className="side__card">
          <h3 className="side__title">Notes</h3>
          <ul className="side__list">
            <li>Some sites block automated capture; try a public page first.</li>
            <li>ApyHub may return 400/105 for invalid or unreachable URLs.</li>
          </ul>
        </div>
      </aside>

      <Toast message={toast.message} hidden={toast.hidden} />
    </>
  );
}
