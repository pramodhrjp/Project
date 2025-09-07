from datetime import datetime
from typing import Literal, Dict, List, Optional

import pytz
from beanie import Indexed
from pydantic import BaseModel, Field

from app.cart.cart_model import ProductReq, CartItem
from app.database.base import MongoDocument
from app.user.user_model import AddressRequest

OrderStatus = Literal["ORDERED", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED"]

class DeliveryDetails(BaseModel):
    label:str
    delivery_by:datetime
    shipping_charge: float


class CreateOrderReq(BaseModel):
    products: List[ProductReq]
    delivery_address:AddressRequest
    delivery_details: DeliveryDetails


class AssignOrderReq(BaseModel):
    order_id:str
    warehouse_map: Dict[str, List[Dict]]


class OrderStatusReq(BaseModel):
    order_id:str
    invoice: Optional[str] = None


class CancelOrderReq(BaseModel):
    order_id:str
    reason: str


class StatusDetails(BaseModel):
    date: datetime = Field(
        default_factory=lambda: datetime.now(tz=pytz.UTC)
    )


class Order(MongoDocument):
    order_id:Indexed(str,unique=True)
    products:Dict[str,CartItem]
    user_id: str
    sub_total: float
    total_tax_amount: float
    total_price: float
    delivery_address: AddressRequest
    invoice: str
    status: OrderStatus = "PROCESSING"
    status_details: Dict[OrderStatus,StatusDetails]
    reason: Optional[str]=None
    delivery_details: Optional[DeliveryDetails] = None

    class Settings:
        name = "Orders"