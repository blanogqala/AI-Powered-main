import React, { useState } from "react";

export default function GeneratedLearningPath({ result, formData, onStartLearning, userId }) {
  const [tab, setTab] = useState("curriculum");
  const [resources, setResources] = useState(null);
  const [loadingResources, setLoadingResources] = useState(false);
  const modules = result.curriculum ? Object.entries(result.curriculum) : [];
  const resourcesArr = resources ? Object.entries(resources) : [];

  // Flatten all resources into a single array (remove week grouping)
  const allResources = resourcesArr.flatMap(([_, res]) => Array.isArray(res) ? res : [res]);

  // Fetch resources on demand
  React.useEffect(() => {
    if (tab === "resources" && !resources && !loadingResources) {
      setLoadingResources(true);
      fetch("/api/generate-resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: result.title,
          timeline: formData.timeline,
          level: formData.level,
          userId
        })
      })
        .then(res => res.json())
        .then(data => setResources(data.resources))
        .catch(() => setResources({}))
        .finally(() => setLoadingResources(false));
    }
  }, [tab]);

  // Handle enrollment
  const handleStartLearning = async () => {
    try {
      await fetch("/api/enroll-learning-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, learningPath: result })
      });
      onStartLearning();
    } catch (err) {
      alert("Failed to enroll in this learning path.");
    }
  };

  // Helper: Render curriculum with week/module/lessons
  function renderCurriculum() {
    return (
      <div>
        <h4 style={{ color: "#3576d3", marginBottom: 18, fontWeight: 700, fontSize: 22 }}>Curriculum</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {modules.map(([week, module], idx) => {
            // If module is an object with header/lessons, use that, else fallback
            let header = `Module: ${Array.isArray(module) ? module[0] : module}`;
            let lessons = Array.isArray(module) ? module : [module];
            if (typeof module === 'object' && module !== null && module.header && module.lessons) {
              header = module.header;
              lessons = module.lessons;
            }
            return (
              <div key={week} style={{
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 1px 6px rgba(31,38,135,0.08)',
                padding: '1.2rem 1.5rem',
                minWidth: 260,
                flex: '1 1 260px',
                marginBottom: 12,
                borderLeft: '6px solid #4f8cff',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#3576d3', marginBottom: 6 }}>{week}</div>
                <div style={{ fontWeight: 600, color: '#222', marginBottom: 6 }}>{header}</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {lessons.map((lesson, tIdx) => (
                    <li key={tIdx} style={{ color: '#222', fontSize: 15, marginBottom: 4 }}>{lesson}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Helper: Render resources with links
  function renderResources() {
    return (
      <div style={{ padding: 8 }}>
        {loadingResources ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <div style={{ width: 50, height: 50, border: '5px solid #e0e0e0', borderTop: '5px solid #3576d3', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <>
            <h4 style={{ fontWeight: 700, color: "#3576d3", marginBottom: 12 }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {allResources.length === 0 && <span style={{ color: '#888' }}>No resources listed.</span>}
              {allResources.map((res, idx) => {
                let name = typeof res === 'string' ? res : (res.title || res.name || 'Resource');
                let url = typeof res === 'object' && res.url ? res.url : null;
                if (!url && typeof res === 'string') {
                  const match = res.match(/(https?:\/\/[^\"]+)/);
                  if (match) url = match[1];
                }
                return (
                  <div key={idx} style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(31,38,135,0.06)', padding: '0.8rem 1.2rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 500, color: '#222', flex: 1 }}>{name}</span>
                    {url && (
                      <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#3576d3', fontWeight: 600, textDecoration: 'underline' }}>
                        [Link]
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ minWidth: "80vw", minHeight: "70vh", maxWidth: "100vw", maxHeight: "100vh", padding: "2rem 1.5rem", display: "flex", flexDirection: "column" }}>
      {/* Title and Description */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 800, fontSize: 28, color: "#3576d3", marginBottom: 6 }}>{result.title}</div>
        <div style={{ color: "#444", fontSize: 17, marginBottom: 10 }}>{result.description}</div>
      </div>
      {/* Summary Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: 18 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
            <span style={{ color: "#3576d3" }}>{modules.length} modules</span>
          </div>
          <div style={{ color: "#888", fontSize: 14 }}>
            {formData.timeline} months &nbsp;|&nbsp; Level: {formData.level}
          </div>
        </div>
        <button
          style={{ marginLeft: "auto", background: "#4f8cff", color: "#fff", border: "none", borderRadius: 8, padding: "0.7rem 1.5rem", fontWeight: 600, cursor: "pointer" }}
          onClick={handleStartLearning}
        >
          Start Learning
        </button>
      </div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1.5px solid #e0e0e0", marginBottom: 16 }}>
        {["curriculum", "resources"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: "none",
              border: "none",
              borderBottom: tab === t ? "2.5px solid #4f8cff" : "none",
              color: tab === t ? "#3576d3" : "#888",
              fontWeight: tab === t ? 700 : 500,
              fontSize: 16,
              padding: "0.5rem 0.7rem",
              cursor: "pointer"
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div style={{ maxHeight: 350, marginBottom: 12, textAlign: "left", background: "#f8faff", borderRadius: 12, padding: "1.5rem 1.2rem", boxShadow: "0 2px 12px rgba(31,38,135,0.06)", display: tab === "curriculum" ? "block" : "block" }}>
        {tab === "curriculum" && renderCurriculum()}
        {tab === "resources" && renderResources()}
      </div>
    </div>
  );
} 