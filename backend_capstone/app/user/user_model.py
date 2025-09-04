import os
from typing import Optional, Literal, List, Dict

from pydantic import BaseModel, constr
from beanie import Indexed
from dotenv import load_dotenv


import jwt

from app.cart.cart_model import CartItem
from app.database.base import MongoDocument
from app.user.user_enum import UserRoles
from datetime import datetime, timedelta
import pytz
import bcrypt

load_dotenv()


PIN_REGEX = r"^\d{6}$"


class Login(BaseModel):
    email_id: str
    password: str


class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    mobile: int




class AddressModel(BaseModel):
    address_id:str
    name:str
    mobile:str
    address:str
    pincode: constr(min_length=6, max_length=6, pattern=PIN_REGEX)
    city:str
    state:str
    is_default:bool = True
    is_active:bool = True
    address_type:Literal["WORK","OTHER"]
    lat:Optional[str]=None
    lng:Optional[str]=None

class UserResponseModel(BaseModel):
    user_id: str
    username: str
    email: str
    mobile: int
    role: str
    address: List[AddressModel]
    is_active: bool
    created_at: str
    updated_at: str
    cart:Dict[str,CartItem]

class User(MongoDocument):
    user_id:Indexed(str,unique=True)
    email: Indexed(str,unique=True)
    username: Optional[str]
    password : str
    role: UserRoles
    mobile: Indexed(int,unique=True)
    cart: Optional[Dict[str,CartItem]] = {}
    address: Optional[List[AddressModel]] = []


    class Settings:
        name = "users"


    def generate_token(self,role):
        return jwt.encode({
            "user_id":self.user_id,
            "user_role": role,
            "exp":datetime.now(tz=pytz.UTC) + timedelta(days=7)
        },
            key=os.getenv("SECRET_KEY"),
            algorithm=os.getenv("ALGORITHM"))

    def check_password(self,password):
        return bcrypt.checkpw(password.encode('utf-8'),hashed_password=self.password.encode())







