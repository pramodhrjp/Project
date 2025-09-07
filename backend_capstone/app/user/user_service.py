from fastapi import HTTPException

from app.auth.auth_service import hash_password
from app.user.user_enum import UserRoles
from app.user.user_model import User, AddressRequest, AddressModel
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


async def add_or_update_address(address: AddressRequest, user_id: str):
    user = await User.find_one({"user_id": user_id, "is_active": True})
    if not user:
        raise HTTPException(status_code=401, detail="No User Found")

    if not address.address_id:
        address.address_id = f"A{str(uuid4().int)[:4]}"

    if not address.mobile:
        address.mobile = str(user.mobile)

    def create_address_model(addr_req: AddressRequest):
        full_address = f"{addr_req.address1} {addr_req.address2 or ''}".strip()
        return AddressModel(
            address_id=addr_req.address_id,
            name=addr_req.name or "",
            mobile=addr_req.mobile,
            address=full_address,
            pincode=addr_req.pincode,
            city=addr_req.city,
            state=addr_req.state,
            is_default=True,
            is_active=True,
            address_type=addr_req.address_type,
            lat=addr_req.lat,
            lng=addr_req.lng)
    if user.address:
        for addr in user.address:
            addr.is_default = False
    else:
        user.address = []
    existing_address = next(
        (addr for addr in user.address if addr.address_id == address.address_id and addr.is_active),
        None)
    if existing_address:
        existing_address.name = address.name or existing_address.name
        existing_address.mobile = address.mobile or existing_address.mobile
        existing_address.address = f"{address.address1} {address.address2 or ''}".strip()
        existing_address.pincode = address.pincode
        existing_address.city = address.city
        existing_address.state = address.state
        existing_address.address_type = address.address_type
        existing_address.lat = address.lat
        existing_address.lng = address.lng
        existing_address.is_default = True
        existing_address.is_active = True
    else:
        new_address = create_address_model(address)
        user.address.append(new_address)
    await user.save()
    user.address = [addr for addr in user.address if addr.is_active]
    return user, 0
