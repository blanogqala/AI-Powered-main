import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LessonView from "../components/Phase4/LessonView";
import { useUser } from "../context/UserContext";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Helper to generate subtopics/lessons from module object
function getSubtopics(module) {
  if (module && typeof module === "object" && Array.isArray(module.lessons)) {
    return module.lessons;
  }
  if (typeof module === "string" && module.includes(",")) {
    return module.split(",").map(s => s.trim());
  }
  if (typeof module === "string") {
    return [
      `${module} - Basics`,
      `${module} - Applications`,
      `${module} - Advanced Concepts`
    ];
  }
  return [];
}

export default function Lesson() {
  const { user } = useUser();
  const query = useQuery();
  const courseTitle = query.get("course");
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState({ moduleIdx: 0, subIdx: 0 });
  const [lessonContent, setLessonContent] = useState(null);
  const [completedTopics, setCompletedTopics] = useState([]); // [{moduleIdx, subIdx}]
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      try {
        const res = await fetch(`/api/my-courses?userId=${user?.uid || "demoUser"}`);
        const data = await res.json();
        const found = (data.enrollments || []).find(c => c.title === courseTitle);
        setCourse(found || null);
        // Load completed topics from localStorage
        const saved = localStorage.getItem(`completedTopics_${encodeURIComponent(courseTitle)}`);
        if (saved) {
          const { completedTopics, progress } = JSON.parse(saved);
          setCompletedTopics(completedTopics);
          setProgress(progress);
        }
      } catch {
        setCourse(null);
      } finally {
        setLoading(false);
      }
    }
    if (courseTitle) fetchCourse();
  }, [courseTitle, user]);

  // Fetch lesson content, quiz, and project for selected subtopic
  useEffect(() => {
    async function fetchLesson() {
      if (!course) return;
      const modules = Object.entries(course.curriculum || {});
      const [modKey, modObj] = modules[selectedSubtopic.moduleIdx];
      const subtopics = getSubtopics(modObj);
      const subtopic = subtopics[selectedSubtopic.subIdx];
      setLessonContent(null);
      // Add logging for debugging
      const payload = {
        userId: user?.uid || "demoUser",
        courseTitle: course.title,
        moduleTitle: modObj.header || modKey,
        subtopic,
        level: course.level || "Beginner",
        timeline: course.timeline || 3
      };
      console.log("[DEBUG] /api/generate-lesson payload:", payload);
      try {
        const res = await fetch("/api/generate-lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        setLessonContent(data); // { lesson, quiz, project }
      } catch {
        setLessonContent({
          lesson: {
            title: subtopic,
            objectives: [
              `Understand the basics of ${subtopic}`,
              `Apply ${subtopic} in practice`
            ],
            body: `Welcome to ${subtopic}! (AI content unavailable)`,
            summary: `Key takeaways for ${subtopic}`
          },
          quiz: [],
          project: null
        });
      }
    }
    if (course) fetchLesson();
  }, [course, selectedSubtopic, user]);

  // Update progress when completedTopics changes
  useEffect(() => {
    if (!course) return;
    const modules = Object.entries(course.curriculum || {});
    let totalTopics = 0;
    modules.forEach(([_, modObj]) => {
      totalTopics += getSubtopics(modObj).length;
    });
    const prog = totalTopics > 0 ? Math.round((completedTopics.length / totalTopics) * 100) : 0;
    setProgress(prog);
    localStorage.setItem(`completedTopics_${encodeURIComponent(courseTitle)}`, JSON.stringify({ completedTopics, progress: prog }));
  }, [completedTopics, course, courseTitle]);

  // Save badge to backend when course is completed
  useEffect(() => {
    if (progress === 100 && course) {
      // Try to save badge to backend
      const saveBadge = async () => {
        try {
          await fetch('/api/complete-course', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user?.uid || 'demoUser',
              course: {
                title: course.title,
                description: course.description,
                level: course.level,
                timeline: course.timeline,
                completedAt: Date.now(),
              }
            })
          });
        } catch {
          // Fallback: save to localStorage
          localStorage.setItem(`badge_${encodeURIComponent(course.title)}`, JSON.stringify({ ...course, completedAt: Date.now() }));
        }
      };
      saveBadge();
    }
  }, [progress, course, user]);

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f8fb' }}>
      {/* Sidebar skeleton */}
      <aside style={{ width: 320, background: '#fff', boxShadow: '2px 0 12px rgba(31,38,135,0.06)', display: 'flex', flexDirection: 'column', padding: '2.5rem 1.2rem 1.2rem 1.2rem', gap: 18, minHeight: '100vh', position: 'sticky', top: 0 }}>
        <Skeleton height={28} width={180} style={{ marginBottom: 18 }} />
        <Skeleton height={14} width={120} style={{ marginBottom: 18 }} />
        {[...Array(3)].map((_, idx) => (
          <div key={idx} style={{ marginBottom: 12 }}>
            <Skeleton height={24} width={200} style={{ marginBottom: 8 }} />
            <Skeleton height={18} width={180} count={2} style={{ marginBottom: 4 }} />
          </div>
        ))}
      </aside>
      {/* Main content skeleton */}
      <main style={{ flex: 1, padding: '2.5rem 2.5rem 2.5rem 2rem', minHeight: '100vh', position: 'relative' }}>
        <Skeleton height={38} width={320} style={{ marginBottom: 24 }} />
        <Skeleton height={24} width={180} style={{ marginBottom: 18 }} />
        <Skeleton height={18} width={'80%'} count={6} style={{ marginBottom: 10 }} />
      </main>
    </div>
  );
  if (!course) return <div style={{ padding: 40, textAlign: 'center', color: '#d32f2f' }}>Course not found.</div>;

  const modules = Object.entries(course.curriculum || {});

  // Helper: is topic completed?
  const isTopicCompleted = (moduleIdx, subIdx) => completedTopics.some(t => t.moduleIdx === moduleIdx && t.subIdx === subIdx);
  // Helper: is module completed?
  const isModuleCompleted = (mIdx) => {
    const subtopics = getSubtopics(modules[mIdx][1]);
    return subtopics.every((_, sIdx) => isTopicCompleted(mIdx, sIdx));
  };
  // Helper: get current module/week
  const currentModuleIdx = selectedSubtopic.moduleIdx;

  // Handler: mark topic as complete and go to next
  const handleCompleteOrNext = () => {
    const { moduleIdx, subIdx } = selectedSubtopic;
    if (!isTopicCompleted(moduleIdx, subIdx)) {
      setCompletedTopics(prev => [...prev, { moduleIdx, subIdx }]);
    }
    // Go to next topic if exists
    const subtopics = getSubtopics(modules[moduleIdx][1]);
    if (subIdx + 1 < subtopics.length) {
      setSelectedSubtopic({ moduleIdx, subIdx: subIdx + 1 });
    } else if (moduleIdx + 1 < modules.length) {
      setExpandedModule(moduleIdx + 1);
      setSelectedSubtopic({ moduleIdx: moduleIdx + 1, subIdx: 0 });
    }
    // else: at end, do nothing
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f8fb' }}>
      {/* Timeline Navigation Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '2rem 0 1.2rem 0',
        background: '#fff',
        borderBottom: '1.5px solid #e0e0e0',
        position: 'sticky',
        top: 0,
        zIndex: 20
      }}>
        {modules.map(([modKey, modObj], mIdx) => {
          const completed = isModuleCompleted(mIdx);
          const isCurrent = mIdx === currentModuleIdx;
          const moduleDesc = modObj.description || '';
          return (
            <div key={modKey} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => {
                setExpandedModule(mIdx);
                setSelectedSubtopic({ moduleIdx: mIdx, subIdx: 0 });
              }}
              title={moduleDesc ? `Module ${mIdx + 1}: ${moduleDesc}` : `Module ${mIdx + 1}`}
            >
              <div style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: completed ? '#43a047' : (isCurrent ? '#4f8cff' : '#e0e0e0'),
                color: completed || isCurrent ? '#fff' : '#3576d3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 18,
                border: isCurrent ? '3px solid #3576d3' : 'none',
                boxShadow: isCurrent ? '0 0 0 2px #b3d1ff' : 'none',
                transition: 'background 0.2s, border 0.2s',
                marginBottom: 4
              }}>
                {completed ? '✔' : mIdx + 1}
              </div>
              <div style={{ fontSize: 13, color: isCurrent ? '#3576d3' : '#888', fontWeight: isCurrent ? 700 : 500, maxWidth: 80, textAlign: 'center' }}>
                Week {mIdx + 1}
              </div>
            </div>
          );
        })}
      </div>
      {/* Main content split: sidebar + lesson */}
      <div style={{ display: 'flex' }}>
        {/* Sidebar navigation for modules and subtopics */}
        <aside style={{
          width: 340,
          background: '#fff',
          boxShadow: '2px 0 12px rgba(31,38,135,0.06)',
          display: 'flex',
          flexDirection: 'column',
          padding: '2.5rem 1.2rem 1.2rem 1.2rem',
          gap: 18,
          minHeight: '100vh',
          position: 'sticky',
          top: 0
        }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: '#3576d3', marginBottom: 18, letterSpacing: 1 }}>
            {course.title}
          </div>
          {/* Progress Bar */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ color: '#888', fontSize: 15, marginBottom: 4 }}>Progress: {progress}%</div>
            <div style={{ background: '#e0e0e0', borderRadius: 8, height: 14, width: '100%', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(90deg, #4f8cff 0%, #6be7ff 100%)', height: '100%', borderRadius: 8, width: `${progress}%`, transition: 'width 0.5s' }} />
            </div>
          </div>
          {/* Congratulatory Card/Button when progress is 100% */}
          {progress === 100 && (
            <div style={{
              background: 'linear-gradient(90deg, #e3eefe 0%, #d1f7c4 100%)',
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(31,38,135,0.08)',
              padding: '1.2rem 1.5rem',
              marginBottom: 18,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              animation: 'fadeIn 0.7s',
              border: '2px solid #43a047',
            }}>
              <div style={{ fontSize: 28, color: '#43a047', fontWeight: 900, marginBottom: 4 }}>🎉</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#3576d3', textAlign: 'center' }}>
                Congratulations!<br />You have completed the learning course!
              </div>
              <div style={{ color: '#444', fontSize: 15, textAlign: 'center', marginBottom: 4 }}>
                You’ve finished all lessons and assessments. You can now view your badge or certificate of completion.
              </div>
              <button
                style={{
                  background: 'linear-gradient(90deg, #43a047 0%, #4f8cff 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.6rem 1.3rem',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  marginTop: 4,
                  boxShadow: '0 1px 4px rgba(31,38,135,0.08)',
                  opacity: 1
                }}
                aria-label="View your badge or certificate"
                onClick={() => navigate('/dashboard/badges')}
              >
                🏅 View Your Badge
              </button>
              <button
                style={{
                  background: '#ffb300',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.6rem 1.3rem',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  marginTop: 8,
                  boxShadow: '0 1px 4px rgba(31,38,135,0.08)',
                  opacity: 1
                }}
                aria-label="Go to purchases"
                onClick={() => navigate(`/dashboard/purchases?course=${encodeURIComponent(course.title)}`)}
              >
                💳 Purchase
              </button>
              <span style={{ color: '#888', fontSize: 13, marginTop: 2 }}>
                Want to see your achievement? Click above to view your badge or certificate.
              </span>
            </div>
          )}
          {/* Modules and subtopics with timeline and descriptions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {modules.map(([modKey, modObj], mIdx) => {
              const subtopics = getSubtopics(modObj);
              const expanded = expandedModule === mIdx;
              const moduleDesc = modObj.description || '';
              return (
                <div key={modKey} style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: 8, marginBottom: 8 }}>
                  <button
                    style={{
                      background: expanded ? '#e3eefe' : 'none',
                      color: expanded ? '#3576d3' : '#222',
                      border: 'none',
                      borderRadius: 8,
                      padding: '0.8rem 1.2rem',
                      fontWeight: 700,
                      fontSize: 16,
                      textAlign: 'left',
                      cursor: 'pointer',
                      outline: 'none',
                      width: '100%',
                      marginBottom: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onClick={() => setExpandedModule(expanded ? null : mIdx)}
                    aria-expanded={expanded}
                  >
                    <span>
                      Module {mIdx + 1}: {modObj.header || modKey}
                    </span>
                    <span style={{ fontWeight: 400, fontSize: 18 }}>{expanded ? '▲' : '▼'}</span>
                  </button>
                  {/* Module description and timeline info */}
                  <div style={{ color: '#3576d3', fontSize: 14, margin: '4px 0 2px 0', fontWeight: 500 }}>{moduleDesc}</div>
                  <div style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>Week {mIdx + 1}: 10–15 hours/day × 7 days</div>
                  {expanded && (
                    <div style={{ marginLeft: 8, marginTop: 6, marginBottom: 8 }}>
                      {subtopics.map((sub, sIdx) => (
                        <button
                          key={sub}
                          style={{
                            display: 'block',
                            width: '100%',
                            background: (selectedSubtopic.moduleIdx === mIdx && selectedSubtopic.subIdx === sIdx) ? '#4f8cff' : '#f8faff',
                            color: (selectedSubtopic.moduleIdx === mIdx && selectedSubtopic.subIdx === sIdx) ? '#fff' : '#3576d3',
                            border: 'none',
                            borderRadius: 7,
                            padding: '0.6rem 1.1rem',
                            fontWeight: 500,
                            fontSize: 15,
                            textAlign: 'left',
                            marginBottom: 4,
                            cursor: 'pointer',
                            outline: 'none',
                            position: 'relative',
                          }}
                          onClick={() => {
                            setSelectedSubtopic({ moduleIdx: mIdx, subIdx: sIdx });
                            console.log('[DEBUG] Sidebar click: setSelectedSubtopic', { moduleIdx: mIdx, subIdx: sIdx });
                          }}
                        >
                          {sub}
                          {isTopicCompleted(mIdx, sIdx) && <span style={{ color: '#43a047', fontSize: 16, marginLeft: 8 }}>✔</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
        {/* Main lesson content area */}
        <main style={{ flex: 1, padding: '2.5rem 2.5rem 2.5rem 2rem', minHeight: '100vh', position: 'relative' }}>
          {/* Back to Dashboard Button */}
          <button
            style={{
              position: 'absolute',
              top: 24,
              right: 32,
              background: '#e3eefe',
              color: '#3576d3',
              border: 'none',
              borderRadius: 8,
              padding: '0.7rem 1.5rem',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              zIndex: 10
            }}
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(31,38,135,0.07)', padding: '2rem', marginBottom: 24, marginTop: 24 }}>
            {lessonContent && <LessonView lessonId={lessonContent.lesson?.title} userId={user?.uid || "demoUser"} lessonData={lessonContent.lesson} quizData={lessonContent.quiz} projectData={lessonContent.project} />}
            <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
              <button
                style={{
                  background: isTopicCompleted(selectedSubtopic.moduleIdx, selectedSubtopic.subIdx) ? '#43a047' : '#4f8cff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.7rem 1.5rem',
                  fontWeight: 600,
                  cursor: isTopicCompleted(selectedSubtopic.moduleIdx, selectedSubtopic.subIdx) ? 'default' : 'pointer',
                  opacity: isTopicCompleted(selectedSubtopic.moduleIdx, selectedSubtopic.subIdx) ? 0.7 : 1
                }}
                disabled={isTopicCompleted(selectedSubtopic.moduleIdx, selectedSubtopic.subIdx)}
                onClick={handleCompleteOrNext}
              >
                {isTopicCompleted(selectedSubtopic.moduleIdx, selectedSubtopic.subIdx) ? 'Completed' : 'Mark as Complete / Next Topic'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
