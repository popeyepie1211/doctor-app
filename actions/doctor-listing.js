"use server";

import { db } from "@/lib/prisma";



export async function doctorsListBySpecialty(specialty) {
    if (!specialty) {
        throw new Error("Specialty is required");
    }

    try {
        const doctors = await db.user.findMany({
            where: {
                verificationStatus:"VERIFIED",
                role:"DOCTOR",  
                specialty:specialty.split("%20").join(" ") // Convert URL encoded specialty to normal string,

              
            },
            orderBy: {
                name: 'asc', // Order by name in ascending order

            }
        });

   return {doctors}
    } catch (error) {
        console.error("Error fetching doctors by specialty:", error);
        throw new Error("Failed to fetch doctors by specialty");
        
    }
    
}