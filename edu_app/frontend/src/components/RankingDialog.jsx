/**
 * RankingDialog - Bảng xếp hạng Top 10
 */
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Table, TableHead, TableRow, TableCell, TableBody,
  Avatar, Chip, Typography, Box, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import * as api from '../api';
import { RANKS, generateDefaultAvatar } from '../utils';

const positionIcons = ['🥇', '🥈', '🥉'];

export default function RankingDialog({ open, onClose, classroomId }) {
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    if (open && classroomId) {
      loadRankings();
    }
  }, [open, classroomId]);

  const loadRankings = async () => {
    try {
      const res = await api.getRankings(classroomId);
      setRankings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <EmojiEventsIcon color="primary" />
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
          Bảng Xếp Hạng
        </Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Hạng</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Học sinh</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Điểm</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Danh hiệu</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rankings.map((entry, idx) => {
              const rankInfo = RANKS[entry.rank] || RANKS.bronze;
              return (
                <TableRow
                  key={entry.student_id}
                  sx={{
                    backgroundColor: idx < 3 ? `${rankInfo.color}11` : 'transparent',
                    '&:hover': { backgroundColor: '#F3EEFF' },
                  }}
                >
                  <TableCell>
                    <Typography variant="h6" sx={{ fontSize: idx < 3 ? 24 : 16 }}>
                      {idx < 3 ? positionIcons[idx] : entry.position}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={entry.avatar || generateDefaultAvatar(entry.name)}
                        sx={{ width: 36, height: 36, borderRadius: 1.5 }}
                        variant="rounded"
                      />
                      <Typography fontWeight={idx < 3 ? 700 : 400}>
                        {entry.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontWeight={700} color="primary">
                      {entry.total_points}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${rankInfo.icon} ${rankInfo.name}`}
                      size="small"
                      sx={{
                        backgroundColor: `${rankInfo.color}22`,
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {rankings.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary">Chưa có dữ liệu</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
