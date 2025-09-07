from itertools import product
from typing import Optional

from fastapi import APIRouter,  Query , HTTPException
from fastapi.params import Depends

from app.auth.auth_model import UserTokenPayload
from app.auth.auth_service import  check_roles
from app.products.products_model import ProductRequest, PresignedRequest
from app.products.products_service import create_products, get_image_urls, get_all_products


products_router = APIRouter()

@products_router.post('/create-products')
async def create_products_handler(req: ProductRequest, curr_user: UserTokenPayload = Depends(check_roles(["admin"]))):
    try:
        response,status_code = await create_products(
            req
        )
        if status_code == 0:
            return {"data":response,"status_code":status_code}
    except HTTPException as e:
         return {"error": e.detail, "status_code": e.status_code}





@products_router.get("/get-all-products")
async def handler_get_all_products(
        page: int = Query(1, ge=1),
        per_page: int = Query(40, ge=1, le=100),
        search: Optional[str] = Query(None),
        is_active: Optional[bool] = Query(None),
        curr_user: UserTokenPayload = Depends(check_roles())
):
    try:
        response, status_code = await get_all_products(
            page=page,
            per_page=per_page,
            search=search,

            is_active=is_active,
        )
        # response, status_code = await get_product_images()
        if status_code == 0:
            return {"data": response, "status_code": status_code}
        return {"error": response, "status_code": status_code}
    except HTTPException as e:
        return {"error": e.detail, "status_code": e.status_code}



@products_router.post("/get-image-url")
async def handler_get_presigned_urls(
        req: PresignedRequest,
        curr_user: UserTokenPayload = Depends(check_roles())
):
    try:
        response, status_code = await get_image_urls(object_names=req.files)
        if status_code == 0:
            return {"data":response,"status_code":status_code}
        return {"error":response,"status_code":status_code}
    except HTTPException as e:
        return {"error": e.detail, "status_code": e.status_code}






# @products_router.post("/upload-product-image")
# async def upload_product_image(image: UploadFile = File(...)):
#     try:
#         image_url = await upload_image_to_cloudinary(image)
#         return {"image_url": image_url}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))