import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Purchases() {
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const query = useQuery();
  const selectedCourse = query.get("course");

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      try {
        const res = await fetch(`/api/my-courses?userId=${user?.uid || "demoUser"}`);
        const data = await res.json();
        setCourses(data.enrollments || []);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchCourses();
  }, [user]);

  // Mock purchase options
  function getPurchases(course) {
    return [
      { name: `Certificate for ${course.title}`, price: "$19.99", description: `Official certificate for completing ${course.title}` },
      { name: `Advanced Project Pack for ${course.title}`, price: "$9.99", description: `Extra projects and challenges for ${course.title}` },
    ];
  }

  const displayCourses = selectedCourse
    ? courses.filter(c => c.title === selectedCourse)
    : courses;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontWeight: 800, fontSize: '2.2rem', color: '#3576d3', marginBottom: 24 }}>
        Purchases
      </h1>
      {loading ? (
        <div style={{ color: '#888', fontSize: 18 }}>Loading purchases...</div>
      ) : displayCourses.length === 0 ? (
        <div style={{ color: '#888', fontSize: 18 }}>No courses found for purchases.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {displayCourses.map((course, idx) => (
            <div key={course.title || idx} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(31,38,135,0.07)', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ fontWeight: 700, fontSize: 22, color: '#3576d3', marginBottom: 8 }}>{course.title}</div>
              <div style={{ color: '#444', fontSize: 16, marginBottom: 10 }}>{course.description}</div>
              <div style={{ marginTop: 10, width: '100%' }}>
                {getPurchases(course).map((p, i) => (
                  <div key={i} style={{ background: '#e3eefe', borderRadius: 8, padding: '1rem', marginBottom: 10 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{p.name}</div>
                    <div style={{ color: '#3576d3', fontWeight: 500 }}>{p.price}</div>
                    <div style={{ color: '#444', fontSize: 14, marginBottom: 6 }}>{p.description}</div>
                    <button style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                      Purchase
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 