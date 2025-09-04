import os

import beanie
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.products.products_model import Products
from app.user.user_model import User

MONGO_URI = os.getenv("MONGO_URI")

print(MONGO_URI)

async def get_db_connection():
    database_name = "parishudh"
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[database_name]
    await init_beanie(
        database=db,
        document_models=[User,Products]
    )