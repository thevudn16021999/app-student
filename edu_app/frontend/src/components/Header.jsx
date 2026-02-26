/**
 * Header Component - Thanh tiêu đề chính
 */
import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Box, Select, MenuItem, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';

export default function Header({
  classrooms, selectedClassroom, onSelectClassroom,
  onShowRanking, onShowRewardShop, onShowSettings, onCreateClassroom
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [newClassDialog, setNewClassDialog] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  const handleCreateClass = () => {
    if (newClassName.trim()) {
      onCreateClassroom(newClassName.trim());
      setNewClassName('');
      setNewClassDialog(false);
    }
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #6750A4 0%, #4F378B 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Toolbar sx={{ gap: 1, flexWrap: 'wrap', py: 1 }}>
          {/* Logo + Tên app */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
            <SchoolIcon sx={{ fontSize: 32 }} />
            {!isMobile && (
              <Typography variant="h6" fontWeight={700} fontFamily="Roboto">
                LỚP HỌC TÍCH CỰC
              </Typography>
            )}
          </Box>

          {/* Dropdown chọn lớp */}
          <Select
            value={selectedClassroom}
            onChange={(e) => onSelectClassroom(e.target.value)}
            size="small"
            sx={{
              color: 'white',
              minWidth: 140,
              '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.6)' },
              '.MuiSvgIcon-root': { color: 'white' },
            }}
          >
            {classrooms.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </Select>

          <IconButton
            size="small"
            sx={{ color: 'white' }}
            onClick={() => setNewClassDialog(true)}
            title="Thêm lớp mới"
          >
            <AddIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          {/* Nút chức năng */}
          <Button
            startIcon={<EmojiEventsIcon />}
            onClick={onShowRanking}
            sx={{ color: 'white', fontSize: isMobile ? 12 : 14 }}
          >
            {!isMobile && 'Xếp hạng'}
          </Button>
          <Button
            startIcon={<StorefrontIcon />}
            onClick={onShowRewardShop}
            sx={{ color: 'white', fontSize: isMobile ? 12 : 14 }}
          >
            {!isMobile && 'Cửa hàng'}
          </Button>
          <IconButton onClick={onShowSettings} sx={{ color: 'white' }}>
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Dialog tạo lớp mới */}
      <Dialog open={newClassDialog} onClose={() => setNewClassDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Tạo lớp mới</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Tên lớp"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateClass()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewClassDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCreateClass}>Tạo</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
