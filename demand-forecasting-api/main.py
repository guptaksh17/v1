from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prophet import Prophet
import pandas as pd
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import traceback

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080", "http://localhost:8081", "http://localhost:8082"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ForecastRequest(BaseModel):
    product_id: str
    periods: int = 12  # weeks

@app.get("/orders")
def get_orders():
    """Debug endpoint to see all orders"""
    try:
        response = supabase.table("orders").select("*").execute()
        return {"orders": response.data, "count": len(response.data)}
    except Exception as e:
        return {"error": str(e), "traceback": traceback.format_exc()}

@app.get("/products")
def get_products():
    """Debug endpoint to see all products"""
    try:
        response = supabase.table("products").select("id, name").execute()
        return {"products": response.data, "count": len(response.data)}
    except Exception as e:
        return {"error": str(e), "traceback": traceback.format_exc()}

@app.post("/forecast")
def forecast(req: ForecastRequest):
    try:
        # Fetch order data for the product
        response = supabase.table("orders").select("*").eq("product_id", req.product_id).execute()
        orders = response.data
        
        if not orders:
            return {"error": f"No data found for product_id: {req.product_id}"}

        # Prepare data for Prophet
        df = pd.DataFrame(orders)
        # Fix datetime parsing with ISO8601 format
        df['order_timestamp'] = pd.to_datetime(df['order_timestamp'], format='ISO8601')
        df = df.groupby(pd.Grouper(key='order_timestamp', freq='W')).agg({'quantity': 'sum'}).reset_index()
        df = df.rename(columns={'order_timestamp': 'ds', 'quantity': 'y'})
        # Remove timezone info for Prophet compatibility
        df['ds'] = df['ds'].dt.tz_localize(None)

        # Check for enough data
        if df.shape[0] < 2:
            return {"error": "Not enough data to make a prediction. At least 2 weeks of sales are required.", "data_points": df.shape[0]}

        # Train Prophet
        m = Prophet()
        m.fit(df)

        # Predict future demand
        future = m.make_future_dataframe(periods=req.periods, freq='W')
        forecast = m.predict(future)
        result = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(req.periods).to_dict(orient='records')
        return {"forecast": result, "historical_data_points": df.shape[0]}
        
    except Exception as e:
        return {"error": str(e), "traceback": traceback.format_exc()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 