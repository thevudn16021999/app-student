/**
 * App.jsx - Component chính của ứng dụng
 */
import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import theme from './theme';
import Header from './components/Header';
import StudentGrid from './components/StudentGrid';
import Footer from './components/Footer';
import StudentDrawer from './components/StudentDrawer';
import RankingDialog from './components/RankingDialog';
import RewardShopDialog from './components/RewardShopDialog';
import AddStudentDialog from './components/AddStudentDialog';
import SettingsDialog from './components/SettingsDialog';
import * as api from './api';

export default function App() {
  // State chính
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog/Drawer states
  const [drawerStudent, setDrawerStudent] = useState(null);
  const [showRanking, setShowRanking] = useState(false);
  const [showRewardShop, setShowRewardShop] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Tải danh sách lớp học
  useEffect(() => {
    loadClassrooms();
  }, []);

  // Tải học sinh khi chọn lớp
  useEffect(() => {
    if (selectedClassroom) {
      loadStudents();
    }
  }, [selectedClassroom]);

  const loadClassrooms = async () => {
    try {
      const res = await api.getClassrooms();
      setClassrooms(res.data);
      if (res.data.length > 0 && !selectedClassroom) {
        setSelectedClassroom(res.data[0].id);
      }
    } catch (err) {
      console.error('Lỗi tải lớp học:', err);
    }
  };

  const loadStudents = useCallback(async () => {
    if (!selectedClassroom) return;
    setLoading(true);
    try {
      const res = await api.getStudents(selectedClassroom);
      setStudents(res.data);
    } catch (err) {
      console.error('Lỗi tải học sinh:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedClassroom]);

  // Cập nhật 1 student trong list (sau khi đổi điểm)
  const updateStudentInList = (updatedStudent) => {
    setStudents(prev =>
      prev.map(s => s.id === updatedStudent.id ? { ...s, ...updatedStudent } : s)
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster
        position="top-center"
        toastOptions={{
          style: { fontFamily: 'Open Sans, sans-serif', borderRadius: 12 },
          duration: 3000,
        }}
      />

      {/* Header */}
      <Header
        classrooms={classrooms}
        selectedClassroom={selectedClassroom}
        onSelectClassroom={setSelectedClassroom}
        onShowRanking={() => setShowRanking(true)}
        onShowRewardShop={() => setShowRewardShop(true)}
        onShowSettings={() => setShowSettings(true)}
        onCreateClassroom={async (name) => {
          await api.createClassroom(name);
          loadClassrooms();
        }}
      />

      {/* Grid học sinh */}
      <StudentGrid
        students={students}
        loading={loading}
        onStudentClick={(student) => setDrawerStudent(student)}
        onPointsChange={updateStudentInList}
        onReload={loadStudents}
      />

      {/* Footer */}
      <Footer
        classroomId={selectedClassroom}
        onAddStudent={() => setShowAddStudent(true)}
        onShowRewardShop={() => setShowRewardShop(true)}
        onImportDone={loadStudents}
        onExportClick={async () => {
          try {
            const res = await api.exportExcel(selectedClassroom);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `xephang_${selectedClassroom}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
          } catch (err) {
            console.error('Lỗi export:', err);
          }
        }}
      />

      {/* Drawer chi tiết học sinh */}
      <StudentDrawer
        student={drawerStudent}
        open={!!drawerStudent}
        onClose={() => setDrawerStudent(null)}
        onUpdate={() => { loadStudents(); }}
      />

      {/* Dialog xếp hạng */}
      <RankingDialog
        open={showRanking}
        onClose={() => setShowRanking(false)}
        classroomId={selectedClassroom}
      />

      {/* Dialog cửa hàng quà */}
      <RewardShopDialog
        open={showRewardShop}
        onClose={() => setShowRewardShop(false)}
        classroomId={selectedClassroom}
        students={students}
        onRedeemed={loadStudents}
      />

      {/* Dialog thêm học sinh */}
      <AddStudentDialog
        open={showAddStudent}
        onClose={() => setShowAddStudent(false)}
        classroomId={selectedClassroom}
        onAdded={loadStudents}
      />

      {/* Dialog cài đặt */}
      <SettingsDialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        classrooms={classrooms}
        onClassroomsChange={loadClassrooms}
      />
    </ThemeProvider>
  );
}
