import { addDays, addMinutes, endOfDay, isBefore } from "date-fns";

export async function getDoctorById(doctorId) {

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

export async function getAvailableTimeSlots(doctorId) {
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
        const availabilitySlots = await db.availability.findfirst({
            where: {
                doctorId: doctor.id,
                status: "AVAILABLE",
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
                status:"SCHEDULED",
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
            const availabilityStartTime = new Date(availability.startTime); 
            const availabilityEndTime = new Date(availability.endTime);

        
           //Sets the date of availability time to match the current day in the loop.
           //Example: Sets 10:00 AM to 10:00 AM on August 7.
            availabilityStartTime.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
            availabilityEndTime.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());

               let currentTime = new Date(availabilityStartTime); // Start from the beginning of the doctor's availability window
               let endTime = new Date(availabilityEndTime); // Set the end time to the doctor's availability end time

        // Loop runs to generate 30-minute slots until endTime.
        while(isBefore(addMinutes(currentTime, 30), end) || +addMinutes(currentTime, 30)===+endTime)
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
            day,
            displayDate:
            slots.length > 0
            ? slots[0].day // Use the first slot's day for display
            : format(new Date(day), "EEEE, MMMM d"), // Fallback to formatted date
            slots,
        }));

        return{ days: result }; // Return the available time slots grouped by day


    } catch (error) {
        console.error("Error fetching available time slots:", error.message);
      
    }
}
