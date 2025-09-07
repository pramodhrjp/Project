import uvicorn
from dotenv import load_dotenv
from  fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.cart.cart_view import cart_router
from app.database.db_core import get_db_connection
from app.products.products_view import products_router
from app.user.user_view import user_router

app = FastAPI()



async def start_db():
    await get_db_connection()


async def close_db():
    print("Shutting down API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://parishudh.vercel.app" ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_event_handler("startup",start_db)
app.add_event_handler("shutdown",close_db)

app.include_router(user_router,prefix="/api/v1/user")
app.include_router(products_router, prefix="/api/v1/products")
app.include_router(cart_router, prefix="/api/v1/cart")



if __name__ == "__main__":
    uvicorn.run(app,host="0.0.0.0",port=8000)


