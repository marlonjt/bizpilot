"""Utility functions for common operations."""

from fastapi import HTTPException


def validate_pagination(skip: int, limit: int, max_limit: int = 100) -> tuple[int, int]:
    """
    Validates and normalizes pagination parameters.
    
    Args:
        skip: Number of items to skip (offset)
        limit: Number of items to return
        max_limit: Maximum allowed limit (default 100)
    
    Returns:
        Tuple of (validated_skip, validated_limit)
    
    Raises:
        HTTPException: If parameters are invalid
    """
    if skip < 0:
        raise HTTPException(status_code=400, detail="skip must be >= 0")
    
    if limit <= 0:
        raise HTTPException(status_code=400, detail="limit must be > 0")
    
    if limit > max_limit:
        raise HTTPException(
            status_code=400,
            detail=f"limit must be <= {max_limit}"
        )
    
    return skip, limit
