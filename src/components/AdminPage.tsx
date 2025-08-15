import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useToast } from './ui/use-toast';
import { ShoppingCart, Package, Users, Edit, Eye, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAdminOrdersQuery, useAdminProductsQuery, useCategoriesQuery, AdminOrder } from '../lib/utils';
import { useTotalCustomersQuery } from '../lib/queries';
import OrderStatusTabs from './OrderStatusTabs';
import ProductEditDialog from './ProductEditDialog';
import ProductViewDialog from './ProductViewDialog';
import ProductCard from './ProductCard';

// Mock API functions (replace with actual API calls)
// Mock API functions (replace with actual API calls)
const mockApiRequest = async (method: string, url: string, data?: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Mock API: ${method} ${url}`, data);
      resolve({});
    }, 500);
  });
};



// Zod schemas
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  image: z.string().url("Invalid URL"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"), // holds category_id UUID from categories table
  rating: z.preprocess(
    (val) => Number(val),
    z.number().min(0).max(5).optional()
  ),
  reviews: z.preprocess(
    (val) => Number(val),
    z.number().int().min(0).optional()
  ),
  badge: z.string().optional(),
  badgeColor: z.string().optional(),
  details: z.preprocess(
    (val) => (typeof val === 'string' && val.length > 0 ? val.split(',').map(s => s.trim()) : []),
    z.array(z.string()).optional()
  ),
});

type ProductForm = z.infer<typeof productSchema>;

interface AdminPageProps {
  setCurrentPage: (page: string) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ setCurrentPage }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Mock authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function checkUserAndRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsAuthenticated(true);
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('Error fetching user role:', profileError);
            setUserRole(null);
          } else if (profileData) {
            setUserRole(profileData.role);
          }
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error checking user authentication:', error);
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkUserAndRole();
  }, []);

  // Use React Query for data fetching with automatic refetching
  const { 
    data: orders = [], 
    isLoading: ordersLoading, 
    error: ordersError,
    refetch: refetchOrders 
  } = useAdminOrdersQuery(isAuthenticated && userRole === 'admin');

  const { 
    data: products = [], 
    isLoading: productsLoading, 
    error: productsError,
    refetch: refetchProducts 
  } = useAdminProductsQuery(isAuthenticated && userRole === 'admin');

  const { 
    data: categories = [], 
    isLoading: categoriesLoading, 
    error: categoriesError,
    refetch: refetchCategories 
  } = useCategoriesQuery(isAuthenticated && userRole === 'admin');

  const { 
    data: totalCustomers, 
    isLoading: customersLoading, 
    error: customersError,
    refetch: refetchCustomers 
  } = useTotalCustomersQuery(isAuthenticated && userRole === 'admin');

  // Manual refetch functions
  const handleRefetchOrders = async () => {
    await refetchOrders();
  };

  const handleRefetchProducts = async () => {
    await refetchProducts();
  };

  const handleRefetchCategories = async () => {
    await refetchCategories();
  };

  // Product form
  const productForm = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: '',
      image: '',
      description: '',
      category: '', // stores category_id
      rating: 0,
      reviews: 0,
      badge: '',
      badgeColor: '',
      details: [],
    },
  });

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (newProduct: ProductForm) => {
      const { data, error } = await supabase.from('products').insert([
        {
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          image: newProduct.image,
          description: newProduct.description,
          category_id: newProduct.category,
          rating: newProduct.rating,
          reviews: newProduct.reviews,
          badge: newProduct.badge,
          badgeColor: newProduct.badgeColor,
          details: newProduct.details ? [newProduct.details] : [],
        },
      ]);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Product added",
        description: "New product has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      setIsAddProductOpen(false);
      productForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmitProduct = (data: ProductForm) => {
    addProductMutation.mutate(data);
  };

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      console.log(`Attempting to update order ${id} to status: ${status}`);
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);
      if (error) {
        console.error(`Supabase update error for order ${id}:`, error);
        throw error;
      }
      console.log(`Supabase update result for order ${id}:`, { data });
      return data;
    },
    onSuccess: (data, variables) => {
      console.log(`Order ${variables.id} status updated successfully to ${variables.status}.`, data);
      toast({
        title: "Order updated",
        description: "Order status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
    onError: (error, variables) => {
      console.error(`Failed to update order ${variables.id} to status ${variables.status}:`, error);
      // Add more detailed error logging
      console.error("Full error object:", JSON.stringify(error, null, 2));
      toast({
        title: "Error",
        description: `Failed to update order status: ${error.message}. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (orderId: string, status: string, userId: string | null) => {
    console.log(`handleStatusChange called for Order ID: ${orderId}, Status: ${status}, User ID: ${userId}`);
    updateOrderStatusMutation.mutate({ id: orderId, status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Product management handlers
  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
    setSelectedProduct(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-gray-600">Loading admin panel...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to view the admin panel.</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You do not have administrative privileges to access this page.</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalOrders = orders?.length || 0;
  const totalProducts = products?.length || 0;
  const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Refresh Buttons */}
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={handleRefetchOrders} 
            disabled={ordersLoading}
            variant="outline"
          >
            {ordersLoading ? 'Refreshing...' : 'Refresh Orders'}
          </Button>
          <Button 
            onClick={handleRefetchProducts} 
            disabled={productsLoading}
            variant="outline"
          >
            {productsLoading ? 'Refreshing...' : 'Refresh Products'}
          </Button>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">Debug Information:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Authenticated:</span> {isAuthenticated ? 'Yes' : 'No'}
            </div>
            <div>
              <span className="font-medium">User Role:</span> {userRole || 'None'}
            </div>
            <div>
              <span className="font-medium">Orders Count:</span> {orders?.length || 0}
            </div>
            <div>
              <span className="font-medium">Orders Loading:</span> {ordersLoading ? 'Yes' : 'No'}
            </div>
          </div>
          {ordersError && (
            <div className="mt-2 text-red-600">
              <span className="font-medium">Orders Error:</span> {ordersError.message}
            </div>
          )}
          {orders && orders.length > 0 && orders[0]._note && (
            <div className="mt-2 text-blue-600 text-xs">
              <strong>Database Note:</strong> {orders[0]._note}
            </div>
          )}
          <div className="mt-2 text-blue-600 text-xs">
            <strong>Note:</strong> If you see "No items details available", the orders table may not have an items field or the order_items table may not exist.
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button>Add New Product</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-slate-50 border-blue-100">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Fill in the product details below and click Add Product to save.</DialogDescription>
              </DialogHeader>
              <Form {...productForm}>
                <form onSubmit={productForm.handleSubmit(onSubmitProduct)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={productForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rating</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" min="0" max="5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="reviews"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Reviews</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="badge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Badge Text</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="badgeColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Badge Color</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={productForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={productForm.control}
                    name="details"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Details</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-3 gap-4">
                    
                  </div>
                  
                  <FormField
                    control={productForm.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={addProductMutation.isPending}>
                      {addProductMutation.isPending ? 'Adding...' : 'Add Product'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-primary-900">{totalOrders}</p>
                  {ordersError && (
                    <p className="text-xs text-red-600 mt-1">Error: {ordersError.message}</p>
                  )}
                </div>
                <ShoppingCart className="h-8 w-8 text-primary-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-primary-900">{totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-primary-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-primary-900">{customersLoading ? '...' : totalCustomers}</p>
                  {customersError && (
                    <p className="text-xs text-red-600 mt-1">Error: {customersError.message}</p>
                  )}
                </div>
                <Users className="h-8 w-8 text-primary-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-primary-900">{pendingOrders}</p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">⏳</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <OrderStatusTabs 
              orders={orders}
              onStatusChange={handleStatusChange}
              getStatusColor={getStatusColor}
            />
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
              </CardHeader>
              <CardContent>
                {products?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No products found. Add some using the button above.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products?.map((product: any) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onEdit={handleEditProduct}
                        onView={handleViewProduct}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Product Edit Dialog */}
        {selectedProduct && (
          <ProductEditDialog
            product={selectedProduct}
            categories={categories || []}
            isOpen={isEditDialogOpen}
            onClose={handleCloseEditDialog}
          />
        )}

        {/* Product View Dialog */}
        {selectedProduct && (
          <ProductViewDialog
            product={selectedProduct}
            categories={categories || []}
            isOpen={isViewDialogOpen}
            onClose={handleCloseViewDialog}
          />
        )}
      </div>
    </div>
  );
}

export default AdminPage;