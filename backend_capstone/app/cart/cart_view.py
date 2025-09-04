from fastapi import APIRouter, Depends, HTTPException

from app.auth.auth_model import UserTokenPayload
from app.auth.auth_service import check_roles
from app.cart.cart_model import ProductReq
from app.cart.cart_service import add_to_cart, delete_all_cart_item
from app.user.user_model import User

cart_router = APIRouter()

@cart_router.post("/add-cart-item")
async def handler_add_to_cart(
        req: ProductReq,
        current_user: UserTokenPayload = Depends(check_roles())
):
    response,status_code = await add_to_cart(user_id=current_user.user_id,request = req)
    if status_code == 0:
        return {"data":response.dict(),"status_code":status_code}
    raise HTTPException(status_code=400, detail="Failed to add item to cart")


@cart_router.get("/get-cart-items")
async def handler_get_cart_items(
        current_user: UserTokenPayload = Depends(check_roles())
):
    user = await User.find_one({"user_id": current_user.user_id, "is_active": True})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    cart_items = list(user.cart.values()) if user.cart else []
    return {
        "data": [item.model_dump() for item in cart_items],
        "status_code": 0
    }

@cart_router.delete("/delete-cart-item/{product_id}")
async def handler_delete_cart_item(
        product_id: str,
        current_user: UserTokenPayload = Depends(check_roles())
):
    result, status_code = await delete_all_cart_item(product_id=product_id, user_id=current_user.user_id)
    if status_code == 0:
        return {"message": result, "status_code": 0}
    raise HTTPException(status_code=400, detail=result)