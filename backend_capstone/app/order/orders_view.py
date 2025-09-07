

from fastapi import APIRouter, Depends, HTTPException

from app.auth.auth_model import UserTokenPayload
from app.auth.auth_service import check_roles
from app.order.orders_model import CreateOrderReq
from app.order.orders_service import create_order

order_router = APIRouter()




@order_router.post("/create-order")
async def handler_create_order(
        req:CreateOrderReq,
        current_user: UserTokenPayload = Depends(check_roles())
):
    try:
        response,status_code = await create_order(user_id=current_user.user_id,request = req)
        if status_code == 0:
            return {"data":response,"status_code":status_code}
        return {"error":response,"status_code":status_code}
    except HTTPException as e:
        return {"error": e.detail, "status_code": e.status_code}