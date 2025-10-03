'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, PlusCircle, ShoppingCart, Trash2, MapPin, Stethoscope, Wallet, Search, Sparkles, History, Box, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { baseProducts as staticProducts, healthKits, Product } from './products';
import type { Order } from '../orders/page';
import { findMedicinesForSymptom } from '@/ai/flows/find-medicines-for-symptom';
import { useUser } from '@/firebase';


const nearbyPharmacies = [
    { name: "Local Health Mart - 0.8 miles", id: "local", multiplier: 0.95 },
    { name: "CVS Pharmacy - 1.2 miles", id: "cvs", multiplier: 1.0 },
    { name: "Walgreens - 2.5 miles", id: "walgreens", multiplier: 1.05 },
    { name: "Rite Aid - 3.1 miles", id: "riteaid", multiplier: 1.02 },
]

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export default function ShopPage() {
  const { user } = useUser();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>(staticProducts);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>(nearbyPharmacies[1].id);
  const [walletBalance, setWalletBalance] = useState(10000);
  const [isCheckoutAlertOpen, setCheckoutAlertOpen] = useState(false);
  const [isAddMoneyAlertOpen, setAddMoneyAlertOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { toast } = useToast();
  const [lastOrderItems, setLastOrderItems] = useState<string[]>([]);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<string[] | null>(null);
  
  const loadProducts = () => {
      try {
          const storedProducts = localStorage.getItem('products');
          if (storedProducts) {
              const parsedProducts: Product[] = JSON.parse(storedProducts);
              // Simple validation to ensure we have an array of products
              if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
                 setAllProducts(parsedProducts);
              } else {
                 setAllProducts(staticProducts);
                 localStorage.setItem('products', JSON.stringify(staticProducts));
              }
          } else {
             setAllProducts(staticProducts);
             localStorage.setItem('products', JSON.stringify(staticProducts));
          }
      } catch (error) {
          console.error("Failed to parse products from localStorage, falling back to static list.", error);
          setAllProducts(staticProducts);
      }
  };

  const loadCart = () => {
    try {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }
    } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
    }
  };
  
  const loadLastOrder = () => {
    try {
        const storedOrders = localStorage.getItem('orders');
        if (storedOrders) {
            const orders: Order[] = JSON.parse(storedOrders);
            if (orders.length > 0) {
                 const uniqueItems = new Set<string>();
                 orders[0].items.forEach(item => {
                    const name = item.split(' (x')[0]; // Extract name before quantity
                    const product = allProducts.find(p => p.name === name);
                    if (product && !product.prescriptionRequired) {
                        uniqueItems.add(name);
                    }
                 });
                 setLastOrderItems(Array.from(uniqueItems));
            }
        }
    } catch (error) {
        console.error("Failed to parse orders from localStorage", error);
    }
  }

  useEffect(() => {
    loadProducts();
    loadCart();
    loadLastOrder();
    
    window.addEventListener('cartUpdated', loadCart);
    window.addEventListener('ordersUpdated', loadLastOrder);
    window.addEventListener('productsUpdated', loadProducts);


    return () => {
      window.removeEventListener('cartUpdated', loadCart);
      window.removeEventListener('ordersUpdated', loadLastOrder);
      window.removeEventListener('productsUpdated', loadProducts);
    };
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
        console.error("Failed to save cart to localStorage", error);
    }
  }, [cart]);


  const selectedPharmacy = useMemo(() => {
    return nearbyPharmacies.find(p => p.id === selectedPharmacyId) || nearbyPharmacies[1];
  }, [selectedPharmacyId]);

  const products = useMemo(() => {
    return allProducts.map(p => ({
        ...p,
        price: p.price * selectedPharmacy.multiplier
    }));
  }, [selectedPharmacy, allProducts]);
  
  const categories = useMemo(() => ['All', ...new Set(allProducts.map(p => p.category))], [allProducts]);

  const filteredProducts = useMemo(() => {
    let productsToShow = products;

    if (aiSearchResults) {
      productsToShow = products.filter(p => aiSearchResults.includes(p.name));
    }

    return productsToShow.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = searchTerm ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) : !aiSearchResults; // Only apply search term if not showing AI results
      return matchesCategory && (aiSearchResults ? true : matchesSearch);
    });
  }, [products, selectedCategory, searchTerm, aiSearchResults]);


  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const addToCart = (productName: string) => {
    const product = products.find(p => p.name === productName);
    if (!product || product.prescriptionRequired) return;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1, price: product.price } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };
  
  const addKitToCart = (kit: typeof healthKits[0]) => {
     setCart(prevCart => {
        let newCart = [...prevCart];
        kit.items.forEach(itemName => {
            const product = products.find(p => p.name === itemName);
            if (!product) return;

            const existingItemIndex = newCart.findIndex(item => item.id === product.id);
            if (existingItemIndex > -1) {
                newCart[existingItemIndex] = { ...newCart[existingItemIndex], quantity: newCart[existingItemIndex].quantity + 1, price: product.price };
            } else {
                 newCart.push({ ...product, quantity: 1 });
            }
        });
        return newCart;
    });

    toast({
        title: "Kit Added",
        description: `All items from ${kit.name} have been added to your cart.`
    });
  };


  const removeFromCart = (productId: number) => {
    setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === productId);
        if (existingItem && existingItem.quantity > 1) {
            return prevCart.map(item => item.id === productId ? {...item, quantity: item.quantity - 1} : item);
        }
        return prevCart.filter(item => item.id !== productId)
    });
  };
  
  const handleCheckout = () => {
    if (!selectedPharmacy) {
        toast({
            variant: 'destructive',
            title: "No Pharmacy Selected",
            description: "Please select a pharmacy before checking out.",
        });
        return;
    }
    if (walletBalance < cartTotal) {
      setAddMoneyAlertOpen(true);
    } else {
      setCheckoutAlertOpen(true);
    }
  }

  const handlePayment = () => {
    if (walletBalance >= cartTotal) {
        setWalletBalance(prev => prev - cartTotal);

        const newOrder: Order = {
            id: `QCK${Math.floor(Math.random() * 900) + 100}`,
            date: new Date().toISOString(),
            status: 'Confirmed',
            total: cartTotal,
            items: cart.map(item => `${item.name} (x${item.quantity})`),
            deliveryEstimate: Math.floor(Math.random() * 21) + 10,
            userId: user?.uid || 'anonymous',
            userName: user?.displayName || 'Guest',
        };

        try {
            const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]') as Order[];
            localStorage.setItem('orders', JSON.stringify([newOrder, ...existingOrders]));
            window.dispatchEvent(new Event('ordersUpdated'));
        } catch (error) {
            console.error("Failed to save new order", error);
        }

        toast({
            title: "Payment Successful",
            description: `Your order from ${selectedPharmacy.name} is confirmed.`,
        });
        setCart([]);
        window.dispatchEvent(new Event('cartUpdated'));

    } else {
        toast({
            variant: 'destructive',
            title: "Payment Failed",
            description: "Insufficient wallet balance.",
        });
    }
    setCheckoutAlertOpen(false);
  }
  
  const handleSymptomSearch = async () => {
      if (!searchTerm.trim()) return;
      setIsAiSearching(true);
      setAiSearchResults(null);
      try {
          const productList = allProducts.map(p => ({ name: p.name, category: p.category }));
          const result = await findMedicinesForSymptom({symptom: searchTerm, productList });
          setAiSearchResults(result.recommendedMedicines);
          if (result.recommendedMedicines.length > 0) {
            toast({
                title: "AI Search Complete",
                description: `Showing results for "${searchTerm}"`
            });
          } else {
             toast({
                variant: 'destructive',
                title: "No Recommendations",
                description: `AI could not find a suitable over-the-counter match for "${searchTerm}" in our inventory.`
            });
          }
      } catch (error) {
          console.error("AI symptom search failed", error);
          toast({
              variant: 'destructive',
              title: 'AI Search Error',
              description: 'Could not fetch AI-powered recommendations.'
          });
          setAiSearchResults(null);
      }
      setIsAiSearching(false);
  };
  
  const clearAiSearch = () => {
      setAiSearchResults(null);
      setSearchTerm('');
  }

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-6">
        <header className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-3"><ShoppingBag className="w-8 h-8" /> Shop Medications</h1>
                <p className="text-muted-foreground">Browse products or search by symptom to find what you need.</p>
              </div>
              <Card className="shadow-sm">
                <CardContent className="p-3 flex items-center gap-3">
                  <Wallet className="w-6 h-6 text-primary"/>
                  <div>
                    <CardTitle className="text-sm">Wallet</CardTitle>
                    <CardDescription className="text-lg font-bold">₹{walletBalance.toFixed(2)}</CardDescription>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search medicines or symptoms..."
                        className="pl-10 h-11"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSymptomSearch()}
                    />
                </div>
                 <Button onClick={handleSymptomSearch} disabled={isAiSearching} size="lg">
                    {isAiSearching ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2"/>}
                     AI Search
                </Button>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-[200px] h-11">
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             {aiSearchResults && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between gap-3">
                    <p className="text-sm text-blue-800 font-medium">
                        Showing AI recommendations for "{searchTerm}"
                    </p>
                    <Button variant="ghost" size="sm" onClick={clearAiSearch}>Clear</Button>
                </div>
            )}
        </header>

        {lastOrderItems.length > 0 && !aiSearchResults && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><History/> Quick Reorder</CardTitle>
                    <CardDescription>Items from your last order.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {lastOrderItems.map(item => (
                        <Button key={item} variant="outline" size="sm" onClick={() => addToCart(item)}>
                            <PlusCircle className="mr-2 h-4 w-4"/> {item}
                        </Button>
                    ))}
                </CardContent>
            </Card>
        )}
        
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Box/> Health Kits</CardTitle>
                <CardDescription>Bundles for common health needs.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthKits.map(kit => (
                    <Card key={kit.name} className="bg-secondary/50">
                        <CardHeader>
                            <CardTitle className="text-lg">{kit.name}</CardTitle>
                            <CardDescription>{kit.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="text-sm text-muted-foreground list-disc pl-4">
                                {kit.items.map(item => <li key={item}>{item}</li>)}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => addKitToCart(kit)}>Add Kit to Cart</Button>
                        </CardFooter>
                    </Card>
                ))}
            </CardContent>
        </Card>


        <div>
            <h2 className="text-2xl font-bold mb-4">All Products</h2>
            <div 
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredProducts.length > 0 ? filteredProducts.map(product => {
                const imagePath = `/images/medicines/${product.name}.png`;
                return (
                    <div key={product.id}>
                        <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 group flex flex-col h-full">
                        <CardContent className="p-0">
                            <div className="aspect-square relative bg-gray-100 flex items-center justify-center">
                                <Image 
                                    src={imagePath} 
                                    alt={product.name} 
                                    fill={true}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    style={{objectFit: "cover"}}
                                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }}
                                />
                                <div className="hidden text-muted-foreground"><ShoppingBag size={48} /></div>
                                <div className="absolute top-2 left-2 flex flex-col gap-2">
                                    <Badge variant="secondary">{product.category}</Badge>
                                    {product.prescriptionRequired && <Badge variant="destructive" className="w-fit">Rx only</Badge>}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold h-10">{product.name}</h3>
                                <p className="text-2xl font-bold">₹{product.price.toFixed(2)}</p>
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 mt-auto">
                            {product.prescriptionRequired ? (
                                <Button asChild className="w-full" variant="outline">
                                    <Link href="/dashboard/consult-doctor">
                                        <Stethoscope className="mr-2 h-4 w-4" /> Consult a Doctor
                                    </Link>
                                </Button>
                            ) : (
                                <Button className="w-full" onClick={() => addToCart(product.name)}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add to Cart
                                </Button>
                            )}
                        </CardFooter>
                        </Card>
                    </div>
                )
                }) : (
                 <p className="text-muted-foreground col-span-full text-center py-10">No products found matching your criteria.</p>
              )}
            </div>
        </div>
        
      </div>
      
      <aside className="space-y-6 lg:sticky lg:top-8">
        <Card className="shadow-lg shadow-blue-500/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5"/> Select a Pharmacy</CardTitle>
                <CardDescription>Choose where you'd like to pick up your order. Prices may vary.</CardDescription>
            </CardHeader>
            <CardContent>
                <Select value={selectedPharmacyId} onValueChange={setSelectedPharmacyId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a nearby pharmacy" />
                    </SelectTrigger>
                    <SelectContent>
                        {nearbyPharmacies.map(pharmacy => (
                            <SelectItem key={pharmacy.id} value={pharmacy.id}>
                                {pharmacy.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
        
        <Card className="shadow-lg shadow-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5"/> Your Cart</CardTitle>
            {totalItems > 0 && <Badge>{totalItems} {totalItems === 1 ? 'item' : 'items'}</Badge>}
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    
                        {cart.map(item => (
                            <li 
                                key={item.id} 
                                className="flex justify-between items-center"
                            >
                                <div>
                                <p className="font-semibold leading-tight">{item.name}</p>
                                <p className="text-sm text-muted-foreground">{item.quantity} x ₹{item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => removeFromCart(item.id)}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                                </div>
                            </li>
                        ))}
                    
                </ul>
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg" disabled={cart.length === 0} onClick={handleCheckout}>
              Checkout
            </Button>
          </CardFooter>
        </Card>
      </aside>
    </div>
    <AlertDialog open={isCheckoutAlertOpen} onOpenChange={setCheckoutAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                <AlertDialogDescription>
                    Your total is ₹{cartTotal.toFixed(2)}. Do you want to pay from your wallet?
                    Your remaining balance will be ₹{(walletBalance - cartTotal).toFixed(2)}.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handlePayment}>Pay from Wallet</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
     <AlertDialog open={isAddMoneyAlertOpen} onOpenChange={setAddMoneyAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Insufficient Balance</AlertDialogTitle>
                <AlertDialogDescription>
                   You do not have enough money in your wallet to complete this purchase. Please add funds to continue.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction disabled>Add Money to Wallet (Coming Soon)</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

    