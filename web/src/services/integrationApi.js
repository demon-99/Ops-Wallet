const base =
  (import.meta.env.VITE_INTEGRATION_SERVICE_URL || "http://localhost:8082").replace(/\/$/, "");

/**
 * POST multipart to integration_service → PDF bytes.
 * @param {File} file
 * @param {{ output?: string, landscape?: boolean, signal?: AbortSignal }} opts
 * @returns {Promise<{ blob: Blob, filename: string }>}
 */
export async function convertImageToPdf(file, opts = {}) {
  const output = opts.output?.trim() || "output.pdf";
  const landscape = !!opts.landscape;
  const params = new URLSearchParams({ output, landscape: String(landscape) });

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${base}/api/convert/image-to-pdf?${params}`, {
    method: "POST",
    body: form,
    signal: opts.signal,
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const text = await res.text();
      if (text) {
        const j = JSON.parse(text);
        if (typeof j?.message === "string") msg = j.message;
        else if (typeof j?.detail === "string") msg = j.detail;
      }
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition");
  let filename = output;
  const m = cd && /filename\*?=(?:UTF-8''|")?([^";\n]+)/i.exec(cd);
  if (m?.[1]) filename = decodeURIComponent(m[1].replace(/"/g, "").trim());

  return { blob, filename };
}

/**
 * POST multipart to integration_service → PDF bytes.
 * @param {File} file
 * @param {{ output?: string, landscape?: boolean, signal?: AbortSignal }} opts
 * @returns {Promise<{ blob: Blob, filename: string }>}
 */
export async function convertHtmlToPdf(file, opts = {}) {
  const output = opts.output?.trim() || "output.pdf";
  const landscape = !!opts.landscape;
  const params = new URLSearchParams({ output, landscape: String(landscape) });

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${base}/api/convert/html-to-pdf?${params}`, {
    method: "POST",
    body: form,
    signal: opts.signal,
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const text = await res.text();
      if (text) {
        const j = JSON.parse(text);
        if (typeof j?.message === "string") msg = j.message;
        else if (typeof j?.detail === "string") msg = j.detail;
      }
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition");
  let filename = output;
  const m = cd && /filename\*?=(?:UTF-8''|")?([^";\n]+)/i.exec(cd);
  if (m?.[1]) filename = decodeURIComponent(m[1].replace(/"/g, "").trim());

  return { blob, filename };
}

/**
 * POST multipart to integration_service → image bytes (background removed).
 * @param {File} file
 * @param {{ output?: string, signal?: AbortSignal }} opts
 * @returns {Promise<{ blob: Blob, filename: string }>}
 */
export async function removeImageBackground(file, opts = {}) {
  const output = opts.output?.trim() || "no-background.png";
  const params = new URLSearchParams({ output });

  const form = new FormData();
  form.append("image", file);

  const res = await fetch(`${base}/api/processor/remove-background?${params}`, {
    method: "POST",
    body: form,
    signal: opts.signal,
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const text = await res.text();
      if (text) {
        const j = JSON.parse(text);
        if (typeof j?.message === "string") msg = j.message;
        else if (typeof j?.detail === "string") msg = j.detail;
      }
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition");
  let filename = output;
  const m = cd && /filename\*?=(?:UTF-8''|")?([^";\n]+)/i.exec(cd);
  if (m?.[1]) filename = decodeURIComponent(m[1].replace(/"/g, "").trim());

  return { blob, filename };
}

/**
 * POST JSON to integration_service → barcode PNG bytes (ApyHub generate/barcode/file).
 * @param {string} content
 * @param {{ output?: string, signal?: AbortSignal }} opts
 * @returns {Promise<{ blob: Blob, filename: string }>}
 */
export async function generateBarcode(content, opts = {}) {
  const output = opts.output?.trim() || "barcode.png";
  const params = new URLSearchParams({ output });

  const res = await fetch(`${base}/api/generate/barcode?${params}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
    signal: opts.signal,
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const text = await res.text();
      if (text) {
        const j = JSON.parse(text);
        if (typeof j?.message === "string") msg = j.message;
        else if (typeof j?.detail === "string") msg = j.detail;
      }
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition");
  let filename = output;
  const m = cd && /filename\*?=(?:UTF-8''|")?([^";\n]+)/i.exec(cd);
  if (m?.[1]) filename = decodeURIComponent(m[1].replace(/"/g, "").trim());

  return { blob, filename };
}

/**
 * GET integration_service → webpage screenshot PNG (ApyHub generate/screenshot/webpage/image-file).
 * @param {{ url: string, output?: string, delay?: number, quality?: number, signal?: AbortSignal }} opts
 * @returns {Promise<{ blob: Blob, filename: string }>}
 */
export async function captureWebpageScreenshot(opts) {
  const url = opts.url?.trim();
  if (!url) {
    throw new Error("url is required");
  }
  const params = new URLSearchParams({ url });
  if (opts.output?.trim()) params.set("output", opts.output.trim());
  if (opts.delay != null && opts.delay !== "") params.set("delay", String(Number(opts.delay)));
  if (opts.quality != null && opts.quality !== "") params.set("quality", String(Number(opts.quality)));

  const res = await fetch(`${base}/api/generate/screenshot/webpage?${params}`, {
    method: "GET",
    signal: opts.signal,
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const text = await res.text();
      if (text) {
        const j = JSON.parse(text);
        if (typeof j?.message === "string") msg = j.message;
        else if (typeof j?.detail === "string") msg = j.detail;
      }
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition");
  let filename = opts.output?.trim() || "output.png";
  const m = cd && /filename\*?=(?:UTF-8''|")?([^";\n]+)/i.exec(cd);
  if (m?.[1]) filename = decodeURIComponent(m[1].replace(/"/g, "").trim());

  return { blob, filename };
}
