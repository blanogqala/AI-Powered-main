import React, { useState } from "react";
import TopicTimelineForm from "../components/Phase1/TopicTimelineForm";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import { useUser } from "../context/UserContext";
import { FaUserCircle, FaSearch, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import GeneratedLearningPath from "../components/ui/GeneratedLearningPath";

// Spinner component for loading overlay
function SpinnerOverlay({ loading }) {
  if (!loading) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(100, 100, 100, 0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        width: 70,
        height: 70,
        border: '8px solid #e0e0e0',
        borderTop: '8px solid #3576d3',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        background: 'rgba(255,255,255,0.7)'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const { user, logout } = useUser();
  const navigate = useNavigate();

  // New: handle form submission from TopicTimelineForm
  const handleGenerate = async ({ topic, timeline, level, specializations }) => {
    setLoading(true);
    setResult(null);
    setFormData({ topic, timeline, level, specializations });
    try {
      const res = await fetch("/api/generateLearningPath", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          timeline,
          level,
          specializations,
          userId: user?.uid || "demoUser"
        })
      });
      const dataRes = await res.json();
      // The backend now returns { learningPaths, savedIds }
      setResult({ learningPaths: dataRes.learningPaths });
      if (Array.isArray(dataRes.learningPaths)) {
        localStorage.setItem(`recommendedPaths_${user?.uid || "demoUser"}`, JSON.stringify(dataRes.learningPaths));
      }
    } catch (err) {
      alert("Failed to generate learning path.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Only show cards if result.learningPaths is present
  const cards = result && result.learningPaths ? result.learningPaths : [];

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "#f4f8fb", position: 'relative' }}>
      <SpinnerOverlay loading={loading} />
      {/* Fixed Nav Bar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        background: '#fff',
        boxShadow: '0 2px 12px rgba(31,38,135,0.06)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 80
      }}>
        <div style={{
          width: '100%',
          maxWidth: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2.5rem',
        }}>
          <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: 1, color: '#222' }}>
            AI-POWERED LEARNING PLATFORM
          </div>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, color: '#3576d3' }}
                onClick={() => setShowProfileDrawer(true)}
                aria-label="Profile"
              >
                <FaUserCircle />
              </button>
              <button
                style={{ background: '#e3eefe', color: '#3576d3', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                onClick={() => navigate("/dashboard")}
              >
                <FaTachometerAlt style={{ fontSize: 18 }} /> Dashboard
              </button>
              <button
                style={{ background: '#3576d3', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                onClick={handleLogout}
              >
                <FaSignOutAlt style={{ fontSize: 18 }} /> Log out
              </button>
            </div>
          )}
        </div>
      </nav>
      {/* Profile Drawer */}
      {showProfileDrawer && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 320,
          height: '100vh',
          background: '#fff',
          boxShadow: '-2px 0 16px rgba(31,38,135,0.10)',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          padding: '2rem 1.5rem',
          transition: 'right 0.3s',
        }}>
          <button style={{ alignSelf: 'flex-end', background: 'none', border: 'none', fontSize: 28, color: '#888', cursor: 'pointer' }} onClick={() => setShowProfileDrawer(false)}>&times;</button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 24 }}>
            <FaUserCircle style={{ fontSize: 64, color: '#3576d3', marginBottom: 12 }} />
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>{user?.displayName || 'User'}</div>
            <div style={{ color: '#888', fontSize: 15 }}>{user?.email || 'user@email.com'}</div>
          </div>
        </div>
      )}
      {/* Main Section */}
      <div style={{
        maxWidth: '100%',
        margin: '0 auto',
        padding: '120px 2rem 0 2rem', // padding-top for nav bar
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        minHeight: '100vh',
      }}>
        <h1 style={{ fontWeight: 800, fontSize: '2.5rem', marginBottom: 8, marginTop: 0, background: 'linear-gradient(90deg, #3576d3 0%, #6be7ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Welcome to Learning Platform
        </h1>
        {/* Use TopicTimelineForm for input */}
        <TopicTimelineForm onGenerate={handleGenerate} loading={loading} />
        {/* Card Grid: only show after search/result and if cards exist */}
        {cards.length > 0 && (
          <div style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 28,
            marginTop: 8,
            marginBottom: 32
          }}>
            {cards.map((card, idx) => (
              <div
                key={card.title || idx}
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  boxShadow: '0 2px 12px rgba(31,38,135,0.08)',
                  padding: '1.5rem 1.2rem 1.2rem 1.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  border: '2px solid transparent',
                  position: 'relative',
                  minHeight: 320,
                  outline: selectedCard === idx ? '2px solid #3576d3' : 'none',
                }}
                onClick={() => { setSelectedCard(idx); setShowModal(true); }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ width: '100%', height: 120, borderRadius: 12, overflow: 'hidden', marginBottom: 18, background: '#e3eefe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={'/logo192.png'} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, color: '#222' }}>{card.title}</div>
                <div style={{ color: '#3576d3', fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{card.description}</div>
                {/* Show specializations if present */}
                {card.specializations && (
                  <div style={{ color: '#888', fontSize: 14, marginBottom: 6 }}>
                    <strong>Specializations:</strong> {card.specializations}
                  </div>
                )}
                <div style={{ color: '#888', fontSize: 15, marginTop: 'auto' }}>Timeline: {card.timeline || formData.timeline} months · Level: {card.level || formData.level}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Modal for generated learning path (show only for selected card) */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        {cards.length > 0 && selectedCard !== null && (
          <GeneratedLearningPath
            result={cards[selectedCard]}
            formData={formData}
            userId={user?.uid || "demoUser"}
            onStartLearning={() => {
              setShowModal(false);
              // Optionally, you can refresh courses here if needed
              navigate("/dashboard");
            }}
          />
        )}
      </Modal>
    </div>
  );
}
