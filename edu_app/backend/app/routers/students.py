"""
Router: Quản lý học sinh + điểm số
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/api/students", tags=["Học sinh"])


@router.get("/{classroom_id}", response_model=List[schemas.StudentBrief])
def list_students(classroom_id: str, db: Session = Depends(get_db)):
    """Lấy danh sách học sinh theo lớp"""
    return crud.get_students(db, classroom_id)


@router.get("/detail/{student_id}", response_model=schemas.StudentResponse)
def get_student(student_id: str, db: Session = Depends(get_db)):
    """Lấy chi tiết học sinh"""
    student = crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")
    return student


@router.post("/{classroom_id}", response_model=schemas.StudentBrief)
def create_student(classroom_id: str, data: schemas.StudentCreate, db: Session = Depends(get_db)):
    """Thêm học sinh mới"""
    return crud.create_student(db, classroom_id, data)


@router.put("/{student_id}", response_model=schemas.StudentBrief)
def update_student(student_id: str, data: schemas.StudentUpdate, db: Session = Depends(get_db)):
    """Cập nhật thông tin học sinh"""
    student = crud.update_student(db, student_id, data)
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")
    return student


@router.delete("/{student_id}")
def delete_student(student_id: str, db: Session = Depends(get_db)):
    """Xóa học sinh"""
    success = crud.delete_student(db, student_id)
    if not success:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")
    return {"message": "Đã xóa học sinh"}


@router.post("/{student_id}/points")
def change_points(student_id: str, data: schemas.PointChange, db: Session = Depends(get_db)):
    """Thay đổi điểm học sinh"""
    # Trừ điểm bắt buộc phải có lý do
    if data.change < 0 and not data.reason.strip():
        raise HTTPException(status_code=400, detail="Trừ điểm phải có lý do")

    student, rank_changed, error = crud.change_points(db, student_id, data)
    if error:
        raise HTTPException(status_code=400, detail=error)
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")

    return {
        "student": schemas.StudentBrief.model_validate(student),
        "rank_changed": rank_changed,
        "new_rank": student.rank
    }


@router.get("/rankings/{classroom_id}", response_model=List[schemas.RankingEntry])
def get_rankings(classroom_id: str, limit: int = 10, db: Session = Depends(get_db)):
    """Lấy bảng xếp hạng"""
    return crud.get_rankings(db, classroom_id, limit)
