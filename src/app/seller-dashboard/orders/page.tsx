'use client';

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, User, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { Order, OrderStatus } from "@/app/dashboard/orders/page";
import { ORDER_STATUSES, statusSteps } from "@/app/dashboard/orders/page";

const SellerOrderCard = ({ order, onStatusChange }: { order: Order, onStatusChange: (orderId: string, newStatus: OrderStatus) => void }) => {
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <CardDescription>Placed on {new Date(order.date).toLocaleString()}</CardDescription>
                    </div>
                     <Badge variant={order.status === ORDER_STATUSES.CANCELLED ? "destructive" : "secondary" } className="text-sm px-3 py-1">
                        ₹{order.total.toFixed(2)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Customer: {order.userName}</span>
                    </div>
                    {order.deliveryEstimate && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Delivery in ~{order.deliveryEstimate} mins</span>
                        </div>
                    )}
                 </div>

                <Separator />

                <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm"><Package className="w-4 h-4"/> Items</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {order.items.map(item => <li key={item}>{item}</li>)}
                    </ul>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-3">
                 <div className="flex items-center gap-2 w-full">
                    <span className="text-sm font-medium">Status:</span>
                    <Select 
                        value={order.status} 
                        onValueChange={(newStatus: OrderStatus) => onStatusChange(order.id, newStatus)}
                        disabled={order.status === 'Cancelled' || order.status === 'Delivered'}
                    >
                        <SelectTrigger className="flex-grow">
                            <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusSteps.map((status: OrderStatus) => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
            </CardFooter>
        </Card>
    )
}


export default function SellerOrdersPage() {
    const [filter, setFilter] = useState("Active");
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const { toast } = useToast();

    const loadOrders = () => {
        try {
            const storedOrders = localStorage.getItem('orders');
            if (storedOrders) {
                setAllOrders(JSON.parse(storedOrders));
            }
        } catch (error) {
            console.error('Failed to parse orders from localStorage', error);
        }
    }

    useEffect(() => {
        loadOrders();
        window.addEventListener('ordersUpdated', loadOrders);
        return () => {
            window.removeEventListener('ordersUpdated', loadOrders);
        }
    }, []);

    const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
        try {
            const updatedOrders = allOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
            setAllOrders(updatedOrders);
            localStorage.setItem('orders', JSON.stringify(updatedOrders));
            window.dispatchEvent(new Event('ordersUpdated')); // Notify user-side
            toast({
                title: "Order Status Updated",
                description: `Order #${orderId} is now marked as ${newStatus}.`,
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update order status.'
            })
        }
    };

    const filteredOrders = useMemo(() => {
         return allOrders.filter(order => {
            if (filter === "All") return true;
            if (filter === "Active") return ![ORDER_STATUSES.DELIVERED, ORDER_STATUSES.CANCELLED].includes(order.status as any);
            if (filter === "Completed") return [ORDER_STATUSES.DELIVERED, ORDER_STATUSES.CANCELLED].includes(order.status as any);
            return false;
        }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [allOrders, filter])

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold font-headline tracking-tight">Manage Orders</h1>
                <p className="text-muted-foreground">View and update the status of incoming customer orders.</p>
            </header>

            <Tabs value={filter} onValueChange={setFilter} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="Active">Active</TabsTrigger>
                    <TabsTrigger value="Completed">Completed</TabsTrigger>
                    <TabsTrigger value="All">All Orders</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <SellerOrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                    ))
                ) : (
                    <div className="text-center py-16 col-span-full">
                        <p className="text-muted-foreground">No orders found for this filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
