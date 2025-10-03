
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { HeartPulse, Droplets, Gauge, Pill, Bell, Scale, BrainCircuit, Bed, PlusCircle, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { baseProducts } from "../shop/products";
import type { CartItem } from "../shop/page";
import type { Order } from "../orders/page";
import { useEffect, useState, useMemo } from "react";
import type { UserPrescription } from "../prescription-analysis/page";
import { format, subMonths } from 'date-fns';
import { useUser } from "@/firebase";

type TestResults = {
    bmi?: { value: number; category: string };
    stress?: { score: number; level: string };
    sleep?: { category: string; hours: number };
}

export default function HealthDashboardPage() {
    const { toast } = useToast();
    const { user } = useUser();
    const [testResults, setTestResults] = useState<TestResults>({});
    const [prescriptions, setPrescriptions] = useState<UserPrescription[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        const loadData = () => {
            const storedResults = localStorage.getItem('homeTestResults');
            if (storedResults) {
                setTestResults(JSON.parse(storedResults));
            }
            const storedPrescriptions = localStorage.getItem('myPrescriptions');
             if (storedPrescriptions) {
                setPrescriptions(JSON.parse(storedPrescriptions));
            }
            const storedOrders = localStorage.getItem('orders');
             if (storedOrders) {
                setOrders(JSON.parse(storedOrders));
            } else if (user) {
                // If no orders, create dummy data for the last 6 months
                const dummyOrders: Order[] = Array.from({ length: 6 }).map((_, i) => {
                    const date = subMonths(new Date(), i);
                    return {
                        id: `DUMMY${i}`,
                        date: date.toISOString(),
                        status: 'Delivered',
                        total: Math.floor(Math.random() * (5000 - 800 + 1) + 800),
                        items: ['Dummy Item 1', 'Dummy Item 2'],
                        userId: user.uid,
                        userName: user.displayName || 'Jane Doe',
                    };
                });
                localStorage.setItem('orders', JSON.stringify(dummyOrders));
                setOrders(dummyOrders);
            }
        };

        loadData();

        window.addEventListener('testResultUpdated', loadData);
        window.addEventListener('prescriptionsUpdated', loadData);
        window.addEventListener('ordersUpdated', loadData);


        return () => {
            window.removeEventListener('testResultUpdated', loadData);
            window.removeEventListener('prescriptionsUpdated', loadData);
            window.removeEventListener('ordersUpdated', loadData);
        };
    }, [user]);
    
    const upcomingRefills = useMemo(() => {
        return prescriptions.map(p => {
            const dateAdded = new Date(p.dateAdded);
            const today = new Date();
            const daysSinceAdded = Math.floor((today.getTime() - dateAdded.getTime()) / (1000 * 3600 * 24));
            const daysLeft = Math.max(0, 30 - daysSinceAdded); // Assuming 30-day supply
            return { name: p.medicationName, daysLeft };
        }).filter(p => p.daysLeft <= 15).sort((a,b) => a.daysLeft - b.daysLeft);
    }, [prescriptions]);

    const monthlySpendingData = useMemo(() => {
        const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), i));
        const data = months.map(month => {
            const monthName = format(month, 'MMM');
            const total = orders
                .filter(order => format(new Date(order.date), 'yyyy-MM') === format(month, 'yyyy-MM'))
                .reduce((sum, order) => sum + order.total, 0);
            return { month: monthName, spending: total };
        }).reverse();
        
        return data;
    }, [orders]);


    const addToCart = (productName: string) => {
        const productToAdd = baseProducts.find(p => p.name === productName);
        if (!productToAdd) {
            toast({
                variant: 'destructive',
                title: "Product not found",
                description: `Could not find "${productName}" in the shop.`,
            });
            return;
        }

        try {
            const storedCart = localStorage.getItem('cart');
            const cart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];
            
            const existingItemIndex = cart.findIndex(item => item.id === productToAdd.id);

            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += 1;
            } else {
                cart.push({ ...productToAdd, price: productToAdd.price, quantity: 1 });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            window.dispatchEvent(new Event('cartUpdated'));
            toast({
                title: "Added to cart",
                description: `${productName} has been added to your cart.`,
            });
        } catch (error) {
            console.error("Failed to update cart in localStorage", error);
            toast({
                variant: 'destructive',
                title: "Could not update cart",
                description: "There was an issue adding the item to your cart.",
            });
        }
    };


  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Health Dashboard</h1>
        <p className="text-muted-foreground">An overview of your health metrics and medication adherence.</p>
      </header>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                <HeartPulse className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">72 BPM</div>
                <p className="text-xs text-muted-foreground">Normal</p>
            </CardContent>
        </Card>
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
                <Gauge className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">120/80 mmHg</div>
                <p className="text-xs text-muted-foreground">Normal</p>
            </CardContent>
        </Card>
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Blood Sugar</CardTitle>
                <Droplets className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">90 mg/dL</div>
                <p className="text-xs text-muted-foreground">Fasting</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><IndianRupee className="w-5 h-5" />Monthly Spending</CardTitle>
                <CardDescription>Your medication and product expenses over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                     <AreaChart data={monthlySpendingData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis unit="₹" />
                        <Tooltip content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col space-y-1">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      {payload[0].payload.month}
                                    </span>
                                    <span className="font-bold text-muted-foreground">
                                      ₹{payload[0].value?.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}/>
                         <defs>
                            <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="spending" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSpending)" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">Recent Home Test Results</CardTitle>
                <CardDescription>Your latest results from the home health tests.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-muted/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2"><Scale className="w-4 h-4"/> BMI</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {testResults.bmi ? (
                            <>
                                <div className="text-2xl font-bold">{testResults.bmi.value}</div>
                                <p className="text-xs text-muted-foreground">{testResults.bmi.category}</p>
                            </>
                        ) : (
                            <div className="text-2xl font-bold">-</div>
                        )}
                    </CardContent>
                </Card>
                 <Card className="bg-muted/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2"><BrainCircuit className="w-4 h-4"/> Stress Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {testResults.stress ? (
                           <>
                             <div className="text-2xl font-bold">{testResults.stress.level}</div>
                             <p className="text-xs text-muted-foreground">Score: {testResults.stress.score}</p>
                           </>
                        ) : (
                             <div className="text-2xl font-bold">-</div>
                        )}
                    </CardContent>
                </Card>
                 <Card className="bg-muted/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2"><Bed className="w-4 h-4"/> Sleep Quality</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {testResults.sleep ? (
                           <>
                             <div className="text-2xl font-bold">{testResults.sleep.category}</div>
                             <p className="text-xs text-muted-foreground">{testResults.sleep.hours.toFixed(1)} hrs average</p>
                           </>
                       ) : (
                            <div className="text-2xl font-bold">-</div>
                       )}
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Upcoming Refills</CardTitle>
            <CardDescription>Medications that are running low and need to be refilled soon.</CardDescription>
        </CardHeader>
        <CardContent>
            {upcomingRefills.length > 0 ? (
                <ul className="space-y-4">
                    {upcomingRefills.map(refill => (
                        <li key={refill.name} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                            <div>
                                <span className="font-medium">{refill.name}</span>
                                <p className="text-sm text-destructive font-semibold">
                                    {refill.daysLeft} days left
                                </p>
                            </div>
                            <Button size="sm" onClick={() => addToCart(refill.name)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add to Cart
                            </Button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted-foreground text-center py-4">No upcoming refills in the next 15 days.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
