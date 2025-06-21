"use client";

import React, { useEffect, useState } from "react";
import { DepositModal } from "swypt-checkout";
import { ShoppingCart, Instagram, Twitter, Facebook, X, Star, Heart, Sparkles } from "lucide-react";
import "swypt-checkout/dist/styles.css";
import { useRouter } from "next/navigation";
import axios from "axios";


// Type definitions
interface Product {
  id: string;
  name: string;
  description: string;
  imageurl: string;
  price: number;
  category: string;
  rating: number;
  bestseller?: boolean;
  new?: boolean;
  quantity?: number; 
  walletaddressed?: string; 

}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  total: number;
}

interface CartIconProps {
  itemCount: number;
  onClick: () => void;
}

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  onDashboardClick: () => void;

}

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  isSelected: boolean;
}

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}


const CartPanel: React.FC<CartPanelProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onCheckout,
  total,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity z-40"
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 
        transform transition-transform duration-500 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-green-50 to-white">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Your Cart</h3>
              <p className="text-sm text-gray-500">{items.length} beautiful items</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/80 rounded-full transition-all duration-200"
              type="button"
            >
              <X size={22} className="text-gray-600" />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart size={32} className="text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Cart is empty</h4>
              <p className="text-gray-500 text-center">Add some beautiful products to get started!</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {items.map((item: CartItem, index) => (
                    <div
                      key={item.product.id}
                      className={`bg-gray-50 rounded-xl p-4 transform transition-all duration-300 hover:shadow-md ${
                        index % 2 === 0 ? 'animate-fadeInLeft' : 'animate-fadeInRight'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <img
                            src={item.product.imageurl}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg shadow-sm"
                          />
                          {item.product.bestseller && (
                            <Star size={12} className="absolute -top-1 -right-1 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-green-600 font-medium">
                            KES {item.product.price.toLocaleString()}
                          </p>
                          <span className="inline-block text-xs text-gray-500 bg-white px-2 py-1 rounded-full mt-1">
                            {item.product.quantity}
                          </span>
                          <span className="inline-block text-xs text-gray-500 bg-white px-2 py-1 rounded-full mt-1">
                            {item.product.category}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded-full">
                            ×{item.quantity}
                          </span>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t bg-gradient-to-r from-green-50 to-white p-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    KES {total.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={onCheckout}
                  className="w-full bg-gradient-to-r from-green-600 via-green-700 to-black text-white py-4 px-6 
                  rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 
                  transform hover:scale-[1.02] hover:-translate-y-1"
                  type="button"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles size={20} />
                    Complete Purchase
                    <Sparkles size={20} />
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const CartIcon: React.FC<CartIconProps> = ({ itemCount, onClick }) => (
  <button
    onClick={onClick}
    className="relative p-3 text-white hover:text-green-200 transition-all duration-200 group"
    type="button"
    aria-label={`Shopping cart with ${itemCount} items`}
  >
    <ShoppingCart size={24} className="group-hover:scale-110 transition-transform duration-200" />
    {itemCount > 0 && (
      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-green-400 to-green-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold shadow-lg animate-pulse">
        {itemCount}
      </span>
    )}
  </button>
);

const SocialIcons: React.FC = () => (
  <div className="flex items-center gap-3">
    <a 
      href="#" 
      className="text-white hover:text-green-200 transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-white/10"
      aria-label="Instagram"
    >
      <Instagram size={18} />
    </a>
    <a 
      href="#" 
      className="text-white hover:text-green-200 transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-white/10"
      aria-label="Twitter"
    >
      <Twitter size={18} />
    </a>
    <a 
      href="#" 
      className="text-white hover:text-green-200 transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-white/10"
      aria-label="Facebook"
    >
      <Facebook size={18} />
    </a>
  </div>
);

const ToMerchantDashboard: React.FC<{ onClick: () => void }> = ({ onClick }) => {

  return (
    <button
      onClick={onClick}
      className="md:flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full 
      text-sm font-medium transition-all duration-200 hover:scale-105 border border-white/20"
      type="button"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
      Merchant Dashboard
    </button>
  );
};

const Header: React.FC<HeaderProps> = ({ cartItemCount, onCartClick , onDashboardClick }) => (

  <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-black via-gray-900 to-green-800 backdrop-blur-lg border-b border-white/10 shadow-xl">
    <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-white to-green-50 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
            <span className="text-green-600 font-black text-xl transform -rotate-3">K</span>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Kifaru Beauty</h1>
          <p className="text-green-200 text-xs font-medium">Premium Beauty Collection</p>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <CartIcon itemCount={cartItemCount} onClick={onCartClick} />
        <SocialIcons />
        <ToMerchantDashboard onClick={onDashboardClick} />
      </div>
    </div>
  </header>
);



const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, isSelected }) => (
  <div
    onClick={onClick}
    className={`group bg-white rounded-3xl p-6 shadow-lg cursor-pointer border-2 border-transparent
    transform transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:border-green-200
    ${isSelected ? "ring-4 ring-green-300 scale-[1.02] shadow-xl border-green-300" : ""}
    hover:-translate-y-2`}
    role="button"
    tabIndex={0}
    onKeyDown={(e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}
  >
    <div className="relative overflow-hidden rounded-2xl mb-5">
      <img
        src={product.imageurl}
        alt={product.name}
        className="w-full h-52 object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute top-3 left-3 flex gap-2">
        {product.bestseller && (
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg flex items-center gap-1">
            <Star size={12} className="fill-current" />
            Bestseller
          </span>
        )}
        {product.new && (
          <span className="bg-gradient-to-r from-green-400 to-green-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
            New
          </span>
        )}
      </div>
      <div className="absolute top-3 left-1">
       <span className={`inline-block text-xs px-1 py-1 rounded-full mt-1 ${product.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {product.quantity} in stock
        </span>
       </div>
      <div className="absolute top-3 right-3">
        <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold shadow-sm">
          {product.category}
        </span>
      </div>
      <div className="absolute bottom-3 right-3">
        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star size={12} className="text-yellow-500 fill-current" />
          <span className="text-xs font-semibold text-gray-700">{product.rating}</span>
        </div>
      </div>
    </div>
    
    <div className="space-y-3">
      <h4 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-green-700 transition-colors">
        {product.name}
      </h4>
      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
        {product.description}
      </p>
      <div className="flex items-center justify-between pt-2">
        <div className="flex flex-col">
          <span className="text-2xl font-black text-green-600">
            KES {product.price.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500">Free shipping</span>
        </div>
        <button 
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 
          text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl 
          transition-all duration-300 transform hover:scale-105 hover:-translate-y-1
          flex items-center gap-2"
          type="button"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <Heart size={16} />
          Add to Cart
        </button>
      </div>
    </div>
  </div>
);

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selectedCategory, onCategoryChange }) => (
  <div className="flex flex-wrap gap-3 mb-8">
    <button
      onClick={() => onCategoryChange("All")}
      className={`px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
        selectedCategory === "All"
          ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
      }`}
      type="button"
    >
      ✨ All Products
    </button>
    {categories.map((category: string) => (
      <button
        key={category}
        onClick={() => onCategoryChange(category)}
        className={`px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
          selectedCategory === category
            ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
        }`}
        type="button"
      >
        {category === "Skincare" && "🌿 "}
        {category === "Makeup" && "💄 "}
        {category === "Fragrance" && "🌸 "}
        {category === "Body Care" && "🧴 "}
        {category}
      </button>
    ))}
  </div>
);

const Footer: React.FC = () => (
  <footer className="bg-gradient-to-r from-black via-gray-900 to-green-800 text-white py-12">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-white to-green-50 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-green-600 font-black text-xl">K</span>
            </div>
            <div>
              <h3 className="text-2xl font-black">Kifaru Beauty</h3>
              <p className="text-green-200 text-sm">Where beauty meets nature</p>
            </div>
          </div>
          <p className="text-green-100 leading-relaxed max-w-md">
            We're passionate about bringing you the finest beauty products that celebrate your unique radiance. 
            From skincare essentials to makeup must-haves, every product is carefully curated for quality and results.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-lg">Shop by Category</h4>
          <ul className="space-y-3 text-green-100">
            <li className="hover:text-white transition-colors cursor-pointer">🌿 Skincare Essentials</li>
            <li className="hover:text-white transition-colors cursor-pointer">💄 Makeup Collection</li>
            <li className="hover:text-white transition-colors cursor-pointer">🌸 Signature Fragrances</li>
            <li className="hover:text-white transition-colors cursor-pointer">🧴 Body Care Luxuries</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-lg">Customer Care</h4>
          <ul className="space-y-3 text-green-100">
            <li className="hover:text-white transition-colors cursor-pointer">📞 Contact Support</li>
            <li className="hover:text-white transition-colors cursor-pointer">🚚 Shipping & Delivery</li>
            <li className="hover:text-white transition-colors cursor-pointer">↩️ Returns & Exchanges</li>
            <li className="hover:text-white transition-colors cursor-pointer">❓ Beauty FAQ</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/20 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between">
        <p className="text-green-100 text-sm mb-4 md:mb-0">
          © 2024 Kifaru Beauty. Crafted with love for beauty enthusiasts everywhere.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-green-200 text-sm">Secure payments powered by</span>
          <span className="text-white font-semibold">Swypt</span>
        </div>
      </div>
    </div>
  </footer>
);

const KifaruBeautyStore: React.FC = () => {
  const router = useRouter();

const [products, setProducts] = useState<Product[]>([]);
interface ClickedProduct {
  id: number;
  name: string;
}

const [whichproducts, setWhichProducts] = useState<ClickedProduct[]>([]);

// setWhichProducts((prev) => {
//   const exists = prev.some((p) => p.id === products.id);
//   if (exists) return prev;   
//   return [...prev, { id: products.id, name: products.name }];
// });


useEffect(() => {
  const fetchProducts = async () => {
    try {
      const response = await axios.get("https://kifaruswypt.onrender.com/getProducts");
      setProducts(response.data.message);
      console.log("Products fetched:", response.data);
      const merchantAddress = response.data.message[0].walletaddressed;
      console.log("Merchant Address:", merchantAddress);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  fetchProducts();
}, []);

  const navigateToDashboard = () => {
  console.log("Navigating to /merchants");
  router.push("/merchants/signUp");
};
 
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // const merchantAddress: string = "0x21255cdbdAfF23D27bE0E00E79b8b03a14A32ab1";
    const merchantAddress: string = products.length > 0 ? products[0].walletaddressed: null;
  console.log("Merchanteeezz Address:", merchantAddress);
  const categories: string[] = Array.from(new Set(products.map((product: Product) => product.category)));

  const filteredProducts: Product[] = selectedCategory === "All" 
    ? products 
    : products.filter((product: Product) => product.category === selectedCategory);

  const handleProductSelect = (product: Product): void => {
    setCartItems((prevItems: CartItem[]) => {
      const existingItem = prevItems.find(
        (item: CartItem) => item.product.id === product.id
      );
      if (existingItem) {
        return prevItems.map((item: CartItem) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string): void => {
    setCartItems((prevItems: CartItem[]) =>
      prevItems.filter((item: CartItem) => item.product.id !== productId)
    );
  };

  const cartTotal: number = cartItems.reduce(
    (total: number, item: CartItem) => total + item.product.price * item.quantity,
    0
  );

  const cartItemCount: number = cartItems.reduce(
    (count: number, item: CartItem) => count + item.quantity,
    0
  );

  const handleCheckout = (): void => {
    setIsCartOpen(false);
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      setIsModalOpen(true);
    }, 200);
  };

  const handleCloseModal = (): void => {
    document.body.style.overflow = 'auto';
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Organic background shapes */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-green-200/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-gradient-to-bl from-gray-200/40 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-gradient-to-tr from-green-300/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-white/50 to-transparent rounded-full blur-2xl"></div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md" 
            onClick={handleCloseModal}
          />
          <div className="relative z-50 max-w-2xl w-full">
            <DepositModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              headerBackgroundColor="linear-gradient(135deg, #000000 0%, #1f2937 50%, #16a34a 100%)"
              businessName="Kifaru Beauty"
              merchantName="Kifaru Beauty Store"
              merchantAddress={merchantAddress}
              amount={cartTotal}
            />
          </div>
        </div>
      )}

      <CartPanel
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
        total={cartTotal}
      />
     
  

      <Header
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
        onDashboardClick={() => navigateToDashboard()}
      />

      <main className="relative z-10 max-w-7xl w-full mx-auto px-6 pt-32 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles size={16} />
            Premium Beauty Collection
            <Sparkles size={16} />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
            Discover Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-green-700 to-black">
              Natural Glow
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Curated beauty essentials that celebrate your unique radiance. From Korean skincare innovations 
            to luxury makeup must-haves, find everything you need to feel confidently beautiful.
          </p>
        </div>

        {/* Products Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10">
            <div>
              <h3 className="text-3xl font-black text-gray-900 mb-2">
                Beauty Essentials
              </h3>
              <p className="text-gray-600">
                {filteredProducts.length} carefully selected products • Free shipping on all orders
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center gap-3">
              <span className="text-sm text-gray-500">Sort by popularity</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
          </div>
          
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductSelect(product)}
                isSelected={cartItems.some(
                  (item: CartItem) => item.product.id === product.id
                )}
              />
            ))}
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚚</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Free Shipping</h4>
            <p className="text-sm text-gray-600">On all orders above KES 2,000</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Authentic Products</h4>
            <p className="text-sm text-gray-600">100% genuine beauty products</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💝</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Easy Returns</h4>
            <p className="text-sm text-gray-600">30-day hassle-free returns</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Expert Curation</h4>
            <p className="text-sm text-gray-600">Handpicked by beauty experts</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default KifaruBeautyStore;





