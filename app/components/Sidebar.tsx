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
import Link from 'next/link'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
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
      <div className="hidden lg:block w-64 h-screen bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Menu</h2>
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2 text-center">Service Providers List</h3>
          <ul className="space-y-1 text-center">
            {serviceProviders.map((provider) => (
              <li key={provider.id} className="hover:bg-gray-200 rounded-md p-2">
                <Link href={`/service-providers/${provider.id}`} className="text-blue-600 font-bold hover:underline">
                  {provider.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6">
          <Button onClick={() => setIsOpen(true)} className="w-full">
            Add New Service Provider
          </Button>
        </div>
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
