import React from 'react'
import { getCurrentUser } from '@/actions/onboarding'; // Assuming you have a function to get the current user
import { redirect } from 'next/navigation';
import { getAvailabilitySlots, getDoctorAppointments} from '@/actions/doctor';
import { Calendar, Clock } from 'lucide-react';
import { Tabs, TabsContent } from '@radix-ui/react-tabs';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import AvailabilitySettings from './_components/availability-settings'
import AppointmentList from './_components/appointment-list';

const DoctorDashboard = async() => {
    const user= await getCurrentUser(); // Assuming you have a function to get the current user

    const [appointmentData,availabilityData] = await Promise.all([
         getDoctorAppointments(), getAvailabilitySlots()
    ]);
   

    if(user?.verificationStatus !== 'VERIFIED') {
        redirect('/doctor/verification');
    }

    if (user?.role !== 'DOCTOR') {
       redirect('/onboarding');
    }


    return (
        <Tabs defaultValue="appointments" className="grid grid-cols-1 gap-4 md:grid-cols-4 shadow-md rounded-lg px-4">
        <TabsList className="md:col-span-1 bg-muted/30 border h-14 md:h-40 flex sm:flex-row md:flex-col w-full p-2 md:p-1 rounded-md md:space-y-2 sm:space-x-2 md:space-x-0">
          <TabsTrigger
            value="appointments"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full hover:bg-muted/50 "
          >
            <Calendar className="h-4 w-4 mr-2 hidden md:inline text-amber-300" />
            <span>Appointments</span>
          </TabsTrigger>
          <TabsTrigger
            value="availability"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <Clock className="h-4 w-4 mr-2 hidden md:inline text-blue-500" />
            <span>Availability</span>
          </TabsTrigger>
          
        </TabsList>
        <TabsContent value="appointments" className="md:col-span-3 p-4">
          <AppointmentList appointments={appointmentData.appointments || []}  />
        </TabsContent>
        <TabsContent value="availability" className="md:col-span-3 p-4">
            <AvailabilitySettings slots={availabilityData.slots || []} />       {/* what this does is it passes the availability slots to the AvailabilitySettings component */}
        </TabsContent>
      </Tabs>
    )
}

export default DoctorDashboard