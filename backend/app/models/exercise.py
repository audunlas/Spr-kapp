from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class GrammarExercise(Base):
    __tablename__ = "grammar_exercises"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    prompt = Column(String, nullable=False)
    text_content = Column(Text, nullable=False)
    correct_indices = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    class_ = relationship("Class", back_populates="exercises")
