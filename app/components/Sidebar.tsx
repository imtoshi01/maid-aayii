'use client'

import { useState } from 'react'
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
import AddServiceProviderForm from './AddServiceProviderForm'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="fixed left-4 top-4 z-50 lg:hidden">
          Menu
        </Button>
      </SheetTrigger>
      <div className="hidden lg:block w-64 h-screen bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">Menu</h2>
        <Button onClick={() => setIsOpen(true)}>Add New Service Provider</Button>
      </div>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Add New Service Provider</SheetTitle>
          <SheetDescription>
            Enter the details of the new service provider here.
          </SheetDescription>
        </SheetHeader>
        <AddServiceProviderForm onSuccess={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}

