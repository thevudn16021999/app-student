"""
CRUD Operations - Các thao tác dữ liệu
"""
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from . import models, schemas


# ============ Classroom ============
def get_classrooms(db: Session):
    """Lấy danh sách tất cả lớp học"""
    classrooms = db.query(models.Classroom).all()
    result = []
    for c in classrooms:
        result.append(schemas.ClassroomResponse(
            id=c.id,
            name=c.name,
            created_at=c.created_at,
            student_count=len(c.students)
        ))
    return result


def create_classroom(db: Session, data: schemas.ClassroomCreate):
    """Tạo lớp học mới"""
    classroom = models.Classroom(name=data.name)
    db.add(classroom)
    db.commit()
    db.refresh(classroom)
    return classroom


def delete_classroom(db: Session, classroom_id: str):
    """Xóa lớp học"""
    classroom = db.query(models.Classroom).filter(models.Classroom.id == classroom_id).first()
    if classroom:
        db.delete(classroom)
        db.commit()
        return True
    return False


# ============ Student ============
def get_students(db: Session, classroom_id: str):
    """Lấy danh sách học sinh theo lớp"""
    return db.query(models.Student).filter(
        models.Student.classroom_id == classroom_id
    ).order_by(models.Student.order_number).all()


def get_student(db: Session, student_id: str):
    """Lấy chi tiết 1 học sinh"""
    return db.query(models.Student).filter(models.Student.id == student_id).first()


def create_student(db: Session, classroom_id: str, data: schemas.StudentCreate):
    """Thêm học sinh mới"""
    student = models.Student(
        name=data.name,
        order_number=data.order_number,
        avatar=data.avatar,
        total_points=data.total_points,
        classroom_id=classroom_id
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


def update_student(db: Session, student_id: str, data: schemas.StudentUpdate):
    """Cập nhật thông tin học sinh"""
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        return None
    if data.name is not None:
        student.name = data.name
    if data.order_number is not None:
        student.order_number = data.order_number
    if data.avatar is not None:
        student.avatar = data.avatar
    db.commit()
    db.refresh(student)
    return student


def delete_student(db: Session, student_id: str):
    """Xóa học sinh"""
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if student:
        db.delete(student)
        db.commit()
        return True
    return False


# ============ Points ============
def change_points(db: Session, student_id: str, data: schemas.PointChange):
    """
    Thay đổi điểm học sinh.
    - Không cho phép điểm âm
    - Lưu lịch sử
    - Trả về thông tin rank cũ/mới để kiểm tra thăng hạng
    """
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        return None, None, None

    old_rank = student.rank
    new_points = student.total_points + data.change

    # Không cho phép điểm âm
    if new_points < 0:
        return None, None, "Điểm không thể âm"

    student.total_points = new_points
    new_rank = student.rank

    # Lưu lịch sử
    history = models.PointHistory(
        student_id=student_id,
        change=data.change,
        reason=data.reason,
        points_after=new_points,
        timestamp=datetime.utcnow()
    )
    db.add(history)
    db.commit()
    db.refresh(student)

    return student, old_rank != new_rank and data.change > 0, None


# ============ Rewards ============
def get_rewards(db: Session, classroom_id: str):
    """Lấy danh sách phần thưởng"""
    return db.query(models.Reward).filter(
        models.Reward.classroom_id == classroom_id
    ).order_by(models.Reward.points_required).all()


def create_reward(db: Session, classroom_id: str, data: schemas.RewardCreate):
    """Tạo phần thưởng mới"""
    reward = models.Reward(
        name=data.name,
        description=data.description,
        icon=data.icon,
        points_required=data.points_required,
        classroom_id=classroom_id
    )
    db.add(reward)
    db.commit()
    db.refresh(reward)
    return reward


def delete_reward(db: Session, reward_id: str):
    """Xóa phần thưởng"""
    reward = db.query(models.Reward).filter(models.Reward.id == reward_id).first()
    if reward:
        db.delete(reward)
        db.commit()
        return True
    return False


def redeem_reward(db: Session, student_id: str, reward_id: str):
    """
    Đổi quà cho học sinh.
    Kiểm tra đủ điểm → trừ điểm → lưu lịch sử
    """
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    reward = db.query(models.Reward).filter(models.Reward.id == reward_id).first()

    if not student or not reward:
        return None, "Không tìm thấy học sinh hoặc phần thưởng"

    if student.total_points < reward.points_required:
        return None, f"Không đủ điểm. Cần {reward.points_required}, hiện có {student.total_points}"

    # Trừ điểm
    student.total_points -= reward.points_required

    # Lưu lịch sử đổi quà
    redeemed = models.RewardRedeemed(
        student_id=student_id,
        reward_name=reward.name,
        points_spent=reward.points_required,
        timestamp=datetime.utcnow()
    )
    db.add(redeemed)

    # Lưu lịch sử điểm
    history = models.PointHistory(
        student_id=student_id,
        change=-reward.points_required,
        reason=f"Đổi quà: {reward.name}",
        points_after=student.total_points,
        timestamp=datetime.utcnow()
    )
    db.add(history)

    db.commit()
    db.refresh(student)
    return student, None


# ============ Rankings ============
def get_rankings(db: Session, classroom_id: str, limit: int = 10):
    """Lấy bảng xếp hạng Top N"""
    students = db.query(models.Student).filter(
        models.Student.classroom_id == classroom_id
    ).order_by(desc(models.Student.total_points)).limit(limit).all()

    rankings = []
    for i, student in enumerate(students):
        rankings.append(schemas.RankingEntry(
            position=i + 1,
            student_id=student.id,
            name=student.name,
            avatar=student.avatar,
            total_points=student.total_points,
            rank=student.rank,
            trend=0  # Có thể mở rộng sau
        ))
    return rankings
