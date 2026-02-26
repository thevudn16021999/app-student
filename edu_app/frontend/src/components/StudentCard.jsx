/**
 * StudentCard - Thẻ học sinh với điểm, hạng, progress bar
 */
import React, { useState } from 'react';
import {
  Card, CardContent, Box, Typography, IconButton, Chip, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import StarIcon from '@mui/icons-material/Star';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import * as api from '../api';
import { RANKS, getRank, getRankProgress, generateDefaultAvatar } from '../utils';

// Nút thay đổi điểm
function PointButton({ label, value, variant, studentId, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const isNegative = value < 0;

  const handleClick = () => {
    if (isNegative) {
      // Trừ điểm: bắt buộc nhập lý do
      setOpen(true);
    } else {
      // Cộng điểm: popup nhỏ nhập lý do (không bắt buộc)
      setOpen(true);
    }
  };

  const handleSubmit = async () => {
    if (isNegative && !reason.trim()) {
      toast.error('Trừ điểm phải nhập lý do!');
      return;
    }
    try {
      const res = await api.changePoints(studentId, value, reason);
      onSuccess(res.data.student, res.data.rank_changed, res.data.new_rank);
      setOpen(false);
      setReason('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Có lỗi xảy ra');
    }
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          border: `1.5px solid ${isNegative ? '#FF6D00' : '#6750A4'}`,
          borderRadius: 2,
          px: 1,
          py: 0.3,
          fontSize: 13,
          fontWeight: 700,
          color: isNegative ? '#FF6D00' : '#6750A4',
          '&:hover': {
            backgroundColor: isNegative ? '#FFF3E0' : '#F3EEFF',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.2s',
          minWidth: 0,
        }}
      >
        {label}
      </IconButton>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {isNegative ? `Trừ ${Math.abs(value)} điểm` : `Cộng ${value} điểm`}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={isNegative ? 'Lý do (bắt buộc)' : 'Lý do (tùy chọn)'}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            required={isNegative}
            sx={{ mt: 1 }}
            placeholder={
              isNegative
                ? 'VD: Nói chuyện trong giờ...'
                : 'VD: Phát biểu tốt...'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); setReason(''); }}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            color={isNegative ? 'secondary' : 'primary'}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// Animated point change float text
function FloatingPoints({ value, show }) {
  if (!show) return null;
  const isPositive = value > 0;
  return (
    <Typography
      sx={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 28,
        fontWeight: 800,
        color: isPositive ? '#6750A4' : '#FF6D00',
        animation: isPositive ? 'floatUp 1s ease-out forwards' : 'floatDown 1s ease-out forwards',
        pointerEvents: 'none',
        zIndex: 10,
        '@keyframes floatUp': {
          '0%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
          '100%': { opacity: 0, transform: 'translate(-50%, -150%) scale(1.5)' },
        },
        '@keyframes floatDown': {
          '0%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
          '100%': { opacity: 0, transform: 'translate(-50%, 50%) scale(0.5)' },
        },
      }}
    >
      {isPositive ? `+${value}` : value}
    </Typography>
  );
}

// Segmented Progress Bar
function SegmentedProgress({ percent }) {
  const segments = 10;
  const filled = Math.round((percent / 100) * segments);

  return (
    <Box sx={{ display: 'flex', gap: '2px', width: '100%', height: 6, my: 0.5 }}>
      {Array.from({ length: segments }, (_, i) => (
        <Box
          key={i}
          sx={{
            flex: 1,
            borderRadius: 1,
            backgroundColor: i < filled ? '#6750A4' : '#E0E0E0',
            opacity: i < filled ? 0.5 + (i / segments) * 0.5 : 0.3,
            transition: 'all 0.3s ease',
          }}
        />
      ))}
    </Box>
  );
}

export default function StudentCard({ student, isTopThree, onStudentClick, onPointsChange }) {
  const [floatingValue, setFloatingValue] = useState(null);
  const [showFloat, setShowFloat] = useState(false);

  const rank = getRank(student.total_points);
  const rankInfo = RANKS[rank];
  const progress = getRankProgress(student.total_points);
  const avatar = student.avatar || generateDefaultAvatar(student.name);

  const handlePointSuccess = (updatedStudent, rankChanged, newRank) => {
    const change = updatedStudent.total_points - student.total_points;
    // Hiệu ứng floating point
    setFloatingValue(change);
    setShowFloat(true);
    setTimeout(() => setShowFloat(false), 1000);

    // Nếu thăng hạng → confetti
    if (rankChanged && newRank) {
      const rankColors = {
        silver: ['#C0C0C0', '#E8E8E8'],
        gold: ['#FFD700', '#FFA500'],
        diamond: ['#B9F2FF', '#87CEEB', '#00BFFF'],
      };
      confetti({
        particleCount: 100,
        spread: 70,
        colors: rankColors[newRank] || ['#6750A4', '#D0BCFF'],
        origin: { y: 0.6 },
      });
      toast.success(
        `🎉 Chúc mừng ${updatedStudent.name} thăng hạng ${RANKS[newRank]?.name}! ${RANKS[newRank]?.icon}`,
        { duration: 4000 }
      );
    }

    onPointsChange(updatedStudent);
  };

  return (
    <Card
      sx={{
        position: 'relative',
        cursor: 'pointer',
        overflow: 'visible',
        borderTop: `3px solid ${rankInfo.color}`,
      }}
    >
      <FloatingPoints value={floatingValue} show={showFloat} />

      <CardContent
        onClick={() => onStudentClick(student)}
        sx={{ pb: '8px !important' }}
      >
        {/* Avatar + Badge */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
          <Box
            component="img"
            src={avatar}
            alt={student.name}
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              objectFit: 'cover',
              border: `2px solid ${rankInfo.color}`,
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {isTopThree && <StarIcon sx={{ fontSize: 16, color: '#FFD700' }} />}
              <Typography
                variant="subtitle2"
                fontWeight={700}
                noWrap
                sx={{ fontSize: 14 }}
              >
                {student.name}
              </Typography>
            </Box>
            <Chip
              label={`${rankInfo.icon} ${rankInfo.name}`}
              size="small"
              sx={{
                mt: 0.5,
                backgroundColor: `${rankInfo.color}22`,
                color: rank === 'diamond' ? '#0277BD' : rankInfo.color,
                fontWeight: 600,
                fontSize: 11,
                height: 22,
              }}
            />
          </Box>
        </Box>

        {/* Điểm + Progress */}
        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.3 }}>
          {student.total_points} điểm
        </Typography>
        <SegmentedProgress percent={progress.percent} />
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
          {progress.nextRankName
            ? `Còn ${progress.remaining} điểm → ${progress.nextRankName}`
            : '🏆 Hạng cao nhất!'}
        </Typography>
      </CardContent>

      {/* Nút cộng/trừ điểm */}
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          display: 'flex',
          gap: 0.5,
          px: 1.5,
          pb: 1.5,
          pt: 0.5,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {[1, 3, 10].map(v => (
          <PointButton
            key={v}
            label={`+${v}`}
            value={v}
            variant="add"
            studentId={student.id}
            onSuccess={handlePointSuccess}
          />
        ))}
        {[-1, -5].map(v => (
          <PointButton
            key={v}
            label={`${v}`}
            value={v}
            variant="sub"
            studentId={student.id}
            onSuccess={handlePointSuccess}
          />
        ))}
      </Box>
    </Card>
  );
}
