import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  ShoppingCart, 
  Heart, 
  X,
  MapPin, 
  Calendar, 
  Ruler, 
  Palette,
  Star,
  Info,
  Package,
  Award
} from "lucide-react";
import { Product } from "@/lib/types";

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
  isAddingToCart?: boolean;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  isAddingToCart = false
}) => {
  const isOnSale = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
  const discountPercentage = isOnSale 
    ? Math.round(((parseFloat(product.originalPrice!) - parseFloat(product.price)) / parseFloat(product.originalPrice!)) * 100)
    : 0;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold text-primary">Quick View</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* Image */}
              <div className="relative">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-80 md:h-96 object-cover rounded-lg"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.isFeatured && (
                    <Badge className="bg-secondary text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {product.isBestSeller && (
                    <Badge className="bg-primary text-white">
                      <Award className="w-3 h-3 mr-1" />
                      Best Seller
                    </Badge>
                  )}
                  {isOnSale && (
                    <Badge className="bg-red-500 text-white">
                      -{discountPercentage}% OFF
                    </Badge>
                  )}
                </div>

                {/* Stock indicator */}
                {product.inStock && product.stockQuantity <= 3 && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                      <Package className="w-3 h-3 mr-1" />
                      Only {product.stockQuantity} left
                    </Badge>
                  </div>
                )}

                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <Badge variant="destructive" className="text-lg py-2 px-4">
                      Sold Out
                    </Badge>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-4">
                {/* Era and Condition */}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-accent/20 text-accent">
                    <Calendar className="w-3 h-3 mr-1" />
                    {product.era}
                  </Badge>
                  {product.condition && (
                    <Badge variant="outline">
                      {product.condition}
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

                {/* Price */}
                <div className="flex items-center gap-3">
                  {isOnSale ? (
                    <>
                      <div className="font-bold text-primary text-3xl">£{parseFloat(product.price).toFixed(2)}</div>
                      <div className="text-lg text-gray-500 line-through">£{parseFloat(product.originalPrice!).toFixed(2)}</div>
                    </>
                  ) : (
                    <div className="font-bold text-primary text-3xl">£{parseFloat(product.price).toFixed(2)}</div>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Description
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Details */}
                <div className="grid grid-cols-1 gap-3 text-sm">
                  {product.origin && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Origin:</span>
                      <span className="text-gray-600">{product.origin}</span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Dimensions:</span>
                      <span className="text-gray-600">{product.dimensions}</span>
                    </div>
                  )}
                  {product.materials && product.materials.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Palette className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="font-medium">Materials:</span>
                      <span className="text-gray-600">{product.materials.join(", ")}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    className="flex-1"
                    disabled={isAddingToCart || !product.inStock}
                    onClick={handleAddToCart}
                  >
                    {isAddingToCart ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        ✓
                      </motion.div>
                    ) : (
                      <ShoppingCart className="w-4 h-4 mr-2" />
                    )}
                    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>

                {/* Category and link to full product */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Category: <span className="text-primary font-medium">{product.categoryName}</span>
                    </div>
                    <a 
                      href={`/product/${product.id}`}
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      View Full Details →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;