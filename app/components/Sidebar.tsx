'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { getServiceProviders } from '../lib/api'
import AddServiceProviderForm from './AddServiceProviderForm'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [serviceProviders, setServiceProviders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const providers = await getServiceProviders();
        setServiceProviders(providers);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="fixed left-4 top-4 z-50 lg:hidden">
          Menu
        </Button>
      </SheetTrigger>
      <div className="hidden lg:block w-64 h-screen bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">Menu</h2>
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Service Providers List</h3>
          <ul className="list-disc pl-4">
            {serviceProviders.map((provider) => (
              <li key={provider.id}>{provider.name}</li>
            ))}
          </ul>
        </div>
        <Button onClick={() => setIsOpen(true)}>Add New Service Provider</Button>
      </div>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Service Providers</SheetTitle>
          <SheetDescription>Manage and view all service providers.</SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <AddServiceProviderForm />
        </div>
      </SheetContent>
    </Sheet>
  );
}
