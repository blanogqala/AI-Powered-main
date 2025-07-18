import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import app from "../../firebase";

/**
 * NotesTab
 * Props:
 * - lessonId: string
 * - userId: string
 *
 * Allows user to write and save notes to Firestore (or localStorage fallback).
 */
export default function NotesTab({ lessonId, userId }) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const db = getFirestore(app);

  // Load note on mount
  useEffect(() => {
    let isMounted = true;
    async function loadNote() {
      setLoading(true);
      setError("");
      try {
        // Try Firestore first
        const noteRef = doc(db, "notes", `${userId}_${lessonId}`);
        const snap = await getDoc(noteRef);
        if (isMounted && snap.exists()) {
          setNote(snap.data().note || "");
        } else {
          // Fallback: localStorage
          const key = `lessonNote_${userId}_${lessonId}`;
          const savedNote = localStorage.getItem(key);
          if (isMounted && savedNote) setNote(savedNote);
        }
      } catch (err) {
        // Fallback: localStorage
        const key = `lessonNote_${userId}_${lessonId}`;
        const savedNote = localStorage.getItem(key);
        if (isMounted && savedNote) setNote(savedNote);
        setError("Failed to load note from Firestore. Using local storage.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (lessonId && userId) loadNote();
    return () => { isMounted = false; };
  }, [lessonId, userId, db]);

  // Save note
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      // Try Firestore first
      const noteRef = doc(db, "notes", `${userId}_${lessonId}`);
      await setDoc(noteRef, { note, userId, lessonId, updated: Date.now() });
      setSaved(true);
    } catch (err) {
      // Fallback: localStorage
      const key = `lessonNote_${userId}_${lessonId}`;
      localStorage.setItem(key, note);
      setError("Saved to local storage only (Firestore unavailable).");
      setSaved(true);
    } finally {
      setSaving(false);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (loading) return <div style={{ color: '#888', fontSize: 16 }}>Loading notes...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h4 style={{ color: '#3576d3', marginBottom: 12 }}>My Notes</h4>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Write your notes here..."
        style={{ width: '100%', minHeight: 120, borderRadius: 8, border: '1.5px solid #e0e0e0', padding: '0.7rem', fontSize: '1em', marginBottom: 10 }}
        disabled={saving}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontWeight: 600, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving...' : 'Save Note'}
        </button>
        {saved && <span style={{ color: '#43a047', fontWeight: 600 }}>Saved!</span>}
        {error && <span style={{ color: '#e53935', fontWeight: 600 }}>{error}</span>}
      </div>
    </div>
  );
} 