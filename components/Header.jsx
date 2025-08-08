

import Link from 'next/link'
import React from "react";
import { Button } from "@/components/ui/button";
import { UserButton,SignInButton,SignUpButton,SignedIn,SignedOut } from '@clerk/nextjs';
import Image from 'next/image'
 import { checkUser } from '@/lib/checkUser';
import { Calendar, CreditCard, ShieldCheckIcon, Stethoscope, User } from 'lucide-react';
import { checkAndAllocateCredits } from '@/actions/credits';
import { Badge } from './ui/badge';


const Header = async() => {

  // Check if the user is logged in
  const user = await checkUser();
  if(user?.role==="PATIENT" ) {
   await checkAndAllocateCredits(user);
  }
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
            <SignedIn>
               {user?.role=="ADMIN" && (
                <Link href="/admin">
                <Button variant="outline"
                className="hidden md:inline-flex items-center gap-2 hover:text-blue-400">
                  <ShieldCheckIcon className="h-4 w-4" />
                 Admin Dashboard
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  

                  <ShieldCheckIcon className="h-4 w-4 text-emerald-400" />

                </Button>
                </Link>
              )}





              {user?.role=="PATIENT" && (
                <Link href="/appointments">
                <Button variant="outline"
                className="hidden md:inline-flex items-center gap-2 hover:text-blue-400 ">
                  <Calendar className="h-4 w-4" />
                  My Appointments
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  

                  <Calendar className="h-4 w-4 text-emerald-400" />
                  
                </Button>
                </Link>
              )}




               {user?.role=="DOCTOR" && (
                <Link href="/doctor">
                <Button variant="outline"
                className="hidden md:inline-flex items-center gap-2 hover:text-blue-400">
                  <Stethoscope className="h-4 w-4" />
                  Doctor Dashboard
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  

                  <Stethoscope className="h-4 w-4 text-emerald-400" />
                  
                </Button>
                </Link>
              )}

              {user?.role=="UNASSIGNED" && (
                <Link href="/onboarding">
                <Button variant="outline"
                className="hidden md:inline-flex items-center gap-2 hover:text-blue-400">
                  <User className="h-4 w-4" />
                  Complete Profile
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  

                  <User className="h-4 w-4 text-emerald-400" />
                  
                </Button>
                </Link>
              )}
            </SignedIn>
              {(!user || user?.role==="PATIENT") && (
                <Link href="/pricing">
                  <Badge variant="outline"
                    className="hidden md:inline-flex items-center gap-2 hover:text-blue-400">
                    
                      <CreditCard className="h-4 w-4 text-emerald-400" />
                      <span className='text-emerald-400'>
                        {user && user?.role=="PATIENT" ? ( 
                          <>
                            {user.credits}{" "}
                            <span className="hidden md:inline">Credits</span>
                          </>
                        ) : (
                          <>Pricing</>
                        )}
                      </span>
                    </Badge>
                  </Link>
                )}







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
              }}
                />
            </SignedIn>
           </div>

        </nav>
    </header>
  )
}

export default Header