/**
 * StudentDrawer - Drawer chi tiết học sinh (từ phải sang trái)
 * Gồm 3 tab: Hoạt động, Phần thưởng, Thống kê
 */
import React, { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, Tabs, Tab, IconButton, Chip, Avatar,
  List, ListItem, ListItemIcon, ListItemText, Divider, Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import * as api from '../api';
import { RANKS, getRank, getRankProgress, generateDefaultAvatar, formatTime } from '../utils';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ py: 2 }}>{children}</Box> : null;
}

export default function StudentDrawer({ student, open, onClose, onUpdate }) {
  const [tab, setTab] = useState(0);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (student && open) {
      loadDetail();
      setTab(0);
    }
  }, [student, open]);

  const loadDetail = async () => {
    try {
      const res = await api.getStudentDetail(student.id);
      setDetail(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Xóa học sinh "${student.name}"?`)) return;
    try {
      await api.deleteStudent(student.id);
      toast.success('Đã xóa học sinh');
      onClose();
      onUpdate();
    } catch (err) {
      toast.error('Lỗi xóa học sinh');
    }
  };

  if (!student) return null;

  const rank = getRank(student.total_points);
  const rankInfo = RANKS[rank];
  const progress = getRankProgress(student.total_points);
  const avatar = student.avatar || generateDefaultAvatar(student.name);

  // Thống kê cho biểu đồ
  const getChartData = () => {
    if (!detail?.point_history) return null;

    const months = {};
    detail.point_history.forEach(h => {
      const date = new Date(h.timestamp);
      const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!months[key]) months[key] = { add: 0, sub: 0 };
      if (h.change > 0) months[key].add += h.change;
      else months[key].sub += Math.abs(h.change);
    });

    const labels = Object.keys(months);
    return {
      labels,
      datasets: [
        {
          label: 'Cộng',
          data: labels.map(l => months[l].add),
          backgroundColor: '#6750A4',
          borderRadius: 4,
        },
        {
          label: 'Trừ',
          data: labels.map(l => months[l].sub),
          backgroundColor: '#FF6D00',
          borderRadius: 4,
        },
      ],
    };
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, p: 2 } }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={onClose} sx={{ mr: 1 }}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
          Chi tiết học sinh
        </Typography>
        <IconButton color="error" onClick={handleDelete} title="Xóa học sinh">
          <DeleteIcon />
        </IconButton>
      </Box>

      {/* Profile */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Avatar
          src={avatar}
          sx={{
            width: 80, height: 80, mx: 'auto', mb: 1,
            border: `3px solid ${rankInfo.color}`,
            borderRadius: 3,
          }}
          variant="rounded"
        />
        <Typography variant="h6" fontWeight={700}>{student.name}</Typography>
        <Chip
          label={`${rankInfo.icon} ${rankInfo.name} - ${student.total_points} điểm`}
          sx={{
            mt: 1,
            backgroundColor: `${rankInfo.color}22`,
            fontWeight: 600,
          }}
        />
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
          {progress.nextRankName
            ? `Còn ${progress.remaining} điểm → ${progress.nextRankName} (${progress.percent}%)`
            : '🏆 Hạng cao nhất!'}
        </Typography>
      </Box>

      <Divider />

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ mb: 1 }}
      >
        <Tab label="Hoạt động" />
        <Tab label="Phần thưởng" />
        <Tab label="Thống kê" />
      </Tabs>

      {/* Tab: Hoạt động (Timeline) */}
      <TabPanel value={tab} index={0}>
        {detail?.point_history?.length > 0 ? (
          <List dense>
            {[...detail.point_history]
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map((h, i) => (
                <ListItem key={h.id || i} sx={{ alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                    {h.change > 0
                      ? <AddCircleIcon sx={{ color: '#6750A4' }} />
                      : <RemoveCircleIcon sx={{ color: '#FF6D00' }} />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={h.change > 0 ? `+${h.change}` : h.change}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            backgroundColor: h.change > 0 ? '#F3EEFF' : '#FFF3E0',
                            color: h.change > 0 ? '#6750A4' : '#FF6D00',
                          }}
                        />
                        <Typography variant="body2">{h.reason || '—'}</Typography>
                      </Box>
                    }
                    secondary={`${formatTime(h.timestamp)} | Sau: ${h.points_after} điểm`}
                  />
                </ListItem>
              ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Chưa có hoạt động nào
          </Typography>
        )}
      </TabPanel>

      {/* Tab: Phần thưởng đã đổi */}
      <TabPanel value={tab} index={1}>
        {detail?.rewards_redeemed?.length > 0 ? (
          <List dense>
            {[...detail.rewards_redeemed]
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map((r, i) => (
                <ListItem key={r.id || i}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CardGiftcardIcon sx={{ color: '#6750A4' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={r.reward_name}
                    secondary={`-${r.points_spent} điểm | ${formatTime(r.timestamp)}`}
                  />
                </ListItem>
              ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Chưa đổi phần thưởng nào
          </Typography>
        )}
      </TabPanel>

      {/* Tab: Thống kê */}
      <TabPanel value={tab} index={2}>
        {getChartData() ? (
          <Bar
            data={getChartData()}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Thống kê điểm theo tháng' },
              },
              scales: {
                y: { beginAtZero: true },
              },
            }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Chưa đủ dữ liệu
          </Typography>
        )}
      </TabPanel>
    </Drawer>
  );
}
