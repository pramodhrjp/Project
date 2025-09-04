from typing import List

from pydantic import BaseModel

from app.user.user_enum import UserRoles


class UserTokenPayload(BaseModel):
    user_id: str
    role: UserRoles