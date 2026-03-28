from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class VocabList(Base):
    __tablename__ = "vocab_lists"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    target_language = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    entries = relationship("VocabEntry", back_populates="vocab_list", cascade="all, delete-orphan", order_by="VocabEntry.id")


class VocabEntry(Base):
    __tablename__ = "vocab_entries"
    id = Column(Integer, primary_key=True, index=True)
    list_id = Column(Integer, ForeignKey("vocab_lists.id", ondelete="CASCADE"), nullable=False)
    native_word = Column(String, nullable=False)
    target_word = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    vocab_list = relationship("VocabList", back_populates="entries")
