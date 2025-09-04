import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from fastapi import UploadFile

import cloudinary.api

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)



async def get_product_images():
    result = cloudinary.Search().expression("resource_type:image").sort_by("public_id", "asc").max_results(100).execute()

    images = [
        {
            "public_id": item["public_id"],
            "secure_url": item["secure_url"]
        }
        for item in result.get("resources", [])
    ]

    return images, 0


async def upload_image_to_cloudinary(image: UploadFile, folder: str = "products"):
    try:
        result = cloudinary.uploader.upload(
            image.file,
            folder=folder
        )
        return result.get("secure_url")
    except Exception as e:
        raise Exception(f"Cloudinary upload failed: {str(e)}")


def get_cloudinary_upload_info():
    return {
        "cloud_name": os.getenv("CLOUDINARY_CLOUD_NAME"),
        "upload_preset": os.getenv("CLOUDINARY_UPLOAD_PRESET")
    }

def generate_cloudinary_url():
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    return f"https://api.cloudinary.com/v1_1/{cloud_name}/image/upload"