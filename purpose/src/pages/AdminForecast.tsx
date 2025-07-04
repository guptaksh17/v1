import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import { useUser } from '@supabase/auth-helpers-react';

interface Product {
  id: string;
  name: string;
  category: string;
}

interface ForecastData {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
}

interface ForecastResponse {
  forecast?: ForecastData[];
  historical_data_points?: number;
  error?: string;
}

export default function AdminForecast() {
  const user = useUser();
  const { isAdmin, isLoading } = useUserRole(user);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [periods, setPeriods] = useState<number>(4);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [historicalDataPoints, setHistoricalDataPoints] = useState<number>(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
    }
  };

  const generateForecast = async () => {
    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: selectedProduct,
          periods: periods
        }),
      });

      const data: ForecastResponse = await response.json();

      if (data.error) {
        setError(data.error);
        setForecastData([]);
      } else if (data.forecast) {
        setForecastData(data.forecast);
        setHistoricalDataPoints(data.historical_data_points || 0);
      }
    } catch (err) {
      console.error('Error generating forecast:', err);
      setError('Failed to generate forecast. Make sure the forecasting API is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const selectedProductName = products.find(p => p.id === selectedProduct)?.name || '';

  // Redirect if not admin - moved after all hooks
  if (!isLoading && !isAdmin) {
    console.log('User is not admin, redirecting to /');
    console.log('User email:', user?.email);
    console.log('Is admin:', isAdmin);
    console.log('Is loading:', isLoading);
    return <Navigate to="/" replace />;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Demand Forecasting</h1>
          <p className="text-muted-foreground">
            Predict future demand for your products using AI-powered forecasting
          </p>
        </div>
        <Badge variant="secondary">
          {historicalDataPoints} historical data points
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Forecast</CardTitle>
          <CardDescription>
            Select a product and time period to generate demand predictions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="periods">Forecast Periods (weeks)</Label>
              <Input
                id="periods"
                type="number"
                min="1"
                max="52"
                value={periods}
                onChange={(e) => setPeriods(parseInt(e.target.value) || 4)}
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                onClick={generateForecast} 
                disabled={isGenerating || !selectedProduct}
                className="w-full"
              >
                {isGenerating ? 'Generating...' : 'Generate Forecast'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {forecastData.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Forecast Chart</CardTitle>
              <CardDescription>
                Predicted demand for {selectedProductName} over the next {periods} weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="ds" 
                      tickFormatter={formatDate}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={formatDate}
                      formatter={(value: number) => [value.toFixed(2), 'Predicted Demand']}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="yhat"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                      name="Predicted Demand"
                    />
                    <Line
                      type="monotone"
                      dataKey="yhat_lower"
                      stroke="#82ca9d"
                      strokeDasharray="5 5"
                      name="Lower Bound"
                    />
                    <Line
                      type="monotone"
                      dataKey="yhat_upper"
                      stroke="#ffc658"
                      strokeDasharray="5 5"
                      name="Upper Bound"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Forecast Data</CardTitle>
              <CardDescription>
                Detailed weekly predictions with confidence intervals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week</TableHead>
                    <TableHead>Predicted Demand</TableHead>
                    <TableHead>Lower Bound</TableHead>
                    <TableHead>Upper Bound</TableHead>
                    <TableHead>Confidence Range</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecastData.map((forecast, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {formatDate(forecast.ds)}
                      </TableCell>
                      <TableCell>{forecast.yhat.toFixed(2)}</TableCell>
                      <TableCell>{Math.max(0, forecast.yhat_lower).toFixed(2)}</TableCell>
                      <TableCell>{forecast.yhat_upper.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          ±{((forecast.yhat_upper - forecast.yhat_lower) / 2).toFixed(2)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 