import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Star, Package, Tag, Image as ImageIcon } from 'lucide-react';

interface ProductViewDialogProps {
  product: any;
  categories: any[];
  isOpen: boolean;
  onClose: () => void;
}

const ProductViewDialog: React.FC<ProductViewDialogProps> = ({
  product,
  categories,
  isOpen,
  onClose,
}) => {
  if (!product) return null;

  const categoryName = categories?.find(cat => cat.id === product.category_id)?.name || 'Unknown Category';
  const productImage = product.image || '/placeholder-product.jpg';
  const productDescription = product.description || product.shortDescription || 'No description available';
  const productDetails = Array.isArray(product.details) ? product.details : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-white border-gray-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Product Details</DialogTitle>
          <DialogDescription>
            Complete information about {product.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                  <img 
                    src={productImage} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Badge Information */}
            {product.badge && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Badge:</span>
                    <Badge 
                      style={{ backgroundColor: product.badgeColor || '#3B82F6' }}
                      className="text-white"
                    >
                      {product.badge}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Product Information */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">Category: {categoryName}</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${parseFloat(product.price || 0).toFixed(2)}
                  </p>
                </div>
                
                {/* Rating and Reviews */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">
                      {product.rating || 0} ({product.reviews || 0} reviews)
                    </span>
                  </div>
                </div>
                
                {/* Stock Information */}
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    Stock: {product.stockQuantity || 0} units
                  </span>
                </div>
                
                {/* Product ID */}
                <div className="text-xs text-gray-500">
                  Product ID: {product.id}
                </div>
              </CardContent>
            </Card>
            
            {/* Description */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {productDescription}
                </p>
              </CardContent>
            </Card>
            
            {/* Product Details */}
            {productDetails.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Product Details</h4>
                  <ul className="space-y-1">
                    {productDetails.map((detail: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductViewDialog;