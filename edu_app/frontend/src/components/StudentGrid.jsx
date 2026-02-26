/**
 * StudentGrid - Lưới hiển thị các thẻ học sinh
 */
import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import StudentCard from './StudentCard';

export default function StudentGrid({ students, loading, onStudentClick, onPointsChange }) {
  // Tìm top 3 học sinh có điểm cao nhất
  const sortedByPoints = [...students].sort((a, b) => b.total_points - a.total_points);
  const top3Ids = sortedByPoints.slice(0, 3).map(s => s.id);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (students.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h6" color="text.secondary">
          Chưa có học sinh nào
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Nhấn "Thêm HS" hoặc "Import" để bắt đầu
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
          xl: 'repeat(5, 1fr)',
        },
        gap: 2,
        p: 2,
        pb: 10, // space for footer
        maxWidth: 1400,
        mx: 'auto',
      }}
    >
      {students.map(student => (
        <StudentCard
          key={student.id}
          student={student}
          isTopThree={top3Ids.includes(student.id)}
          onStudentClick={onStudentClick}
          onPointsChange={onPointsChange}
        />
      ))}
    </Box>
  );
}
