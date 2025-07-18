import React from 'react';
import { motion } from 'framer-motion';

function AssessmentCard({ assessment }) {
  const { title, dueDate, status, score } = assessment;
  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
      style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 2px 12px rgba(31,38,135,0.07)',
        padding: '1.5rem',
        minWidth: 320,
        marginBottom: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 20, color: '#222' }}>{title}</div>
      <div style={{ color: '#3576d3', fontWeight: 600, fontSize: 15 }}>Due: {dueDate ? new Date(dueDate).toLocaleDateString() : 'N/A'}</div>
      <div style={{ color: status === 'completed' ? '#43a047' : '#888', fontWeight: 600, fontSize: 15 }}>
        {status === 'completed' ? `Completed${score ? ` · Score: ${score}` : ''}` : 'Not started'}
      </div>
      <button
        style={{
          background: status === 'completed' ? '#e3eefe' : '#4f8cff',
          color: status === 'completed' ? '#3576d3' : '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '0.7rem 1.5rem',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: 16,
          marginTop: 8,
        }}
        onClick={() => {/* TODO: handle start/review */}}
      >
        {status === 'completed' ? 'Review' : 'Start'}
      </button>
    </motion.div>
  );
}

export default React.memo(AssessmentCard); 