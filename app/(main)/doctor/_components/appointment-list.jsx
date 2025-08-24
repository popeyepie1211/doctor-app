import AppointmentCard from '@/components/appointment-card'
import { CalendarCheck } from 'lucide-react'
import React from 'react'
import { Card,CardContent,CardTitle,CardHeader } from '@/components/ui/card'
const AppointmentList = ({appointments}) => {
  return (
   <Card  className="border-emerald-900/20">
  <CardHeader >
    <CardTitle className="text-xl font-bold text-blue-500 flex items-center">
        <CalendarCheck className='h-5 w-5 mr-2 text-emerald-500'/> Upcoming Appointments
    </CardTitle>
  </CardHeader>
  <CardContent>
    {appointments.length > 0 ? (
      <div className='space-y-2'>

        {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              userRole="DOCTOR"
            />
        ))}
      </div>
    ) : (
      console.log(appointments.id),
      <p>No upcoming appointments</p>
    )}
  </CardContent>
  
</Card>
  )
}

export default AppointmentList