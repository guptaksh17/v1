
import React, { useState } from 'react';
import { Plus, Minus, Edit, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
}

interface InventoryManagerProps {
  products: Product[];
  onUpdateStock: (id: string, newStock: number) => void;
  onDeleteProduct: (id: string) => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ 
  products, 
  onUpdateStock, 
  onDeleteProduct 
}) => {
  const [editingStock, setEditingStock] = useState<{[key: string]: number}>({});
  const { toast } = useToast();

  const handleStockChange = (productId: string, change: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newStock = Math.max(0, product.stock + change);
      onUpdateStock(productId, newStock);
      toast({
        title: "Stock Updated",
        description: `${product.name} stock updated to ${newStock}`,
      });
    }
  };

  const handleSetStock = (productId: string) => {
    const newStock = editingStock[productId];
    if (newStock !== undefined && newStock >= 0) {
      onUpdateStock(productId, newStock);
      setEditingStock({...editingStock, [productId]: undefined});
      const product = products.find(p => p.id === productId);
      toast({
        title: "Stock Set",
        description: `${product?.name} stock set to ${newStock}`,
      });
    }
  };

  const handleDeleteProduct = (product: Product) => {
    onDeleteProduct(product.id);
    toast({
      title: "Product Deleted",
      description: `${product.name} has been removed from inventory`,
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-500">
            Total Products: {products.length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className={product.stock <= 5 ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-12 w-12 rounded-md object-cover" src={product.image} alt={product.name} />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.stock}
                      </span>
                      {product.stock <= 5 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStockChange(product.id, -1)}
                        disabled={product.stock <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center space-x-1">
                        <Input
                          type="number"
                          min="0"
                          className="w-20 text-center"
                          placeholder={product.stock.toString()}
                          value={editingStock[product.id] || ''}
                          onChange={(e) => setEditingStock({
                            ...editingStock,
                            [product.id]: parseInt(e.target.value) || 0
                          })}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSetStock(product.id)}
                          disabled={editingStock[product.id] === undefined}
                        >
                          Set
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStockChange(product.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Product</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete "{product.name}"? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline">Cancel</Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => handleDeleteProduct(product)}
                          >
                            Delete
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;
