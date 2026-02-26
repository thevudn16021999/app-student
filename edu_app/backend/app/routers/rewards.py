"""
Router: Quản lý phần thưởng (cửa hàng quà)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/api/rewards", tags=["Phần thưởng"])


# ⚠️ Route /redeem PHẢI đặt TRƯỚC /{classroom_id} để tránh bị match nhầm
@router.post("/redeem")
def redeem_reward(data: schemas.RedeemRequest, db: Session = Depends(get_db)):
    """Đổi quà cho học sinh"""
    student, error = crud.redeem_reward(db, data.student_id, data.reward_id)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return {
        "student": schemas.StudentBrief.model_validate(student),
        "message": f"Đổi quà thành công! Còn {student.total_points} điểm"
    }


@router.get("/{classroom_id}", response_model=List[schemas.RewardResponse])
def list_rewards(classroom_id: str, db: Session = Depends(get_db)):
    """Lấy danh sách phần thưởng"""
    return crud.get_rewards(db, classroom_id)


@router.post("/{classroom_id}", response_model=schemas.RewardResponse)
def create_reward(classroom_id: str, data: schemas.RewardCreate, db: Session = Depends(get_db)):
    """Tạo phần thưởng mới"""
    return crud.create_reward(db, classroom_id, data)


@router.delete("/{reward_id}")
def delete_reward(reward_id: str, db: Session = Depends(get_db)):
    """Xóa phần thưởng"""
    success = crud.delete_reward(db, reward_id)
    if not success:
        raise HTTPException(status_code=404, detail="Không tìm thấy phần thưởng")
    return {"message": "Đã xóa phần thưởng"}
