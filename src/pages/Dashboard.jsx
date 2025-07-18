import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { Link, useNavigate, useLocation, Routes, Route, useParams } from "react-router-dom";
import Modal from "../components/ui/Modal";
import GeneratedLearningPath from "../components/ui/GeneratedLearningPath";
import LessonView from "../components/Phase4/LessonView";
import { FaTrash } from "react-icons/fa";
import styles from "./Dashboard.module.css";
import { FaBars } from "react-icons/fa";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Assessments from './Assessments';
import Grades from './Grades';
import Purchases from './Purchases';

const SIDEBAR_ITEMS = [
  { label: "Home", icon: "🏠", path: "/" },
  { label: "Courses", icon: "📚", path: "/dashboard/courses" },
  { label: "Assessments", icon: "📝", path: "/dashboard/assessments" },
  { label: "Badges", icon: "🎖️", path: "/dashboard/badges" },
  { label: "Purchases", icon: "💳", path: "/dashboard/purchases" },
];

function CoursesList({ courses, loading, user, refreshCourses }) {
  const navigate = useNavigate();
  const [recommended, setRecommended] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleting, setDeleting] = useState({});

  useEffect(() => {
    // Load recommended paths from localStorage
    const rec = localStorage.getItem(`recommendedPaths_${user?.uid || "demoUser"}`);
    if (rec) {
      let recArr = JSON.parse(rec);
      // Filter out already enrolled courses by title
      const enrolledTitles = courses.map(c => c.title);
      recArr = recArr.filter(lp => !enrolledTitles.includes(lp.title));
      setRecommended(recArr.slice(0, 4)); // Show up to 4 cards
    } else {
      setRecommended([]);
    }
  }, [user, courses]);

  // Modal enrollment handler
  const handleEnroll = async (learningPath) => {
    try {
      await fetch("/api/enroll-learning-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid || "demoUser", learningPath })
      });
      setShowModal(false);
      setSelectedCard(null);
      refreshCourses();
    } catch (err) {
      alert("Failed to enroll in this learning path.");
    }
  };

  const handleDelete = async (e, course) => {
    e.stopPropagation();
    setDeleting(prev => ({ ...prev, [course.title]: true }));
    try {
      await fetch("/api/delete-enrollment", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.uid || "demoUser", courseTitle: course.title })
      });
      refreshCourses();
    } catch (err) {
      alert("Failed to unenroll from this course.");
    } finally {
      setDeleting(prev => ({ ...prev, [course.title]: false }));
    }
  };

  return (
    <div>
      <h2 style={{ fontWeight: 800, fontSize: 28, color: "#3576d3", marginBottom: 18 }}>Enrolled Courses</h2>
      {loading ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 32 }}>
          {[...Array(3)].map((_, idx) => (
            <div key={idx} style={{ minWidth: 340, flex: 1, background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(31,38,135,0.07)', padding: '1.5rem', marginBottom: 12 }}>
              <Skeleton height={28} width={180} style={{ marginBottom: 10 }} />
              <Skeleton height={18} width={220} style={{ marginBottom: 10 }} />
              <Skeleton height={14} width={120} style={{ marginBottom: 10 }} />
              <Skeleton height={14} width={'100%'} style={{ marginBottom: 10 }} />
              <Skeleton height={18} width={80} />
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div style={{ color: "#888", fontSize: 18 }}>You are not enrolled in any courses yet.</div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32, marginBottom: 32 }}>
          {courses.map((course, idx) => {
            // Progress and grade sync from localStorage
            let progress = 0;
            let completed = false;
            let grade = null;
            try {
              const saved = localStorage.getItem(`completedTopics_${encodeURIComponent(course.title)}`);
              if (saved) {
                const { progress: prog } = JSON.parse(saved);
                progress = prog || 0;
                completed = progress === 100;
              }
              const scores = JSON.parse(localStorage.getItem(`scores_${encodeURIComponent(course.title)}`) || '{}');
              if (scores.final !== undefined) {
                // Count total questions in final project (assume 5 for demo)
                const total = scores.finalTotal || 5;
                grade = `${scores.final} / ${total}`;
              } else if (Object.keys(scores).length > 0) {
                // Show average of module assessments
                const vals = Object.values(scores).filter(v => typeof v === 'number');
                if (vals.length > 0) {
                  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
                  grade = `Avg: ${avg.toFixed(1)}`;
                }
              }
            } catch {}
            return (
              <div
                key={course.title || idx}
                style={{
                  minWidth: 340,
                  flex: 1,
                  cursor: 'pointer',
                  background: '#fff',
                  borderRadius: 14,
                  boxShadow: '0 2px 12px rgba(31,38,135,0.07)',
                  padding: '1.5rem',
                  marginBottom: 12,
                  position: 'relative',
                  transition: 'box-shadow 0.18s, transform 0.18s',
                  border: '2px solid transparent',
                  outline: 'none',
                  userSelect: 'none',
                }}
                onClick={e => {
                  if (e.target.closest('.delete-btn')) return;
                  navigate(`/lesson?course=${encodeURIComponent(course.title)}`);
                }}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    navigate(`/lesson?course=${encodeURIComponent(course.title)}`);
                  }
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                {/* Delete button */}
                <button
                  className="delete-btn"
                  style={{
                    position: 'absolute',
                    width: 35,
                    top: 10,
                    right: 10,
                    background: 'none',
                    border: 'none',
                    cursor: deleting[course.title] ? 'not-allowed' : 'pointer',
                    zIndex: 2,
                    color: ' #4f8cff',
                    fontSize: 22,
                    padding: 4,
                    opacity: deleting[course.title] ? 0.5 : 1,
                    boxShadow: 'none',
                    outline: 'none',
                  }}
                  title="Unenroll from this course"
                  onClick={e => handleDelete(e, course)}
                  disabled={deleting[course.title]}
                  tabIndex={0}
                  aria-label={`Unenroll from ${course.title}`}
                >
                  {deleting[course.title] ? (
                    <span style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid #e0e0e0', borderTop: '2px solid #e53935', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <FaTrash />
                  )}
                </button>
                <div style={{ fontWeight: 700, fontSize: 20, color: "#222", marginBottom: 6 }}>{course.title}</div>
                <div style={{ color: "#3576d3", fontWeight: 600, fontSize: 15, marginBottom: 10 }}>{course.description}</div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#888' }}>Progress: {progress}%</div>
                    {completed && <span style={{ background: '#43a047', color: '#fff', borderRadius: 8, padding: '0.2rem 0.7rem', fontWeight: 700, fontSize: 13, marginLeft: 6 }}>Completed</span>}
                  </div>
                  <div style={{ background: '#e0e0e0', borderRadius: 8, height: 14, width: '100%', overflow: 'hidden', marginTop: 4 }}>
                    <div style={{ background: 'linear-gradient(90deg, #4f8cff 0%, #6be7ff 100%)', height: '100%', borderRadius: 8, width: `${progress}%`, transition: 'width 0.5s' }} />
                  </div>
                </div>
                <div style={{ color: '#3576d3', fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
                  {grade ? `Grade: ${grade}` : (completed ? 'No grade yet' : 'In Progress')}
                </div>
                <div style={{ color: '#888', fontSize: 14 }}>Click to view lessons</div>
                <button
                  style={{
                    background: '#ffb300',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.6rem 1.2rem',
                    fontWeight: 600,
                    fontSize: 15,
                    marginTop: 10,
                    cursor: 'pointer',
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    navigate(`/dashboard/purchases?course=${encodeURIComponent(course.title)}`);
                  }}
                >
                  Purchase
                </button>
              </div>
            );
          })}
        </div>
      )}
      {/* Recommended Actions Section */}
      {recommended.length > 0 && (
        <div>
          <h3 style={{ fontWeight: 800, fontSize: 22, color: "#3576d3", marginBottom: 14 }}>Next Recommended Actions</h3>
          <div style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 28,
            marginTop: 8,
            marginBottom: 32
          }}>
            {recommended.map((card, idx) => (
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
                onClick={() => { setSelectedCard(idx); setShowModal(true); setFormData({ timeline: card.timeline, level: card.level, specializations: card.specializations }); }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ width: '100%', height: 120, borderRadius: 12, overflow: 'hidden', marginBottom: 18, background: '#e3eefe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={'/logo192.png'} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, color: '#222' }}>{card.title}</div>
                <div style={{ color: '#3576d3', fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{card.description}</div>
                <div style={{ color: '#888', fontSize: 15, marginTop: 'auto' }}>Timeline: {card.timeline} months · Level: {card.level}</div>
              </div>
            ))}
          </div>
          <Modal open={showModal} onClose={() => { setShowModal(false); setSelectedCard(null); }}>
            {recommended.length > 0 && selectedCard !== null && (
              <GeneratedLearningPath
                result={recommended[selectedCard]}
                formData={formData}
                userId={user?.uid || "demoUser"}
                onStartLearning={() => handleEnroll(recommended[selectedCard])}
              />
            )}
          </Modal>
        </div>
      )}
    </div>
  );
}

function RecommendedLearningPathModal({ result, formData, onStartLearning, userId }) {
  // Reuse the modal logic from Home.jsx (copy the relevant code for curriculum, assessment, resources, etc.)
  // For brevity, only show title, description, and Start Learning button here
  return (
    <div style={{ minWidth: 400, padding: 24 }}>
      <div style={{ fontWeight: 800, fontSize: 28, color: "#3576d3", marginBottom: 10 }}>{result.title}</div>
      <div style={{ color: "#444", fontSize: 17, marginBottom: 18 }}>{result.description}</div>
      <button
        style={{
          background: "#4f8cff",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "0.7rem 1.5rem",
          fontWeight: 600,
          cursor: "pointer",
          fontSize: 18
        }}
        onClick={onStartLearning}
      >
        Start Learning
      </button>
    </div>
  );
}

function CourseLessonView({ courses }) {
  const { user } = useUser();
  const { courseId } = useParams();
  const decodedTitle = decodeURIComponent(courseId);
  const course = courses.find(c => c.title === decodedTitle);
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loadingLesson, setLoadingLesson] = useState(false);

  useEffect(() => {
    // Load progress from localStorage (for demo)
    const saved = localStorage.getItem(`progress_${courseId}`);
    if (saved) {
      const { progress, completedLessons } = JSON.parse(saved);
      setProgress(progress);
      setCompletedLessons(completedLessons);
    }
  }, [courseId]);

  if (!course) return <div>Course not found.</div>;

  // Fix: modules rendering
  const modules = Object.entries(course.curriculum || {});

  // Helper to transform AI content to lesson object for LessonView
  const aiToLessonObject = (weekKey, lessonTitle, aiContent) => {
    let intro = typeof aiContent === 'string' ? aiContent : aiContent?.intro || '';
    let points = [];
    let advancedTips = [];
    if (typeof aiContent === 'object' && aiContent) {
      points = aiContent.points || [];
      advancedTips = aiContent.advancedTips || [];
    } else {
      points = intro.split('. ').map((t, i) => ({ text: t, tooltip: '' }));
    }
    return {
      title: lessonTitle,
      intro,
      points,
      advancedTips
    };
  };

  const handleViewLesson = async (weekKey, lessonTitle) => {
    setLoadingLesson(true);
    setShowLessonModal(true);
    setSelectedLesson(null);
    try {
      const res = await fetch("http://localhost:5000/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: course.title,
          timeline: course.timeline,
          level: course.level,
          userId: user?.uid || "demoUser"
        })
      });
      const data = await res.json();
      const aiContent = data.content[weekKey];
      setSelectedLesson(aiToLessonObject(weekKey, lessonTitle, aiContent));
    } catch (err) {
      setSelectedLesson({
        title: lessonTitle,
        intro: `Welcome to ${lessonTitle}! (AI content unavailable)`,
        points: [
          { text: `Main concept of ${lessonTitle}`, tooltip: `More about ${lessonTitle}` },
          { text: `Practical example for ${lessonTitle}`, tooltip: `Example details for ${lessonTitle}` }
        ],
        advancedTips: [
          `Advanced tip 1 for ${lessonTitle}`,
          `Advanced tip 2 for ${lessonTitle}`
        ]
      });
    } finally {
      setLoadingLesson(false);
    }
  };

  const handleCompleteLesson = (weekKey) => {
    if (!completedLessons.includes(weekKey)) {
      const updated = [...completedLessons, weekKey];
      setCompletedLessons(updated);
      const prog = Math.round((updated.length / modules.length) * 100);
      setProgress(prog);
      localStorage.setItem(`progress_${courseId}`, JSON.stringify({ progress: prog, completedLessons: updated }));
    }
  };

  return (
    <div>
      <h2 style={{ fontWeight: 800, fontSize: 28, color: "#3576d3", marginBottom: 18 }}>{course.title} - Lessons</h2>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 600, fontSize: 18 }}>Progress: {progress}%</div>
        <div style={{ background: '#e0e0e0', borderRadius: 8, height: 18, width: '100%', overflow: 'hidden', marginTop: 6 }}>
          <div style={{ background: 'linear-gradient(90deg, #4f8cff 0%, #6be7ff 100%)', height: '100%', borderRadius: 8, width: `${progress}%`, transition: 'width 0.5s' }} />
        </div>
        {/* Congratulatory message when progress is 100% */}
        {progress === 100 && (
          <div style={{
            background: 'linear-gradient(90deg, #e3eefe 0%, #d1f7c4 100%)',
            borderRadius: 10,
            boxShadow: '0 2px 8px rgba(31,38,135,0.08)',
            padding: '0.9rem 1.2rem',
            marginTop: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            border: '2px solid #43a047',
            fontWeight: 600,
            color: '#3576d3',
            fontSize: 16
          }}>
            🎉 Congratulations! You have completed this learning path.
          </div>
        )}
      </div>
      <div>
        {modules.map(([week, module], idx) => {
          // Fix: handle {header, lessons} object, array, or string
          let header = '';
          let lessons = [];
          if (typeof module === 'object' && module !== null && module.header && Array.isArray(module.lessons)) {
            header = module.header;
            lessons = module.lessons;
          } else if (Array.isArray(module)) {
            header = `Module: ${module[0]}`;
            lessons = module;
          } else {
            header = typeof module === 'string' ? module : `Module ${idx + 1}`;
            lessons = [typeof module === 'string' ? module : JSON.stringify(module)];
          }
          return (
            <div key={week} style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 6px rgba(31,38,135,0.06)', marginBottom: 16, padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{header}</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {lessons.map((lesson, tIdx) => (
                    <li key={tIdx} style={{ color: '#222', fontSize: 15, marginBottom: 4 }}>{lesson}</li>
                  ))}
                </ul>
                <div style={{ color: '#888', fontSize: 15 }}>Week {idx + 1}</div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  style={{
                    background: '#4f8cff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.7rem 1.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginRight: 8
                  }}
                  onClick={() => handleViewLesson(week, lessons[0])}
                >
                  View Lesson
                </button>
                <button
                  style={{
                    background: completedLessons.includes(week) ? '#43a047' : '#4f8cff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.7rem 1.5rem',
                    fontWeight: 600,
                    cursor: completedLessons.includes(week) ? 'default' : 'pointer',
                    opacity: completedLessons.includes(week) ? 0.7 : 1
                  }}
                  disabled={completedLessons.includes(week)}
                  onClick={() => handleCompleteLesson(week)}
                >
                  {completedLessons.includes(week) ? 'Completed' : 'Mark as Complete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <Modal open={showLessonModal} onClose={() => setShowLessonModal(false)}>
        {loadingLesson && <div style={{ padding: 40, textAlign: 'center' }}><div style={{ width: 50, height: 50, border: '5px solid #e0e0e0', borderTop: '5px solid #3576d3', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div>}
        {selectedLesson && <LessonView lesson={selectedLesson} />}
      </Modal>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const refreshCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/my-courses?userId=${user?.uid || "demoUser"}`);
      const data = await res.json();
      setCourses(data.enrollments || []);
    } catch (err) {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) refreshCourses();
    // eslint-disable-next-line
  }, [user]);

  return (
    <div className={styles.dashboardContainer}>
      {/* Hamburger menu for small screens */}
      <button
        className={styles.hamburger}
        onClick={() => setSidebarOpen((open) => !open)}
        aria-label="Toggle sidebar"
        style={{ display: window.innerWidth < 768 ? 'block' : 'none' }}
      >
        <FaBars />
      </button>
      {/* Sidebar */}
      <aside
        className={styles.sidebar + (sidebarOpen ? ' ' + styles.open : ' ' + styles.closed)}
        tabIndex={-1}
        aria-hidden={!sidebarOpen}
      >
        <div className={styles.sidebarTitle}>Dashboard</div>
        {SIDEBAR_ITEMS.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={styles.sidebarItem + (((item.path === "/" && location.pathname === "/") || (item.path !== "/" && location.pathname.startsWith(item.path))) ? ' ' + styles.active : '')}
            onClick={e => {
              if (item.path === "/") {
                e.preventDefault();
                navigate("/");
              }
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
          >
            <span className={styles.sidebarIcon}>{item.icon}</span> {item.label}
          </Link>
        ))}
      </aside>
      {/* Main Content with nested routes */}
      <main className={styles.mainContent}>
        <Routes>
          <Route path="/dashboard/courses" element={<CoursesList courses={courses} loading={loading} user={user} refreshCourses={refreshCourses} />} />
          <Route path="/dashboard/courses/:courseId" element={<CourseLessonView courses={courses} />} />
          <Route path="/dashboard/assessments" element={<Assessments />} />
          <Route path="/dashboard/badges" element={<Grades />} />
          <Route path="/dashboard/purchases" element={<Purchases />} />
          <Route path="*" element={<CoursesList courses={courses} loading={loading} user={user} refreshCourses={refreshCourses} />} />
        </Routes>
      </main>
    </div>
  );
}
