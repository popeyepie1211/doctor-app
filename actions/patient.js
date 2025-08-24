"use server"

import { auth } from "@clerk/nextjs/server"




export async function getPatientAppointments() {
 const {userId} =await auth();


 if(!userId) {
   throw new Error("User not authenticated");
 }

 try {
    const user= await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "PATIENT"
    },
    select: {
      id: true,
    }
    });
    if(!user) {
      throw new Error("User not found");
    }
    const appointments = await db.appointment.findMany({
      where: {
        patientId: user.id
      },
      include:{
        doctor:{
            select:{
                id: true,
                name: true,
                specialty: true,
                imageUrl: true
            }
        }
      },
      orderBy:{
        startTime: "asc"
      }
    });
      return {appointments}
 } catch (error) {
   console.error("Error fetching patient appointments:", error);
   throw new Error("Failed to fetch patient appointments");
 }
}