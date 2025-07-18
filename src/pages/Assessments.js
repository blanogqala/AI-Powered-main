import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Skeleton from 'react-loading-skeleton';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import AssessmentCard from '../components/AssessmentCard';

async function fetchAssessments() {
  const res = await fetch('/api/assessments');
  if (!res.ok) throw new Error('Failed to load data');
  return res.json();
}

export default function Assessments() {
  const { data, isLoading, isError, refetch, error } = useQuery(['assessments'], fetchAssessments);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <h2 style={{ fontWeight: 800, fontSize: 28, color: '#3576d3', marginBottom: 18 }}>Assessments</h2>
      {isLoading ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
          {[...Array(3)].map((_, idx) => (
            <div key={idx} style={{ minWidth: 340, flex: 1, background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(31,38,135,0.07)', padding: '1.5rem', marginBottom: 12 }}>
              <Skeleton height={28} width={180} style={{ marginBottom: 10 }} />
              <Skeleton height={18} width={220} style={{ marginBottom: 10 }} />
              <Skeleton height={14} width={120} style={{ marginBottom: 10 }} />
              <Skeleton height={18} width={80} />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div style={{ color: '#d32f2f', marginBottom: 16 }}>
          <p>{error.message}</p>
          <button onClick={() => { refetch(); toast.info('Retrying...'); }}>Retry</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
          {data && data.length > 0 ? data.map(assessment => (
            <motion.div key={assessment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <AssessmentCard assessment={assessment} />
            </motion.div>
          )) : <div>No assessments found.</div>}
        </div>
      )}
    </div>
  );
} 