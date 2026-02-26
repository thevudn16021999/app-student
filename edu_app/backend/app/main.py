"""
LỚP HỌC TÍCH CỰC - FastAPI Backend
Main application entry point
"""
import os
from datetime import datetime, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .models import Classroom, Student, PointHistory, Reward, RewardRedeemed
from .routers import students, rewards, excel

# Tạo thư mục data nếu chưa có
os.makedirs("data", exist_ok=True)

# Tạo tất cả bảng
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Lớp Học Tích Cực API",
    description="API quản lý điểm thưởng/phạt học sinh với hệ thống gamification",
    version="1.0.0"
)

# CORS - cho phép frontend kết nối
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký routers
app.include_router(students.router)
app.include_router(rewards.router)
app.include_router(excel.router)


# ============ API Classroom ============
from fastapi import Depends
from sqlalchemy.orm import Session
from .database import get_db
from . import crud, schemas
from typing import List


@app.get("/api/classrooms", response_model=List[schemas.ClassroomResponse])
def list_classrooms(db: Session = Depends(get_db)):
    """Lấy danh sách lớp học"""
    return crud.get_classrooms(db)


@app.post("/api/classrooms", response_model=schemas.ClassroomResponse)
def create_classroom(data: schemas.ClassroomCreate, db: Session = Depends(get_db)):
    """Tạo lớp học mới"""
    classroom = crud.create_classroom(db, data)
    return schemas.ClassroomResponse(
        id=classroom.id,
        name=classroom.name,
        created_at=classroom.created_at,
        student_count=0
    )


@app.delete("/api/classrooms/{classroom_id}")
def delete_classroom(classroom_id: str, db: Session = Depends(get_db)):
    """Xóa lớp học"""
    success = crud.delete_classroom(db, classroom_id)
    if not success:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Không tìm thấy lớp học")
    return {"message": "Đã xóa lớp học"}


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "Lớp Học Tích Cực", "version": "1.0.0"}


# ============ Seed Data - Dữ liệu mẫu ============
def seed_data():
    """Tạo dữ liệu mẫu khi khởi động lần đầu"""
    db = SessionLocal()
    try:
        # Kiểm tra đã có dữ liệu chưa
        if db.query(Classroom).count() > 0:
            return

        # Tạo lớp mẫu
        classroom = Classroom(id="class-demo-001", name="Lớp 10A1")
        db.add(classroom)
        db.flush()

        # Tạo học sinh mẫu
        sample_students = [
            {"name": "Nguyễn Văn An", "order": 1, "points": 245},
            {"name": "Trần Thị Bình", "order": 2, "points": 198},
            {"name": "Lê Hoàng Cường", "order": 3, "points": 175},
            {"name": "Phạm Minh Đức", "order": 4, "points": 82},
            {"name": "Hoàng Thị Lan", "order": 5, "points": 35},
        ]

        # Lý do mẫu cho lịch sử
        reasons_add = [
            "Nộp bài đúng hạn", "Phát biểu tốt", "Giúp đỡ bạn",
            "Hoàn thành xuất sắc", "Tham gia hoạt động", "Trả lời đúng",
            "Giữ vệ sinh lớp", "Điểm 10 bài kiểm tra"
        ]
        reasons_sub = [
            "Quên sách giáo khoa", "Nói chuyện trong giờ",
            "Đi học muộn", "Không làm bài tập"
        ]

        now = datetime.utcnow()

        for idx, s_data in enumerate(sample_students):
            student = Student(
                id=f"student-demo-{idx + 1:03d}",
                name=s_data["name"],
                order_number=s_data["order"],
                total_points=s_data["points"],
                classroom_id=classroom.id
            )
            db.add(student)
            db.flush()

            # Tạo lịch sử điểm mẫu
            accumulated = 0
            for i in range(min(8, s_data["points"] // 5)):
                change = [1, 3, 5, 10][i % 4]
                accumulated += change
                if accumulated > s_data["points"]:
                    break
                history = PointHistory(
                    student_id=student.id,
                    change=change,
                    reason=reasons_add[i % len(reasons_add)],
                    points_after=accumulated,
                    timestamp=now - timedelta(days=30 - i * 3, hours=i)
                )
                db.add(history)

            # Thêm 1-2 lần bị trừ điểm
            if idx > 2:
                sub_history = PointHistory(
                    student_id=student.id,
                    change=-2,
                    reason=reasons_sub[idx % len(reasons_sub)],
                    points_after=max(0, accumulated - 2),
                    timestamp=now - timedelta(days=5)
                )
                db.add(sub_history)

        # Tạo phần thưởng mẫu
        sample_rewards = [
            {"name": "Vé miễn 1 bài kiểm tra", "icon": "🎫", "desc": "Được miễn 1 bài kiểm tra 15 phút", "pts": 40},
            {"name": "Chọn ghế ngồi tự do", "icon": "🪑", "desc": "Chọn chỗ ngồi bất kỳ trong 1 tuần", "pts": 60},
            {"name": "Cộng 10 điểm bài thi", "icon": "✏️", "desc": "Cộng thêm 10 điểm vào 1 bài kiểm tra", "pts": 90},
            {"name": "Ngồi ghế Giáo viên 1 tiết", "icon": "👔", "desc": "Ngồi ghế thầy/cô 1 tiết học", "pts": 120},
            {"name": "Phiếu mua sách 100k", "icon": "📖", "desc": "Phiếu mua sách trị giá 100.000đ", "pts": 180},
            {"name": "Hộp quà bí ẩn", "icon": "🎁", "desc": "Quà bất ngờ dành cho học sinh xuất sắc", "pts": 250},
        ]

        for r in sample_rewards:
            reward = Reward(
                name=r["name"],
                description=r["desc"],
                icon=r["icon"],
                points_required=r["pts"],
                classroom_id=classroom.id
            )
            db.add(reward)

        db.commit()
        print("✅ Đã tạo dữ liệu mẫu thành công!")

    except Exception as e:
        db.rollback()
        print(f"⚠️ Lỗi tạo dữ liệu mẫu: {e}")
    finally:
        db.close()


# Chạy seed khi khởi động
seed_data()
