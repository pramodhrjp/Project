import bcrypt
import jwt
import os
from starlette.requests import Request
from fastapi import Depends, HTTPException
from dotenv import load_dotenv

from app.auth.auth_model import UserTokenPayload
from app.user.user_enum import UserRoles

load_dotenv()



def hash_password(password: str):
    pw = bytes(password,"utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw, salt)


def decode_token(token: str):
    try:
        token_decoded = jwt.decode(
            token,
            os.getenv("SECRET_KEY"),
            algorithms=[os.getenv("ALGORITHM")]
        )
        return UserTokenPayload(
            user_id=token_decoded.get("user_id"),
            role=token_decoded.get("user_role")
        )

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user_manually(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return HTTPException(status_code=401, detail="Missing or invalid token")
    token = auth_header.split(" ")[1].strip('"').strip("'")

    payload = decode_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    return payload


def check_roles(required_roles=None):
    if required_roles is None:
        required_roles = [UserRoles.admin, UserRoles.user]

    def role_checker(decoded_token: UserTokenPayload = Depends(get_current_user_manually)):
        if decoded_token.role in required_roles:
            return decoded_token
        raise HTTPException(status_code=403, detail="Permission denied")
    return role_checker