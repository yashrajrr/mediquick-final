'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Beaker, ShoppingBag, Heart, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthLayout } from '@/components/AuthLayout';

const featureCards = [
    {
    title: "Shop for Medication",
    description: "Browse our extensive catalog of medications and health products. Get fast, reliable delivery right to your doorstep.",
    link: "/dashboard/shop",
    icon: ShoppingBag,
    imageHint: "online pharmacy",
    cta: "Start Shopping",
  },
  {
    title: "Drug Interaction Checker",
    description: "Check your medications for potentially harmful interactions to ensure your safety and well-being.",
    link: "/dashboard/interaction-checker",
    icon: Beaker,
    imageHint: "pills medication",
    cta: "Check Medications",
  },
  {
    title: "AI Prescription Analysis",
    description: "Upload a photo of your prescription and let our AI extract the details, saving you time and effort.",
    link: "/dashboard/prescription-analysis",
    icon: Stethoscope,
    imageHint: "prescription analysis",
    cta: "Analyze Prescription",
  },
  {
    title: "Home Health Tests",
    description: "Perform simple guided tests at home, like BMI calculation and breathing exercises, to monitor your well-being.",
    link: "/dashboard/home-tests",
    icon: Heart,
    imageHint: "health monitoring",
    cta: "Start a Test",
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function DashboardHomePage() {
  
  return (
    <AuthLayout>
        <div className="space-y-8">
        <header className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Welcome to MediQuick!</h1>
            <p className="text-muted-foreground text-lg">Here's your personal health assistant dashboard.</p>
        </header>
        
        <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
                <motion.div key={feature.title} variants={cardVariants}>
                    <Card className="flex flex-col overflow-hidden shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1 h-full">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <CardDescription className="text-base">{feature.description}</CardDescription>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full rounded-full">
                        <Link href={feature.link}>
                            {feature.cta} <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        </Button>
                    </CardFooter>
                    </Card>
                </motion.div>
            );
            })}
        </motion.div>
        </div>
    </AuthLayout>
  );
}
