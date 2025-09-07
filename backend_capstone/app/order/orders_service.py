from uuid import uuid4

from fastapi import HTTPException

from app.cart.cart_model import CartItem
from app.cart.cart_service import delete_all_cart_item
from app.order.orders_model import CreateOrderReq, Order, StatusDetails
from app.products.products_model import Products
from app.user.user_model import User


def calculate_taxes(selling_price: float, quantity: int, tax_rate: float = 5.0):
    return ((selling_price * tax_rate) / 100) * quantity



async def create_order(user_id: str, request: CreateOrderReq):
    if not request.products:
        raise HTTPException(status_code=400, detail="No products in order")

    user = await User.find_one({"user_id": user_id, "is_active": True})
    if not user:
        raise HTTPException(status_code=401, detail="No User Found")

    product_ids = [item.product_id for item in request.products]

    product_map = {
        p.product_id: p
        for p in await Products.find({"product_id": {"$in": product_ids}}).to_list()
    }
    order_products = {}
    total_tax = total_price = sub_total = 0.0

    for item in request.products:
        product = product_map.get(item.product_id)

        if not product:
            await delete_all_cart_item(product_id=item.product_id, user_id=user_id)
            raise HTTPException(status_code=402, detail=f"Product '{item.product_name}' not found")

        total_available_stock = 0
        if total_available_stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for '{item.product_name}'")

        tax_amount = calculate_taxes(selling_price=item.selling_price,quantity=item.quantity)
        item_sub_total = item.quantity * item.selling_price
        item_total_tax = tax_amount
        item_total_price = item_sub_total + item_total_tax

        order_products[item.product_id] = CartItem(
            product_id=item.product_id,
            product_name=item.product_name,
            quantity=item.quantity,
            selling_price=item.selling_price,
            sub_total=round(item_sub_total, 2),
            tax_rate=item.tax_rate,
            total_price=round(item_total_price, 2),
        )

        sub_total += item_sub_total
        total_tax += item_total_tax
        total_price += item_total_price

    total_price += request.delivery_details.shipping_charge
    order_id = f"O{str(uuid4().int)[:6]}"
    request.delivery_address.mobile = request.delivery_address.mobile or user.mobile

    order = Order(
        order_id=order_id,
        user_id=user_id,
        products=order_products,
        sub_total=round(sub_total, 2),
        total_tax_amount=round(total_tax, 2),
        total_price=round(total_price, 2),
        delivery_address=request.delivery_address,
        invoice="",
        status="PROCESSING",
        status_details={"PROCESSING": StatusDetails()},
        delivery_details=request.delivery_details
    )
    await order.save()
    user.cart = {}
    await user.save()

    user.address = [a for a in user.address if a.is_active]
    return {"user":user,"order":order}, 0
