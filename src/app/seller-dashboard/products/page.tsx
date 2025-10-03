'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2, PackageSearch } from 'lucide-react';
import type { Product } from '@/app/dashboard/shop/products';
import { baseProducts } from '@/app/dashboard/shop/products';

const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  price: z.preprocess(
    (val) => Number(String(val)),
    z.number().positive('Price must be a positive number')
  ),
  category: z.string().min(1, 'Category is required'),
  prescriptionRequired: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const saveProducts = (products: Product[]) => {
    try {
        localStorage.setItem('products', JSON.stringify(products));
        window.dispatchEvent(new Event('productsUpdated'));
        return true;
    } catch (error) {
        console.error("Failed to save products", error);
        return false;
    }
};

export default function SellerProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const { toast } = useToast();
    
    useEffect(() => {
        try {
            const storedProducts = localStorage.getItem('products');
            if (storedProducts) {
                setProducts(JSON.parse(storedProducts));
            } else {
                setProducts(baseProducts);
                localStorage.setItem('products', JSON.stringify(baseProducts));
            }
        } catch (e) {
            console.error("Failed to load products, using default.", e);
            setProducts(baseProducts);
        }
    }, []);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            price: 0,
            category: '',
            prescriptionRequired: false,
        },
    });

    const onSubmit: SubmitHandler<ProductFormValues> = (data) => {
        let updatedProducts: Product[];
        if (editingProduct) {
            // Editing existing product
            updatedProducts = products.map(p => p.id === editingProduct.id ? { ...p, ...data } : p);
            toast({ title: 'Product Updated', description: `${data.name} has been updated.` });
        } else {
            // Adding new product
            const newProduct: Product = { ...data, id: Date.now() };
            updatedProducts = [...products, newProduct];
            toast({ title: 'Product Added', description: `${data.name} has been added to your inventory.` });
        }

        if (saveProducts(updatedProducts)) {
            setProducts(updatedProducts);
            setDialogOpen(false);
            setEditingProduct(null);
            form.reset();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save product changes.' });
        }
    };
    
    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        form.reset(product);
        setDialogOpen(true);
    };
    
    const handleDelete = (productId: number) => {
        const updatedProducts = products.filter(p => p.id !== productId);
        if (saveProducts(updatedProducts)) {
            setProducts(updatedProducts);
            toast({ title: 'Product Removed', description: 'The product has been removed from your inventory.' });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not remove the product.' });
        }
    };

    const openAddDialog = () => {
        setEditingProduct(null);
        form.reset({ name: '', price: 0, category: '', prescriptionRequired: false });
        setDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Manage Products</h1>
                    <p className="text-muted-foreground">Add, edit, or remove products from your inventory.</p>
                </div>
                <Button onClick={openAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Your Inventory</CardTitle>
                    <CardDescription>A list of all products you currently offer.</CardDescription>
                </CardHeader>
                <CardContent>
                    {products.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-center">Rx Required</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map(product => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell className="text-right">₹{product.price.toFixed(2)}</TableCell>
                                        <TableCell className="text-center">{product.prescriptionRequired ? 'Yes' : 'No'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-4">
                            <PackageSearch className="w-16 h-16" />
                            <p>You haven't added any products yet.</p>
                            <Button onClick={openAddDialog}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Product
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add a New Product'}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Name</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price (₹)</FormLabel>
                                            <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="prescriptionRequired"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Prescription Required</FormLabel>
                                            <FormMessage />
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingProduct ? 'Save Changes' : 'Add Product'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

    