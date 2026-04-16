export default function ComingSoonToolPage({ title, description }) {
  return (
    <section className="dash__panel" aria-labelledby="tool-title">
      <header className="dash__panel-head">
        <h2 id="tool-title" className="dash__panel-title">
          {title}
        </h2>
        {description ? <p className="dash__panel-subtitle">{description}</p> : null}
      </header>
      <div className="dash__panel-body">
        <div className="dash__coming">
          <div className="dash__coming-badge">Coming soon</div>
          <p className="dash__coming-text">This tool is wired in the navigation; implementation is next.</p>
        </div>
      </div>
    </section>
  );
}

