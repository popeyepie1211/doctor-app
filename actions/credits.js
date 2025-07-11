"use server"

import { auth } from "@clerk/nextjs/server";

    import { format } from "date-fns";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";    

const PLAN_CREDITS = {
    free_user: 0,
    standard:10,
    premium: 24
    };

const APPOITMENT_CREDIT_COST = 2;



export async function checkAndAllocateCredits(user) {

try {
    if (!user) {
        console.log("No user is logged in.");
        return null;

    }

    if(user.role !== "PATIENT") {
        return user;
    }

    const { has }=await auth(); // Check if the user is authenticated
    const hasBasic=has({     // Check if the user has a basic plan
        plan: "free_user",
    });

    const hasStandard=has({
        plan: "standard",// Check if the user has a standard plan
    });

    const hasPremium=has({
        plan: "premium",     // Check if the user has a premium plan
    });


    let currentPlan = null; // Initialize the current plan variable
let creditsToAllocate = 0; // Initialize the credits to allocate variable

    // Determine the current plan and credits to allocate based on the user's plan

if(hasBasic) {
        currentPlan = "free_user";
        creditsToAllocate = PLAN_CREDITS.free_user; // Set credits for free user
    }
else if(hasStandard) {
        currentPlan = "standard";
        creditsToAllocate = PLAN_CREDITS.standard; // Set credits for standard user
    } else if(hasPremium) {
        currentPlan = "premium";
        creditsToAllocate = PLAN_CREDITS.premium; // Set credits for premium user
    } 
if (!currentPlan) {
        console.log("User does not have a valid plan.");
        return user; // Return user if no valid plan is found
    }

    const currentMonth =format(new Date(),"yyyy-MM"); // Get the current month (1-12)

if(user.transactions.length>0) { // Check if the user has any transactions
    const lastTransaction = user.transactions[0]; // Get the most recent transaction
    const transactionMonth = format(new Date(lastTransaction.createdAt), "yyyy-MM"); // Get the month of the last transaction
    
const transactionPlan = lastTransaction.packageId; // Get the package ID from the transaction

if(
   transactionMonth === currentMonth &&
        transactionPlan === currentPlan   // Check if the last transaction is from the current month and matches the current plan
      ) {
        return user;
      }
    }

const updatedUser = await db.$transaction(async (tx) => {
      // Create transaction record
      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: creditsToAllocate,
          type: "CREDIT_PURCHASE",
          packageId: currentPlan,
        },
      });

      // Update user's credit balance
      const updatedUser = await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          credits: {
            increment: creditsToAllocate,
          },
        },
      });

      return updatedUser;
    });

    // Revalidate relevant paths to reflect updated credit balance
    revalidatePath("/doctors");
    revalidatePath("/appointments");

    return updatedUser;
  } catch (error) {
    console.error(
      "Failed to check subscription and allocate credits:",
      error.message
    );
    return null;
  }
}
