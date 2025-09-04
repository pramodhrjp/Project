🛒 Parishudh B2B Ordering Platform

A B2B bulk ordering web application where users can browse products, manage cart items, and place large orders — all in one streamlined interface.

📦 Features
- JWT-based login & logout. Only registered users can access protected routes
- Admin Dashboard for uploading product images
- Product Listing with dynamic search
- Cart Management with quantity selection and auto price calculation
- Order Placement with payment dialog simulation
- Product Images dynamically fetched from backend

Backend Setup (FastAPI)
  cd backend_capstone
  python -m venv venv
  source venv/bin/activate       
  pip install -r requirements.txt

RUN THE FAST API SERVER
uvicorn main:app --reload

Frontend Setup (React)
cd frontend_capstone/shopping_client
npm install
npm run dev
Runs at: http://localhost:5173


Create a .env file inside shopping_client/:
VITE_API_URL=http://localhost:8000
Then use it in frontend code.
