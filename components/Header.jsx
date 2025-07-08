"use client"

import Link from 'next/link'
import React, { createContext } from "react";
import { Button } from "@/components/ui/button";
import { UserButton,SignInButton,SignUpButton,SignedIn,SignedOut } from '@clerk/clerk-react'
import Image from 'next/image'
import { checkUser } from '@/lib/checkUser';
const Header = async() => {

   await checkUser();
  return (
    
    <header className='fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-10 supports-[backdrop-filter]:bg-background/60'>
        <nav className='container mx-auto px-4 h-16 flex items-center justify-between'>
            <Link href="/">
            <Image
            src="/logo-single.png"
            alt="Medimeet Logo"
            width={200}
            height={60} 
            className="h-10 w-auto object-contain"/>
            </Link>

           <div  className='flex items-center space-x-2'>
            <SignedOut>
              <SignInButton >
              <Button variant="secondary" className="bg-teal-900S text-emerald-300 rounded-b-sm font-sm text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                Sign In
              </Button>
              </SignInButton>
              <SignUpButton>
                <Button className="bg-emerald-600 text-white rounded-b-md font-sm :text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                  Sign Up
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton 
              appearance={{
                elements: {
                  userButton: 'flex items-center space-x-2',
                  userAvatar: 'w-8 h-8 rounded-full',
                  userName: 'text-sm font-medium',
                  userEmail: 'text-xs text-muted-foreground',
                },
              }}/>
            </SignedIn>
           </div>

        </nav>
    </header>
  )
}

export default Header