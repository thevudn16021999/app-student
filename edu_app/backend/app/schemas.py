"""
Pydantic Schemas - Định nghĩa request/response models
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ============ Classroom ============
class ClassroomCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class ClassroomResponse(BaseModel):
    id: str
    name: str
    created_at: datetime
    student_count: int = 0

    class Config:
        from_attributes = True


# ============ Student ============
class StudentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    order_number: int = 0
    avatar: Optional[str] = None
    total_points: int = 0


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    order_number: Optional[int] = None
    avatar: Optional[str] = None


class PointHistoryResponse(BaseModel):
    id: str
    change: int
    reason: str
    points_after: int
    timestamp: datetime

    class Config:
        from_attributes = True


class RewardRedeemedResponse(BaseModel):
    id: str
    reward_name: str
    points_spent: int
    timestamp: datetime

    class Config:
        from_attributes = True


class StudentResponse(BaseModel):
    id: str
    name: str
    order_number: int
    avatar: Optional[str]
    total_points: int
    rank: str
    classroom_id: str
    created_at: datetime
    point_history: List[PointHistoryResponse] = []
    rewards_redeemed: List[RewardRedeemedResponse] = []

    class Config:
        from_attributes = True


class StudentBrief(BaseModel):
    """Thẻ học sinh (không kèm lịch sử chi tiết)"""
    id: str
    name: str
    order_number: int
    avatar: Optional[str]
    total_points: int
    rank: str
    classroom_id: str

    class Config:
        from_attributes = True


# ============ Points ============
class PointChange(BaseModel):
    change: int = Field(..., description="Số điểm thay đổi (+/-)")
    reason: str = Field(default="", max_length=255)


# ============ Rewards ============
class RewardCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = ""
    icon: str = "🎁"
    points_required: int = Field(..., gt=0)


class RewardResponse(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    points_required: int
    classroom_id: str

    class Config:
        from_attributes = True


class RedeemRequest(BaseModel):
    student_id: str
    reward_id: str


# ============ Rankings ============
class RankingEntry(BaseModel):
    position: int
    student_id: str
    name: str
    avatar: Optional[str]
    total_points: int
    rank: str
    trend: int = 0  # Xu hướng: +/- so với kỳ trước


# ============ Import ============
class ImportPreview(BaseModel):
    rows: List[dict]
    total: int
    valid: int
    errors: List[str]
