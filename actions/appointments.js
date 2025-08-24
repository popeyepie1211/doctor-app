"use server"

import { addDays, addMinutes, endOfDay, isBefore } from "date-fns";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Auth } from "@vonage/auth";
import { Vonage } from "@vonage/server-sdk";
import { creditsDeduction } from "./credits";
import { SlotStatus } from "@/lib/generated/prisma";

// Initialize Vonage SDK with credentials
const credentials= new Auth({
    applicationId: process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID,
    privateKey: process.env.VONAGE_PRIVATE_KEY  

    
});

const vonage = new Vonage(credentials, {}); // Create a new Vonage instance with the credentials



export async function getDoctorById(doctorId) {    // Function to fetch a doctor by their ID

    try {
        const doctor = await db.user.findUnique({
            where: {
                id: doctorId,
                role: "DOCTOR",
                verificationStatus: "VERIFIED"
            
            },
        });
    
        if (!doctor) {
            throw new Error("Doctor not found");
        }
        
        return {doctor};  // Return the doctor information      
    } catch (error) {
        console.error("Error fetching doctor by ID:", error);
        throw new Error("Failed to fetch doctor information");
        
    }
}

export async function getAvailableTimeSlots(doctorId) {   // Function to get available time slots for a doctor
     try {
        const doctor = await db.user.findUnique({
            where: {
                id: doctorId,
                role: "DOCTOR",
                verificationStatus: "VERIFIED"
            
            },
        });
    
        if (!doctor) {
            throw new Error("Doctor not found");
        }

        console.log("SlotStatus check:", SlotStatus);
console.log("AVAILABLE value:", SlotStatus?.AVAILABLE);
        const availabilitySlots = await db.availability.findFirst({
            where: {
                doctorId: doctor.id,
                status: SlotStatus.AVAILABLE,
            },
        });
        if (!availabilitySlots) {
            throw new Error("No available time slots found for this doctor");
        }

        const now= new Date();  // Current date and time
        // Generate the next 4 days of availability slots
        const days=[now, addDays(now, 1), addDays(now, 2), addDays(now, 3)]; // Array of next 4 days

        const lastDay=endOfDay(days[3]); // Finds the end time (11:59 PM) of the 4th day


        //Get all already scheduled appointments for the doctor that fall within the next 4 days
        const existingSlots = await db.availability.findMany({
            where: {
                doctorId: doctor.id,
                status: SlotStatus.SCHEDULED,
                startTime: {
                    lte: lastDay, // Ensure we only consider slots up to the end of the last day
                },
            },  
        });

        const availableslotsByDay = {};  //Initialize an empty object to store available time slots for each day

        for(const day of days) {   // Iterate through each day
            const dayString = format(day, "yyyy-MM-dd");
            availableslotsByDay[dayString] = []; // Initialize an empty array for each day


           //Convert availability window to Date objects.
         const availabilityStartTime = new Date(availabilitySlots.startTime); 
          const availabilityEndTime = new Date(availabilitySlots.endTime);

        
           //Sets the date of availability time to match the current day in the loop.
           //Example: Sets 10:00 AM to 10:00 AM on August 7.
            availabilityStartTime.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
            availabilityEndTime.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());

               let currentTime = new Date(availabilityStartTime); // Start from the beginning of the doctor's availability window
               let endTime = new Date(availabilityEndTime); // Set the end time to the doctor's availability end time

        // Loop runs to generate 30-minute slots until endTime.
        while(isBefore(addMinutes(currentTime, 30), endTime) || +addMinutes(currentTime, 30)===+endTime)
        {
            const next=addMinutes(currentTime, 30); // Add 30 minutes to the current time
        


            // If the slot is in the past, skip it.
            if(isBefore(currentTime, now)){
                currentTime = next;

                continue; 


            }
            // Check if the current slot overlaps with any existing appointments
            // If it does not overlap, add it to the available slots for the day
            const overlaps = existingSlots.some((appointment) => {
                const aStart = new Date(appointment.startTime);
                const aEnd = new Date(appointment.endTime);
                return (
                    (currentTime >= aStart && currentTime < aEnd) ||
                    (next > aStart && next <= aEnd) ||
                    (currentTime < aStart && next > aEnd)
                );
            });
            if(!overlaps) {
                availableslotsByDay[dayString].push({
                    startTime: currentTime.toISOString(),
                    endTime: next.toISOString(),
                    formatted: `${format(currentTime, "h:mm a")} - ${format(next, "h:mm a")}`, 
                    day:format(currentTime, "EEEE, MMMM d") // Format the time for display
                });
            }
            currentTime = next; // Move to the next time slot
        }
    }
      const result = Object.entries(availableslotsByDay).map(([day, slots]) => ({
            date: day,
            displayDate:
            slots.length > 0
            ? slots[0].day // Use the first slot's day for display
            : format(new Date(day), "EEEE, MMMM d"), // Fallback to formatted date
            slots, // Include the available slots for the day
        }));

        return{ days: result }; // Return the available time slots grouped by day


    } catch (error) {
        console.error("Error fetching available time slots:", error.message);
      return { days: [] }; // Return an empty array if there's an error
    }
}

