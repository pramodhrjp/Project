from typing import Optional, List

from pydantic import BaseModel




class CartItem(BaseModel):
    product_id: str
    product_name: str
    selling_price: float
    quantity: int
    sub_total:float
    total_price: float
    img: Optional[str] = None
    tax_rate: Optional[float]


class ProductReq(BaseModel):
    product_id: str
    product_name: str
    tax_rate: float
    selling_price: float
    quantity: int
    img: Optional[str] = None




class CartItemResponse(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    selling_price: float
    sub_total: float
    total_price: float
    tax_rate: Optional[float]
    img: Optional[str]