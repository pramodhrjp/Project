from typing import Optional, List, Literal

from pydantic import BaseModel

from app.database.base import MongoDocument




UNIT = Literal["GM","ML"]

class Products(MongoDocument):
    name: str
    product_id: str
    description: Optional[str] = None
    key_features: Optional[str] = None
    img: Optional[List[str]] = None
    brand: Optional[str] = None
    hsn: Optional[int] = None
    packaging_type: Optional[str] = None
    # Sku_id: Optional[str] = None
    seller_id: Optional[float] = None
    measure_unit: Optional[UNIT] = None
    mrp: Optional[float] = None
    selling_price: Optional[float] = None
    stock: Optional[float] = None

    class Settings:
        name = "products"

class ProductRequest(BaseModel):
    name: str
    description: str
    key_features: str
    img: List[str]
    brand: str
    mrp: Optional[float] = None
    selling_price: float
    cost_price: Optional[float] = None
    hsn: str
    measure_unit: UNIT
    tax_rate: int
    quantity_unit: int
    seller_id: Optional[str] = ""
    stock: Optional[int] = 0

class PresignedRequest(BaseModel):
    files: List[str]



