import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import app from "../firebase";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();
  const db = getFirestore(app);

  if (user) {
    navigate("/");
    return null;
  }

  const handleRegister = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Create user in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      // Save user profile in Firestore
      await setDoc(doc(db, "users", uid), {
        uid,
        email,
        firstName,
        lastName,
        username,
        createdAt: Date.now()
      });
      navigate("/");
    } catch (err) {
      setError("Registration failed. " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleRegister} style={{ maxWidth: 400, margin: "0 auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(31,38,135,0.07)", padding: 32 }}>
        <h2 style={{ color: '#3576d3', fontWeight: 800, marginBottom: 24 }}>Register</h2>
        <input type="text" placeholder="First Name" value={firstName} onChange={e=>setFirstName(e.target.value)} required style={{ marginBottom: 12 }} />
        <input type="text" placeholder="Last Name" value={lastName} onChange={e=>setLastName(e.target.value)} required style={{ marginBottom: 12 }} />
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required style={{ marginBottom: 12 }} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required style={{ marginBottom: 18 }} />
        <button type="submit" disabled={loading} style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 8, padding: '0.9rem 2rem', fontWeight: 700, fontSize: 17, cursor: 'pointer', marginBottom: 12 }}>
          {loading ? "Registering..." : "Register"}
        </button>
        {error && <div className="error" style={{ marginBottom: 10 }}>{error}</div>}
        <p>Already have an account? <Link to="/login" style={{ color: '#3576d3', fontWeight: 600 }}>Login</Link></p>
      </form>
    </div>
  );
}
