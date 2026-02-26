/**
 * API Service - Kết nối với FastAPI backend
 */
import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ============ Classroom ============
export const getClassrooms = () => api.get('/classrooms');
export const createClassroom = (name) => api.post('/classrooms', { name });
export const deleteClassroom = (id) => api.delete(`/classrooms/${id}`);

// ============ Students ============
export const getStudents = (classroomId) => api.get(`/students/${classroomId}`);
export const getStudentDetail = (studentId) => api.get(`/students/detail/${studentId}`);
export const createStudent = (classroomId, data) => api.post(`/students/${classroomId}`, data);
export const updateStudent = (studentId, data) => api.put(`/students/${studentId}`, data);
export const deleteStudent = (studentId) => api.delete(`/students/${studentId}`);

// ============ Points ============
export const changePoints = (studentId, change, reason = '') =>
  api.post(`/students/${studentId}/points`, { change, reason });

// ============ Rankings ============
export const getRankings = (classroomId, limit = 10) =>
  api.get(`/students/rankings/${classroomId}`, { params: { limit } });

// ============ Rewards ============
export const getRewards = (classroomId) => api.get(`/rewards/${classroomId}`);
export const createReward = (classroomId, data) => api.post(`/rewards/${classroomId}`, data);
export const deleteReward = (rewardId) => api.delete(`/rewards/${rewardId}`);
export const redeemReward = (studentId, rewardId) =>
  api.post('/rewards/redeem', { student_id: studentId, reward_id: rewardId });

// ============ Excel ============
export const importExcel = (classroomId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/excel/import/${classroomId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const exportExcel = (classroomId) =>
  api.get(`/excel/export/${classroomId}`, { responseType: 'blob' });

export default api;
