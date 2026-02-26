/**
 * SettingsDialog - Cài đặt (quản lý lớp, quà)
 */
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, List, ListItem,
  ListItemText, IconButton, Divider, Tabs, Tab
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import toast from 'react-hot-toast';
import * as api from '../api';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ py: 2 }}>{children}</Box> : null;
}

export default function SettingsDialog({ open, onClose, classrooms, onClassroomsChange }) {
  const [tab, setTab] = useState(0);

  // Quản lý phần thưởng
  const [rewardName, setRewardName] = useState('');
  const [rewardIcon, setRewardIcon] = useState('🎁');
  const [rewardDesc, setRewardDesc] = useState('');
  const [rewardPoints, setRewardPoints] = useState('');
  const [rewards, setRewards] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    if (open && classrooms.length > 0) {
      setSelectedClass(classrooms[0].id);
    }
  }, [open, classrooms]);

  useEffect(() => {
    if (selectedClass) {
      loadRewards();
    }
  }, [selectedClass]);

  const loadRewards = async () => {
    try {
      const res = await api.getRewards(selectedClass);
      setRewards(res.data);
    } catch (err) { /* ignore */ }
  };

  const handleAddReward = async () => {
    if (!rewardName.trim() || !rewardPoints) return;
    try {
      await api.createReward(selectedClass, {
        name: rewardName.trim(),
        description: rewardDesc,
        icon: rewardIcon,
        points_required: parseInt(rewardPoints),
      });
      toast.success('Đã thêm phần thưởng');
      setRewardName('');
      setRewardDesc('');
      setRewardPoints('');
      loadRewards();
    } catch (err) {
      toast.error('Lỗi thêm phần thưởng');
    }
  };

  const handleDeleteReward = async (id) => {
    try {
      await api.deleteReward(id);
      loadRewards();
    } catch (err) {
      toast.error('Lỗi xóa phần thưởng');
    }
  };

  const handleDeleteClassroom = async (id) => {
    if (!window.confirm('Xóa lớp sẽ xóa toàn bộ dữ liệu. Tiếp tục?')) return;
    try {
      await api.deleteClassroom(id);
      toast.success('Đã xóa lớp học');
      onClassroomsChange();
    } catch (err) {
      toast.error('Lỗi xóa lớp');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SettingsIcon />
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>Cài đặt</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
          <Tab label="Quản lý lớp" />
          <Tab label="Phần thưởng" />
        </Tabs>

        {/* Tab: Quản lý lớp */}
        <TabPanel value={tab} index={0}>
          <List>
            {classrooms.map(c => (
              <ListItem
                key={c.id}
                secondaryAction={
                  <IconButton color="error" onClick={() => handleDeleteClassroom(c.id)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={c.name}
                  secondary={`${c.student_count || 0} học sinh`}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        {/* Tab: Quản lý phần thưởng */}
        <TabPanel value={tab} index={1}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Thêm phần thưởng mới
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                label="Icon"
                value={rewardIcon}
                onChange={(e) => setRewardIcon(e.target.value)}
                sx={{ width: 80 }}
              />
              <TextField
                size="small"
                label="Tên phần thưởng"
                value={rewardName}
                onChange={(e) => setRewardName(e.target.value)}
                sx={{ flex: 1 }}
              />
            </Box>
            <TextField
              size="small"
              label="Mô tả"
              value={rewardDesc}
              onChange={(e) => setRewardDesc(e.target.value)}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                label="Điểm cần"
                type="number"
                value={rewardPoints}
                onChange={(e) => setRewardPoints(e.target.value)}
                sx={{ width: 120 }}
              />
              <Button variant="contained" size="small" onClick={handleAddReward}>
                Thêm
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Danh sách phần thưởng
          </Typography>
          <List dense>
            {rewards.map(r => (
              <ListItem
                key={r.id}
                secondaryAction={
                  <IconButton size="small" color="error" onClick={() => handleDeleteReward(r.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`${r.icon} ${r.name}`}
                  secondary={`${r.points_required} điểm - ${r.description}`}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
