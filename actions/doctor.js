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
   
    const { userId } = await auth();

    if(!userId) {
        return { error: "Unauthorized" };
    }
    try {
            const doctor = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "DOCTOR",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const appointments = await db.appointment.findMany({
      where: {
        doctorId: doctor.id,
        status: {
          in: ["SCHEDULED"],
        },
      },
      include: {
        patient: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return { appointments };
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    return { error: "Failed to fetch doctor appointments" };
  }
}

export async function cancelAppointments(formData) {
const {userId}= await auth();

if(!userId){
    return { error: "Unauthorized" };

}
try {

    const user = await db.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!user) {
        return { error: "User not found" };
    }

    const appointmentId = formData.get("appointmentId");
    if (!appointmentId) {
        return { error: "Appointment ID is required" };
    }

    // Find the appointment
    const appointment = await db.appointment.findUnique({
        where: {
            id: appointmentId,
        },
        include: {
            patient: true,
            doctor: true,
        },
    });

    if (!appointment) {
        return { error: "Appointment not found" };
    }

    // Check if the user is authorized to cancel the appointment
    if (appointment.doctorId !== userId && appointment.patientId !== userId) {
        return { error: "You are not authorized to cancel this appointment" };
    }

     await db.$transaction(async (tx) => {
        await tx.appointment.update({
            where: {
                id: appointmentId,
            },
            data: {
                status: "CANCELLED",
            },
        });
    
        


        // Refund credits to the patient if the appointment is cancelled
       
            await tx.creditTransaction.create({
                data: {
                    userId: appointment.patientId,
                    amount: 2, // Refund amount
                    type: "APPOINTMENT_DEDUCTION",   
                },
            });
        await tx.creditTransaction.create({
            data: {
                userId: appointment.doctorId,
                amount: -2,
                type: "APPOINTMENT_DEDUCTION",
            },
        });
        await tx.user.update({
            where: { id: appointment.patientId },
            data: { credits: { increment: 2 } }, // Increment credits by 2
        });

        //update doctor credits 
        await tx.user.update({
            where: { id: appointment.doctorId },
            data: { credits: { decrement: 2 } }, // Decrement credits by 2
        });
    });

    // Cancel the appointment

if(user.role=="DOCTOR"){
    revalidatePath("/doctor");
}else if(user.role=="PATIENT"){
    revalidatePath("/appointments");
}


    return { success: true };
} catch (error) {
    console.error("Error cancelling appointment:", error);
    return { error: "Failed to cancel appointment" };
}
}
       
export async function addAppointmentNotes(formData) {
    const { userId } = await auth();

    if (!userId) {
        return { error: "Unauthorized" };
    }

    try {
        const doctor = await db.user.findUnique({
            where: {
                clerkUserId: userId,
                role: "DOCTOR",
            },
        });
        if (!doctor) {
            return { error: "Doctor not found" };
        }

        const appointmentId = formData.get("appointmentId");
        const notes = formData.get("notes");
        const appointment = await db.appointment.findUnique({
            where: { id: appointmentId,
                doctorId: doctor.id,
             },
        });
        if (!appointment) {
            return { error: "Appointment not found" };
        }

        const updatedAppointment = await db.appointment.update({
            where: { id: appointmentId },
            data: { notes },
        });
    revalidatePath("/doctor");
        return { success: true, appointment: updatedAppointment };
    } catch (error) {
        console.error("Error adding appointment notes:", error);
        return { error: "Failed to add appointment notes" };
    }
}

export async function markAppointmentCompleted(formData) {
    const { userId } = await auth();

    if (!userId) {
        return { error: "Unauthorized" };
    }

    try {
        const doctor = await db.user.findUnique({
            where: {
                clerkUserId: userId,
                role: "DOCTOR",
            },
        });
        if (!doctor) {
            return { error: "Doctor not found" };
        }

        const appointmentId = formData.get("appointmentId");
        const appointment = await db.appointment.findUnique({
            where: { id: appointmentId, doctorId: doctor.id },
            include: {
                patient: true,
            },
        });
        if (!appointment) {
            return { error: "Appointment not found" };
        }
        if(appointment.status !== "SCHEDULED") {
            return { error: "Appointment is not scheduled" };
        }

        const now = new Date();
        const appointmentEndTime = new Date(appointment.endTime);
        if (now < appointmentEndTime) {
            return { error: "Appointment has not ended yet" };
        }

        const updatedAppointment = await db.appointment.update({
            where: { id: appointmentId },
            data: { status: "COMPLETED" },
        });

        revalidatePath("/doctor");
        return { success: true, appointment: updatedAppointment };
    } catch (error) {
        console.error("Error marking appointment as completed:", error);
        return { error: "Failed to mark appointment as completed" };
    }
}