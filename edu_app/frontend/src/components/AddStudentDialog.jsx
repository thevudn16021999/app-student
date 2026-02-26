/**
 * AddStudentDialog - Dialog thêm học sinh mới
 */
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box
} from '@mui/material';
import toast from 'react-hot-toast';
import * as api from '../api';

export default function AddStudentDialog({ open, onClose, classroomId, onAdded }) {
  const [name, setName] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [points, setPoints] = useState('0');

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên học sinh');
      return;
    }
    try {
      await api.createStudent(classroomId, {
        name: name.trim(),
        order_number: parseInt(orderNumber) || 0,
        total_points: Math.max(0, parseInt(points) || 0),
      });
      toast.success(`✅ Đã thêm ${name.trim()}`);
      setName('');
      setOrderNumber('');
      setPoints('0');
      onClose();
      onAdded();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Lỗi thêm học sinh');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Thêm học sinh mới</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            autoFocus
            fullWidth
            label="Họ và tên"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            required
          />
          <TextField
            fullWidth
            label="Số thứ tự"
            type="number"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
          <TextField
            fullWidth
            label="Điểm ban đầu"
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            inputProps={{ min: 0 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSubmit}>Thêm</Button>
      </DialogActions>
    </Dialog>
  );
}