export async function bookAppointment(formData) { 
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not authenticated");
    }

    try {
        // Get patient
        const patient = await db.user.findFirst({
            where: {
                clerkUserId: userId,
                role: "PATIENT",
            },
        });
        // ✅ Defensive check to ensure patient exists
        if (!patient) {
            throw new Error("Patient not found");
        }

        if (patient.credits < 2) {
            throw new Error("Insufficient credits to book an appointment");
        }

        const doctorId = formData.get("doctorId");
        const startTime = formData.get("startTime");
        const endTime = formData.get("endTime");
        const patientDescription = formData.get("patientDescription") || null;

        if (!doctorId || !startTime || !endTime) {
            throw new Error("Missing required fields");
        }

        const { doctor } = await getDoctorById(doctorId);
        if (!doctor) {
            throw new Error("Doctor not found");
        }

        const overlappAppointment = await db.appointment.findFirst({
            where: {
                doctorId: doctor.id,
                status: SlotStatus.SCHEDULED,
                OR: [
                    { startTime: { lte: startTime }, endTime: { gt: startTime } },
                    { startTime: { lt: endTime }, endTime: { gte: endTime } },
                    { startTime: { gte: startTime }, endTime: { lte: endTime } },
                ],
            },
        });
        // ✅ Defensive check to ensure no overlapping appointments
        if (overlappAppointment) {
            throw new Error("This time slot is already booked. Please choose another time.");
        }

        const sessionId = await createVideoSession();

        // ✅ Defensive check before using patient
        if (!patient?.id) {
            throw new Error("Patient object is invalid");
        }

        const { success, error } = await creditsDeduction(patient.id, doctor.id);
        if (!success) {
            throw new Error(error || "Failed to deduct credits");
        }

        const appointment = await db.appointment.create({
            data: {
                doctorId: doctor.id,
                patientId: patient.id,
                startTime,
                endTime,
                patientDescription,
                videoSessionId: sessionId,
                status: SlotStatus.SCHEDULED,
            },
        });

        revalidatePath("/appointments");

        return { success: true, appointment, sessionId };
    } catch (error) {
        throw new Error("Failed to book appointment: " + error.message);
    }
}



async function createVideoSession() {   // Function to create a video session using Vonage
        try {
            const session = await vonage.video.createSession({  mediaMode: "routed", //routed here menas that the media is routed through Vonage's servers
            });
           return session.sessionId;   // Return the session ID of the created video session
        } catch (error) {
            console.error("Error creating video session:", error);
            throw new Error("Failed to create video session");
            
        }
    };

export async function generatevideoToken(formData){
    const { userId } = await auth();

    if (!userId) {
        return { error: "Unauthorized" };
    }

    try {
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
                
            },
        });
        if (!user) {
            return { error: "User not found" };
        }
        const appointmentId = formData.get("appointmentId");

       const appointment = await db.appointment.findUnique({
           where: { id: appointmentId },
       });
       if (!appointment) {
           return { error: "Appointment not found" };
       }

       if(appointment.doctorId!==user.id && appointment.patientId!==user.id) {
           throw new Error("Unauthorized to join this call");


        }
        if(appointment.status!=="SCHEDULED") {
           throw new Error("Appointment is not scheduled");
       }

       const now = new Date();
       const appointmentTime = new Date(appointment.startTime);
       const timeDifference = (appointmentTime - now)/(1000*60); //it is to check whether the appointment is within the next 30 minutes
       if(timeDifference>30){
           throw new Error("the call cannot be started within the next 30 minutes");
       }
       const appointmentEndTime= new Date(appointment.endTime);
       const expirationTime=Math.floor(appointmentEndTime.getTime()/1000)+60*60; // 1 hour after appointment end time
       // the below part is for creating connection data
       const connectionData=JSON.stringify({
        name:user.name,
        role:user.role,
        userId:user.id,
       });




       const token = await vonage.video.generateToken(appointment.videoSessionId,{
        role:"publisher",
        expireTime:expirationTime,
        data: connectionData
       });
       await db.appointment.update({
           where: { id: appointment.id },
           data: { videoSessionToken: token }
       });
       return { success: true, token:token,videoSessionId:appointment.videoSessionId };
   } catch (error) {
       console.error("Error generating video token:", error);
       return { error: "Failed to generate video token" };
    }
}