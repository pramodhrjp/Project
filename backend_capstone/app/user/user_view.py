from fastapi import APIRouter, Depends, HTTPException

from app.auth.auth_model import UserTokenPayload
from app.auth.auth_service import check_roles
from app.user.user_model import Login, UserRegister, User, UserResponseModel
from app.user.user_service import user_login, register_new_user

user_router = APIRouter()


@user_router.post('/login')
async def user_login_handler(user_details: Login):
    response, status_code = await user_login(email=user_details.email_id, password=user_details.password)
    if status_code == 0:
        return{"data":response,"status_code":status_code}
    return {"data":response,"status_code":status_code}



@user_router.post('/register')
async def user_register_handler(user_details:UserRegister ):
    response, status_code = await register_new_user(
        name=user_details.name,
        email=user_details.email,
        password=user_details.password,
        mobile=user_details.mobile
    )
    if status_code == 0:
        return {"data":response,"status_code":status_code}
    return {"data":response,"status_code":status_code}

@user_router.get("/me")
async def handler_get_me_detail(
        curr_user: UserTokenPayload = Depends(check_roles())
):
    try:
        if not curr_user:
            raise HTTPException(status_code=401, detail="Not Authorized")
        user = await User.find_one({"user_id":curr_user.user_id})
        if not user:
            return {"error":"User not found","status_code":404}
        user.address = [addr for addr in user.address if addr.is_active]
        response_data = UserResponseModel(
            user_id=user.user_id,
            username=user.username,
            email=user.email,
            mobile=user.mobile,
            role=user.role,
            address=user.address,
            is_active=user.is_active,
            created_at=user.created_at.isoformat(),
            updated_at=user.updated_at.isoformat(),
            cart = user.cart
        )
        return {"data":response_data,"status_code":0}
    except HTTPException as e:
        return {"error": e.detail, "status_code": e.status_code}


