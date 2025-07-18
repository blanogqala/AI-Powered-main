import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";

export default function Badges() {
  const { user } = useUser();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBadges() {
      setLoading(true);
      try {
        // Fetch completed courses (badges) from backend
        const res = await fetch(`/api/my-courses?userId=${user?.uid || "demoUser"}`);
        const data = await res.json();
        // Filter for completed courses (assume a 'completedAt' field exists)
        let completed = (data.enrollments || []).filter(c => c.completedAt);
        // Also check localStorage for badges (for demo)
        const localBadges = [];
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('badge_')) {
            try {
              const badge = JSON.parse(localStorage.getItem(key));
              if (badge && badge.title) localBadges.push(badge);
            } catch {}
          }
        });
        // Merge and deduplicate by title
        const allBadges = [...completed, ...localBadges];
        const deduped = [];
        const seen = new Set();
        for (const b of allBadges) {
          if (!seen.has(b.title)) {
            deduped.push(b);
            seen.add(b.title);
          }
        }
        setBadges(deduped);
      } catch {
        setBadges([]);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchBadges();
  }, [user]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontWeight: 800, fontSize: '2.2rem', color: '#3576d3', marginBottom: 24 }}>
        Achievements / Courses You Have Completed
      </h1>
      {loading ? (
        <div style={{ color: '#888', fontSize: 18 }}>Loading badges...</div>
      ) : badges.length === 0 ? (
        <div style={{ color: '#888', fontSize: 18 }}>No badges yet. Complete a course to earn your first badge!</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {badges.map((badge, idx) => (
            <div key={badge.title || idx} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(31,38,135,0.07)', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ fontWeight: 700, fontSize: 22, color: '#3576d3', marginBottom: 8 }}>{badge.title}</div>
              <div style={{ color: '#444', fontSize: 16, marginBottom: 10 }}>{badge.description}</div>
              <div style={{ color: '#888', fontSize: 15, marginTop: 'auto' }}>
                Completed: {badge.completedAt ? new Date(badge.completedAt).toLocaleString() : (badge.createdAt ? new Date(badge.createdAt).toLocaleString() : 'Unknown')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 