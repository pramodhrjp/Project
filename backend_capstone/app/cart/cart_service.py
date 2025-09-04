from fastapi import HTTPException
from app.cart.cart_model import ProductReq, CartItem
from app.products.products_model import Products
from app.user.user_model import User

async def add_to_cart(user_id: str, request: ProductReq):
    user = await User.find_one({"user_id": user_id, "is_active": True})
    if not user:
        raise HTTPException(status_code=401, detail="No User Found")

    # active_address = next((addr for addr in user.address if addr.is_active), None)
    # if not active_address or not active_address.pincode:
    #     raise HTTPException(status_code=400, detail="No valid delivery pincode found")

    product = await Products.find_one({"product_id": request.product_id})
    if not product:
        await delete_all_cart_item(product_id=request.product_id, user_id=user_id)
        raise HTTPException(status_code=404, detail="Product not found")

    if request.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    sub_total = round(request.selling_price * request.quantity, 2)
    total_price = round(sub_total, 2)

    item = user.cart.get(request.product_id)
    if item:
        item.quantity = request.quantity
        item.product_name = request.product_name
        item.selling_price = request.selling_price
        item.tax_rate = request.tax_rate
        item.img = request.img
        item.sub_total = sub_total
        item.total_price = total_price
    else:
        user.cart[request.product_id] = CartItem(
            product_id=request.product_id,
            product_name=request.product_name,
            quantity=request.quantity,
            selling_price=request.selling_price,
            tax_rate=request.tax_rate,
            sub_total=sub_total,
            total_price=total_price,
            img=request.img
        )

    await user.save()
    user.address = [addr for addr in user.address if addr.is_active]
    return user.cart[request.product_id], 0


async def delete_all_cart_item(product_id: str, user_id: str):
    user = await User.find_one({"user_id": user_id, "is_active": True})
    if not user:
        raise HTTPException(status_code=401, detail="No User Found")

    item = user.cart.get(product_id)
    if not item:
        return "Item not in cart", 404

    del user.cart[product_id]
    await user.save()
    return "Item removed", 0
