import os
from typing import Optional
from uuid import uuid4

from fastapi import HTTPException

from app.products.products_model import ProductRequest, Products

from app.utils.s3_utils import generate_pre_signed_urls


async def create_products(product: ProductRequest):
    product_id = f"P{str(uuid4().int)[:10]}"
    urls = []
    img = []
    if product.img:
        for image in product.img:
            img_id = f"I{str(uuid4().int)[:6]}"
            obj = f"product/{product_id}/{img_id}"
            _,put_url = generate_pre_signed_urls(object_name=obj,bucket_name= os.getenv("config_s3_bucket"),type_of_req="put")
            img.append(obj)
            urls.append({"doc_type":image,"url":put_url})

    new_product = Products(
        product_id=product_id,
        name=product.name,
        description=product.description,
        key_features=product.key_features,
        img=img,
        brand=product.brand,
        hsn=product.hsn,
        packaging_type=None,
        category="general",
        seller_id=product.seller_id,
        measure_unit=product.measure_unit,
        stock=product.stock or 0,
    )

    await new_product.save()

    return {"product":new_product, "urls":urls}, 0


async def get_image_urls(object_names):
    response = []
    for object_name in object_names:
        get_url, _ = generate_pre_signed_urls(bucket_name=os.getenv("config_s3_bucket"),object_name=object_name,type_of_req="get")
        obj ={
            object_name:get_url
        }
        response.append(obj)
    return response,0


async def get_all_products(
        page: int = 1,
        per_page: int = 20,
        search: Optional[str] = None,
        is_active: Optional[bool] = None
):
    query = {}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}

    if is_active is not None:
        query["is_active"] = is_active


    products = (
        await Products.find(query)
        .sort("-product_id")
        .skip((page - 1) * per_page)
        .limit(per_page)
        .to_list()
    )

    return {
        "page": page,
        "per_page": per_page,
        "products": products,
    }, 0
