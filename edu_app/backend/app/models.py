"""
SQLAlchemy Models - Định nghĩa các bảng dữ liệu
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Classroom(Base):
    """Bảng lớp học"""
    __tablename__ = "classrooms"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    students = relationship("Student", back_populates="classroom", cascade="all, delete-orphan")


class Student(Base):
    """Bảng học sinh"""
    __tablename__ = "students"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    order_number = Column(Integer, default=0)  # Số thứ tự
    avatar = Column(Text, nullable=True)  # URL hoặc base64 avatar
    total_points = Column(Integer, default=0)
    classroom_id = Column(String, ForeignKey("classrooms.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    classroom = relationship("Classroom", back_populates="students")
    point_history = relationship("PointHistory", back_populates="student", cascade="all, delete-orphan")
    rewards_redeemed = relationship("RewardRedeemed", back_populates="student", cascade="all, delete-orphan")

    @property
    def rank(self):
        """Tính hạng dựa trên tổng điểm"""
        if self.total_points >= 200:
            return "diamond"
        elif self.total_points >= 100:
            return "gold"
        elif self.total_points >= 50:
            return "silver"
        else:
            return "bronze"


class PointHistory(Base):
    """Lịch sử thay đổi điểm"""
    __tablename__ = "point_history"

    id = Column(String, primary_key=True, default=generate_uuid)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    change = Column(Integer, nullable=False)  # Số điểm thay đổi (+/-)
    reason = Column(String(255), default="")
    points_after = Column(Integer, nullable=False)  # Điểm sau khi thay đổi
    timestamp = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="point_history")


class Reward(Base):
    """Danh sách phần thưởng (cửa hàng quà)"""
    __tablename__ = "rewards"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    description = Column(String(255), default="")
    icon = Column(String(10), default="🎁")
    points_required = Column(Integer, nullable=False)
    classroom_id = Column(String, ForeignKey("classrooms.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class RewardRedeemed(Base):
    """Lịch sử đổi quà"""
    __tablename__ = "rewards_redeemed"

    id = Column(String, primary_key=True, default=generate_uuid)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    reward_name = Column(String(100), nullable=False)
    points_spent = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="rewards_redeemed")
