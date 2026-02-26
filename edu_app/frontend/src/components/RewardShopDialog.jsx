/**
 * RewardShopDialog - Cửa hàng quà (đổi điểm lấy quà)
 */
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Card, CardContent, Typography, Box, Chip, IconButton,
  Select, MenuItem, FormControl, InputLabel, Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StorefrontIcon from '@mui/icons-material/Storefront';
import toast from 'react-hot-toast';
import * as api from '../api';

export default function RewardShopDialog({ open, onClose, classroomId, students, onRedeemed }) {
  const [rewards, setRewards] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null);

  useEffect(() => {
    if (open && classroomId) {
      loadRewards();
    }
  }, [open, classroomId]);

  const loadRewards = async () => {
    try {
      const res = await api.getRewards(classroomId);
      setRewards(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRedeem = async (reward) => {
    if (!selectedStudent) {
      toast.error('Vui lòng chọn học sinh trước');
      return;
    }
    setConfirmDialog(reward);
  };

  const confirmRedeem = async () => {
    try {
      const res = await api.redeemReward(selectedStudent, confirmDialog.id);
      toast.success(`✅ ${res.data.message}`);
      setConfirmDialog(null);
      onRedeemed();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Lỗi đổi quà');
    }
  };

  const currentStudent = students.find(s => s.id === selectedStudent);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StorefrontIcon color="secondary" />
          <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
            Cửa Hàng Quà
          </Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          {/* Chọn học sinh */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Chọn học sinh để đổi quà</InputLabel>
            <Select
              value={selectedStudent}
              label="Chọn học sinh để đổi quà"
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              {students.map(s => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name} ({s.total_points} điểm)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {currentStudent && (
            <Chip
              label={`${currentStudent.name}: ${currentStudent.total_points} điểm`}
              color="primary"
              sx={{ mb: 2, fontWeight: 600 }}
            />
          )}

          {/* Grid quà */}
          <Grid container spacing={2}>
            {rewards.map(reward => {
              const canAfford = currentStudent &&
                currentStudent.total_points >= reward.points_required;
              return (
                <Grid item xs={12} sm={6} md={4} key={reward.id}>
                  <Card
                    sx={{
                      opacity: canAfford ? 1 : 0.6,
                      borderLeft: `4px solid ${canAfford ? '#6750A4' : '#E0E0E0'}`,
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ mb: 1 }}>
                        {reward.icon}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {reward.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: 40 }}>
                        {reward.description}
                      </Typography>
                      <Chip
                        label={`${reward.points_required} điểm`}
                        color={canAfford ? 'primary' : 'default'}
                        sx={{ mb: 1, fontWeight: 700 }}
                      />
                      <Box>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={!canAfford || !selectedStudent}
                          onClick={() => handleRedeem(reward)}
                          sx={{ mt: 1 }}
                        >
                          Đổi ngay
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
            {rewards.length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Chưa có phần thưởng nào
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận đổi quà */}
      <Dialog
        open={!!confirmDialog}
        onClose={() => setConfirmDialog(null)}
        maxWidth="xs"
      >
        <DialogTitle>Xác nhận đổi quà</DialogTitle>
        <DialogContent>
          <Typography>
            Đổi <strong>{confirmDialog?.name}</strong> cho{' '}
            <strong>{currentStudent?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Sẽ trừ {confirmDialog?.points_required} điểm.
            Còn lại: {currentStudent
              ? currentStudent.total_points - (confirmDialog?.points_required || 0)
              : 0} điểm
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(null)}>Hủy</Button>
          <Button variant="contained" onClick={confirmRedeem}>Xác nhận</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
