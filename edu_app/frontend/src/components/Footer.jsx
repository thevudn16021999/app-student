/**
 * Footer - Thanh công cụ dưới cùng
 */
import React, { useRef } from 'react';
import {
  Paper, Box, Button, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import toast from 'react-hot-toast';
import * as api from '../api';

export default function Footer({
  classroomId, onAddStudent, onShowRewardShop, onImportDone, onExportClick
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fileInputRef = useRef(null);

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const res = await api.importExcel(classroomId, file);
      toast.success(`✅ Đã import ${res.data.imported} học sinh`);
      if (res.data.errors?.length > 0) {
        toast.error(`⚠️ ${res.data.errors.length} lỗi: ${res.data.errors[0]}`);
      }
      onImportDone();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Lỗi import file');
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        borderRadius: '16px 16px 0 0',
        py: 1,
        px: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: 600,
          mx: 'auto',
        }}
      >
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={onAddStudent}
          size={isMobile ? 'small' : 'medium'}
        >
          Thêm HS
        </Button>

        <input
          type="file"
          ref={fileInputRef}
          accept=".xlsx,.csv"
          style={{ display: 'none' }}
          onChange={handleImport}
        />
        <Button
          variant="outlined"
          startIcon={<FileUploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          size={isMobile ? 'small' : 'medium'}
        >
          Import
        </Button>

        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={onExportClick}
          size={isMobile ? 'small' : 'medium'}
        >
          Export
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          startIcon={<CardGiftcardIcon />}
          onClick={onShowRewardShop}
          size={isMobile ? 'small' : 'medium'}
        >
          Quà
        </Button>
      </Box>
    </Paper>
  );
}
