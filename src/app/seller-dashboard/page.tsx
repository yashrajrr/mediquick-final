
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, DollarSign, Package, Users } from "lucide-react";
import { useEffect, useState } from "react";
import type { Order } from "@/app/dashboard/orders/page";
import { ORDER_STATUSES } from "@/app/dashboard/orders/page";

export default function SellerDashboardPage() {
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [activeOrdersCount, setActiveOrdersCount] = useState(0);
    const [productCount, setProductCount] = useState(0);

    const loadStats = () => {
        try {
            const storedOrders = localStorage.getItem('orders');
            if (storedOrders) {
                const orders: Order[] = JSON.parse(storedOrders);
                const currentRevenue = orders
                    .filter(o => o.status === ORDER_STATUSES.DELIVERED)
                    .reduce((acc, o) => acc + o.total, 0);
                
                const currentActiveOrders = orders.filter(o => 
                    o.status !== ORDER_STATUSES.DELIVERED && o.status !== ORDER_STATUSES.CANCELLED
                ).length;

                setTotalRevenue(currentRevenue);
                setActiveOrdersCount(currentActiveOrders);
            }

            const storedProducts = localStorage.getItem('products');
            if(storedProducts) {
                const products = JSON.parse(storedProducts);
                setProductCount(products.length);
            }

        } catch (error) {
            console.error("Failed to load stats data from localStorage", error);
        }
    };

    useEffect(() => {
        loadStats();
        
        window.addEventListener('ordersUpdated', loadStats);
        window.addEventListener('productsUpdated', loadStats);

        return () => {
            window.removeEventListener('ordersUpdated', loadStats);
            window.removeEventListener('productsUpdated', loadStats);
        }
    }, []);

    const stats = [
        { title: "Total Revenue", value: `₹${totalRevenue.toFixed(2)}`, change: "from completed orders", icon: DollarSign },
        { title: "Active Orders", value: `${activeOrdersCount}`, change: "require attention", icon: Users },
        { title: "Products in Stock", value: `${productCount}`, change: "currently listed", icon: Package },
        { title: "Sales per Day", value: "N/A", change: "coming soon", icon: Activity },
    ]

    return (
      <div className="space-y-6">
        <header>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Seller Dashboard</h1>
            <p className="text-muted-foreground">Here's an overview of your pharmacy's performance.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map(stat => (
                 <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </CardContent>
                </Card>
            ))}
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>A log of recent events and notifications.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="text-center py-16 text-muted-foreground">
                    <p>No recent activity to display.</p>
                </div>
            </CardContent>
        </Card>

      </div>
    );
}
