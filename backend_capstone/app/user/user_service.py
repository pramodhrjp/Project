from fastapi import HTTPException

from app.auth.auth_service import hash_password
from app.user.user_enum import UserRoles
from app.user.user_model import User
from uuid import uuid4

async def register_new_user(
    name,
    email,
    password,
    mobile
):
    try:
        user = await User.find_one({"email":email})
        if  user:
            return "User Already exists. Please login ", 401

        hashed_pwd = hash_password(password)

        new_user = User(user_id= str(uuid4())[:6],
                        email = email,
                        username = name,
                        password=hashed_pwd,
                        role = UserRoles.user,
                        mobile=mobile)
        await new_user.save()
        return "User registered successfully", 0
    except Exception as e:
        print("Registration error:", e)
        return "Internal server error", 500


async def user_login(email:str, password: str):
    try:
        user_details = await User.find_one({"email":email})
        if not user_details:
            return "Please check your email or password", 401
        user_password = user_details.check_password(password=password)
        if not user_password:
            return {"message":"Please check your email or password"}, 401

        token = user_details.generate_token(user_details.role.value)
        user_details = {
            "user_id": user_details.user_id,
            "email": user_details.email,
            "username": user_details.username,
            "role": user_details.role.value,
            "mobile": user_details.mobile
        }
        return {"message":"Login Successful", "access_token":token,"user": user_details},0

    except Exception as e:
        print("Login error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")


