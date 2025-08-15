import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { useToast } from './ui/use-toast';
import { supabase } from '../lib/supabaseClient';

// Zod schema for product editing
const productEditSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  image: z.string().url("Invalid URL"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
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
  stockQuantity: z.preprocess(
    (val) => Number(val),
    z.number().int().min(0).optional()
  ),
  product_owner_id: z.string().uuid("Invalid UUID format").optional(), // New field for product owner
});

type ProductEditForm = z.infer<typeof productEditSchema>;

interface ProductEditDialogProps {
  product: any;
  categories: any[];
  isOpen: boolean;
  onClose: () => void;
}

const ProductEditDialog: React.FC<ProductEditDialogProps> = ({
  product,
  categories,
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const productForm = useForm<ProductEditForm>({
    resolver: zodResolver(productEditSchema),
    defaultValues: {
      name: product?.name || '',
      price: product?.price?.toString() || '',
      image: product?.image || '',
      description: product?.description || product?.shortDescription || '',
      category: product?.category_id || '',
      rating: product?.rating || 0,
      reviews: product?.reviews || 0,
      badge: product?.badge || '',
      badgeColor: product?.badgeColor || '',
      details: Array.isArray(product?.details) ? product.details : [],
      stockQuantity: product?.stockQuantity || 0,
      product_owner_id: product?.product_owner_id || '', // Initialize with existing value
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (updatedProduct: ProductEditForm) => {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: updatedProduct.name,
          price: parseFloat(updatedProduct.price),
          image: updatedProduct.image,
          description: updatedProduct.description,
          category_id: updatedProduct.category,
          rating: updatedProduct.rating,
          reviews: updatedProduct.reviews,
          badge: updatedProduct.badge,
          badgeColor: updatedProduct.badgeColor,
          details: updatedProduct.details ? [updatedProduct.details] : [],
          stockQuantity: updatedProduct.stockQuantity,
          product_owner_id: updatedProduct.product_owner_id, // Include the new field
        })
        .eq('id', product.id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Product updated",
        description: "Product has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductEditForm) => {
    updateProductMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-slate-50 border-blue-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the product details below and click Save Changes.
          </DialogDescription>
        </DialogHeader>
        <Form {...productForm}>
          <form onSubmit={productForm.handleSubmit(onSubmit)} className="space-y-4">
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
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
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
              <FormField
                control={productForm.control}
                name="product_owner_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Owner ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter UUID of product owner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            
            <FormField
              control={productForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
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
                  <FormLabel>Product Details (comma-separated)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      value={Array.isArray(field.value) ? field.value.join(', ') : field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateProductMutation.isPending}>
                {updateProductMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditDialog;