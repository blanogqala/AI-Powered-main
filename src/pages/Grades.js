import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Skeleton from 'react-loading-skeleton';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

async function fetchGrades() {
  const res = await fetch('/api/grades');
  if (!res.ok) throw new Error('Failed to load grades');
  return res.json();
}

const GradeRow = React.memo(function GradeRow({ grade }) {
  return (
    <motion.tr
      whileHover={{ scale: 1.01, backgroundColor: '#f8faff' }}
      transition={{ duration: 0.2 }}
    >
      <td style={{ padding: '0.7rem 1rem', fontWeight: 600 }}>{grade.assessmentName}</td>
      <td style={{ padding: '0.7rem 1rem' }}>{grade.score}</td>
      <td style={{ padding: '0.7rem 1rem' }}>{grade.date ? new Date(grade.date).toLocaleDateString() : 'N/A'}</td>
      <td style={{ padding: '0.7rem 1rem' }}>{grade.remarks || '-'}</td>
    </motion.tr>
  );
});

export default function Grades() {
  const [filter, setFilter] = useState('');
  const { data, isLoading, isError, refetch, error } = useQuery(['grades'], fetchGrades);

  // Calculate average score
  const avg = data && data.length > 0 ? (data.reduce((a, b) => a + (parseFloat(b.score) || 0), 0) / data.length).toFixed(1) : 0;
  const filtered = data && filter ? data.filter(g => g.assessmentName.toLowerCase().includes(filter.toLowerCase())) : data;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <h2 style={{ fontWeight: 800, fontSize: 28, color: '#3576d3', marginBottom: 18 }}>Grades</h2>
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
        <input
          type="text"
          placeholder="Filter by assessment name..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 16 }}
        />
        <div style={{ flex: 1 }} />
        <div style={{ fontWeight: 600, color: '#3576d3' }}>Average Score:</div>
        <div style={{ width: 120, background: '#e0e0e0', borderRadius: 8, height: 18, overflow: 'hidden', marginLeft: 8 }}>
          <div style={{ background: 'linear-gradient(90deg, #4f8cff 0%, #6be7ff 100%)', height: '100%', borderRadius: 8, width: `${avg}%`, transition: 'width 0.5s' }} />
        </div>
        <span style={{ marginLeft: 8, fontWeight: 700 }}>{avg}</span>
      </div>
      {isLoading ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(31,38,135,0.07)' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.7rem 1rem', textAlign: 'left' }}>Assessment</th>
              <th style={{ padding: '0.7rem 1rem', textAlign: 'left' }}>Score</th>
              <th style={{ padding: '0.7rem 1rem', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '0.7rem 1rem', textAlign: 'left' }}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(3)].map((_, idx) => (
              <tr key={idx}>
                <td><Skeleton height={18} width={120} /></td>
                <td><Skeleton height={18} width={60} /></td>
                <td><Skeleton height={18} width={80} /></td>
                <td><Skeleton height={18} width={100} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : isError ? (
        <div style={{ color: '#d32f2f', marginBottom: 16 }}>
          <p>{error.message}</p>
          <button onClick={() => { refetch(); toast.info('Retrying...'); }}>Retry</button>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(31,38,135,0.07)' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.7rem 1rem', textAlign: 'left' }}>Assessment</th>
              <th style={{ padding: '0.7rem 1rem', textAlign: 'left' }}>Score</th>
              <th style={{ padding: '0.7rem 1rem', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '0.7rem 1rem', textAlign: 'left' }}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filtered && filtered.length > 0 ? filtered.map(grade => (
              <GradeRow key={grade.id} grade={grade} />
            )) : (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: '#888', padding: 24 }}>No grades found.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
} 