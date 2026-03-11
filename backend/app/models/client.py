from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)  # Primary key
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    notas = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)  # User is active by default
    created_at = Column(
        DateTime(timezone=True), server_default=func.now()
    )  # Creation timestamp
    owner_id = Column(Integer, ForeignKey("users.id")) # foreign key
    owner = relationship("User", back_populates="clients") # Relationship with model user
