# 🏫 LỚP HỌC TÍCH CỰC

Ứng dụng quản lý điểm thưởng/phạt học sinh với gamification, dành cho giáo viên chủ nhiệm.

## 🚀 Chạy với Docker

```bash
# Build và khởi động
docker-compose up --build

# Truy cập:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

## 🛠️ Chạy development (không Docker)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📁 Cấu trúc dự án

```
edu_app/
├── docker-compose.yml        # Docker orchestration
├── backend/                  # Python FastAPI
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py           # Entry point + seed data
│       ├── database.py       # SQLite config
│       ├── models.py         # SQLAlchemy models
│       ├── schemas.py        # Pydantic schemas
│       ├── crud.py           # CRUD operations
│       └── routers/
│           ├── students.py   # API học sinh + điểm
│           ├── rewards.py    # API phần thưởng
│           └── excel.py      # Import/Export Excel
├── frontend/                 # React + Vite + MUI
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── src/
│       ├── App.jsx           # Main component
│       ├── api.js            # API client
│       ├── utils.js          # Utilities
│       ├── theme.js          # MUI theme
│       └── components/
│           ├── Header.jsx
│           ├── StudentGrid.jsx
│           ├── StudentCard.jsx
│           ├── StudentDrawer.jsx
│           ├── Footer.jsx
│           ├── RankingDialog.jsx
│           ├── RewardShopDialog.jsx
│           ├── AddStudentDialog.jsx
│           └── SettingsDialog.jsx
```

## ✨ Tính năng

- **Quản lý học sinh**: Thêm, sửa, xóa, import/export Excel
- **Hệ thống điểm**: Cộng/trừ điểm nhanh với lý do
- **Gamification**: Hệ thống xếp hạng Đồng → Bạc → Vàng → Kim Cương
- **Cửa hàng quà**: Đổi điểm lấy phần thưởng
- **Bảng xếp hạng**: Top 10 học sinh
- **Hiệu ứng**: Confetti khi thăng hạng, animation điểm
- **Responsive**: Tương thích mobile, tablet, desktop

## 🎨 Thiết kế

- Material Design 3
- Màu chính: Tím #6750A4, Cam #FF6D00
- Font: Roboto (tiêu đề), Open Sans (nội dung)
