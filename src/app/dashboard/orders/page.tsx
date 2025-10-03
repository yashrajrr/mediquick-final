'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, CheckCircle, Package, Receipt, ShoppingBasket, Clock, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";

export type Order = {
    id: string;
    date: string;
    status: OrderStatus;
    total: number;
    items: string[];
    tracking?: string;
    deliveryEstimate?: number;
    userId: string;
    userName: string;
};

export const ORDER_STATUSES = {
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export type OrderStatus = 
  | "Confirmed"
  | "Preparing"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export const statusSteps: OrderStatus[] = [
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
];

const OrderCard = ({ order }: { order: Order }) => {
  const { toast } = useToast();
  const currentStatusIndex = statusSteps.indexOf(order.status);
  const isCancelled = order.status === ORDER_STATUSES.CANCELLED;
  
  const handleCancelOrder = () => {
    try {
      const storedOrders = localStorage.getItem('orders');
      if (storedOrders) {
        const orders: Order[] = JSON.parse(storedOrders);
        const updatedOrders = orders.map(o => 
            o.id === order.id ? { ...o, status: ORDER_STATUSES.CANCELLED, deliveryEstimate: undefined } : o
        );
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        window.dispatchEvent(new Event('ordersUpdated'));
        toast({
          title: "Order Cancelled",
          description: `Order #${order.id} has been cancelled.`,
        });
      }
    } catch (error) {
      console.error("Failed to cancel order", error);
      toast({
          variant: 'destructive',
          title: "Error",
          description: `Could not cancel order #${order.id}.`,
        });
    }
  };

  return (
    <Card className="shadow-md transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
                <CardTitle className="text-xl">Order #{order.id}</CardTitle>
                <CardDescription>Placed on {new Date(order.date).toLocaleString()}</CardDescription>
            </div>
            <Badge variant={isCancelled ? "destructive" : "secondary" } className="text-base px-4 py-2">
              ₹{order.total.toFixed(2)}
            </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isCancelled ? (
            <div className="text-center py-8 flex flex-col items-center gap-2">
                 <Ban className="w-12 h-12 text-destructive" />
                 <p className="text-lg font-semibold text-destructive">This order has been cancelled.</p>
            </div>
        ) : (
             <>
                {order.deliveryEstimate && (
                    <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center gap-3">
                        <Clock className="w-6 h-6 text-blue-600" />
                        <div>
                            <p className="font-bold text-blue-800">Estimated Delivery</p>
                            <p className="text-xl font-bold text-blue-900">{order.deliveryEstimate} minutes</p>
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-between mt-4">
                    {statusSteps.map((step: OrderStatus, index: number) => {
                        const isActive = index <= currentStatusIndex;
                        return (
                            <React.Fragment key={step}>
                                <div className="flex flex-col items-center gap-2">
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white", isActive ? "bg-primary" : "bg-muted")}>
                                    {index === 0 && <Receipt />}
                                    {index === 1 && <ShoppingBasket />}
                                    {index === 2 && <Truck />}
                                    {index === 3 && <CheckCircle />}
                                    </div>
                                    <span className={cn("text-xs text-center", isActive ? "font-semibold text-primary" : "text-muted-foreground")}>{step}</span>
                                </div>
                                {index < statusSteps.length - 1 && <div className={cn("flex-1 h-1 rounded-full mx-2", isActive || currentStatusIndex > index ? "bg-primary" : "bg-muted")} />}
                            </React.Fragment>
                        )
                    })}
                </div>
             </>
        )}
        
        <Separator className="my-6" />

        <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2"><Package className="w-5 h-5"/> Items</h4>
            <ul className="list-disc list-inside text-muted-foreground">
                {order.items.map(item => <li key={item}>{item}</li>)}
            </ul>
        </div>
      </CardContent>
       <CardFooter className="flex justify-end gap-2">
         <Button variant="outline" disabled={order.status !== "Out for Delivery" || !order.tracking}>
            Track Live
         </Button>
         <Button 
            variant="destructive" 
            onClick={handleCancelOrder}
            disabled={order.status === ORDER_STATUSES.DELIVERED || order.status === ORDER_STATUSES.CANCELLED}
         >
            Cancel Order
         </Button>
      </CardFooter>
    </Card>
  )
}

export default function OrdersPage() {
  const [filter, setFilter] = useState("Active");
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useUser();

  useEffect(() => {
    const loadOrders = () => {
        try {
            const storedOrders = localStorage.getItem('orders');
            if (storedOrders) {
                const allOrders: Order[] = JSON.parse(storedOrders);
                const userOrders = user ? allOrders.filter(o => o.userId === user.uid) : [];
                setOrders(userOrders);
            }
        } catch (error) {
            console.error('Failed to parse orders from localStorage', error);
        }
    }
    
    loadOrders();
    window.addEventListener('ordersUpdated', loadOrders);
    
    return () => {
        window.removeEventListener('ordersUpdated', loadOrders);
    }
  }, [user]);

  const filteredOrders = orders.filter(order => {
    if (filter === "All") return true;
    if (filter === "Active") return ![ORDER_STATUSES.DELIVERED, ORDER_STATUSES.CANCELLED].includes(order.status as any);
    if (filter === "Completed") return [ORDER_STATUSES.DELIVERED, ORDER_STATUSES.CANCELLED].includes(order.status as any);
    return order.status === filter;
  }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Your Orders</h1>
        <p className="text-muted-foreground">Track your deliveries in real-time.</p>
      </header>

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="Active">Active</TabsTrigger>
          <TabsTrigger value="Completed">Completed</TabsTrigger>
          <TabsTrigger value="All">All Orders</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-6">
         {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No orders found for this filter.</p>
          </div>
        )}
      </div>

    </div>
  );
}
