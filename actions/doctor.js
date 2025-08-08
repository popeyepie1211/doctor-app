"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";


export async function setAvailabilitySlots(formData) {

    const { userId } = await auth();

    if (!userId) {
        return { error: "Unauthorized" };
    }
    try {
        const doctor = await db.user.findUnique({
            where: {
                clerkUserId: userId,
                role: "DOCTOR"
            }
        });
    
        if (!doctor) {
            return { error: "Doctor not found" };
        }
    
        const startTime = formData.get("startTime");
        const endTime = formData.get("endTime");    
    
    if (!startTime || !endTime) {
        return { error: "Start time and end time are required" };
      }
    
      if(startTime >= endTime) {
        return { error: "Start time must be before end time" };
      }

      const existingSlots = await db.availability.findMany({
        where: {
            doctorId: doctor.id,
        }
        });

        if (existingSlots.length > 0) {
            const slotsWithNoAppointments = existingSlots.filter((slot) => !slot.appointment); // Filter out slots that have appointments
        
        
        if(slotsWithNoAppointments.length > 0) {    // If there are existing slots with no appointments, delete them
           await db.availability.deleteMany({
                where: {
                    id:{
                        in: slotsWithNoAppointments.map(slot => slot.id)

                    }
                }
            });

        }
    }
        // Create new availability slots
        const newSlot = await db.availability.create({ 
            data: {
                doctorId: doctor.id,
                startTime: new Date(startTime), // Convert to Date object
                endTime: new Date(endTime), // Convert to Date object
                status: "AVAILABLE", // Set the status to AVAILABLE
            },
        });
        revalidatePath('/doctor');
        return { success: true, slot: newSlot }; 
    

    } catch (error) {
        console.error("Error setting availability slots:", error);
        return { error: "Failed to set availability slots" };
    }
}

export async function getAvailabilitySlots(){
    const { userId } = await auth();

    if (!userId) {
        return { error: "Unauthorized" };
    }

    try {
        const doctor = await db.user.findUnique({
            where: {
                clerkUserId: userId,
                role: "DOCTOR"
            }
        });

        if (!doctor) {
            return { error: "Doctor not found" };
        }

        
       const availabilitySlots = await db.availability.findMany({
            where: {
                doctorId: doctor.id,
            },
            orderBy: {
                startTime: 'asc', // Order by start time
            },
        });
       
        return { slots: availabilitySlots }; // Return the availability slots
    } catch (error) {
        console.error("Error fetching availability slots:", error);
        return { error: "Failed to fetch availability slots" };

    }
}

export async function getDoctorAppointments() {
    return [];

}