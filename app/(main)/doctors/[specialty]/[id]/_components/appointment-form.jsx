"use client"

import React from 'react'

import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, CreditCard, Loader2 } from 'lucide-react';
import  useFetch from '@/hooks/fetch-api';
import { bookAppointment } from '@/actions/appointments';
import { useState, useEffect} from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
const AppointmentForm = ({ doctorId, slot, onBack, onComplete }) => {
 
   const { loading, data, fn: submitBooking } = useFetch(bookAppointment);
    
    const [description, setDescription] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const formData = new FormData();
    console.log("Submitting doctorId:", doctorId);
     formData.append("doctorId", doctorId);
    formData.append("startTime", slot.startTime);
    formData.append("endTime", slot.endTime);
     formData.append("patientDescription", description);
  
     await submitBooking(formData);
    }

     useEffect(() => {
    if (data) {
      if (data.success) {
        toast.success("Appointment booked successfully!");
        onComplete();
      }
    }
  }, [data]);


  return (

    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-muted/20 p-4 rounded-lg border border-emerald-900/20 space-y-3">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-emerald-400 mr-2" />
          <span className="text-white font-medium">
            {format(new Date(slot.startTime), "EEEE, MMMM d, yyyy")}
          </span>
        </div>
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-emerald-400 mr-2" />
          <span className="text-white">{slot.formatted}</span>
        </div>
        <div className="flex items-center">
          <CreditCard className="h-5 w-5 text-emerald-400 mr-2" />
          <span className="text-muted-foreground">
            Cost: <span className="text-white font-medium">2 credits</span>
          </span>
        </div>
      </div>
      <div className="space-y-2">
      <Label htmlFor="description" >
        Describe Your Concern 
      </Label>
      <Textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}  // Update description state
        className="w-full p-2 border border-emerald-900/20 rounded-lg"
        placeholder="Enter any details about your concern"
      />
      <p className='text-sm text-muted-foreground'>
        Please provide a brief description of your concern to help the doctor prepare for your appointment.
      </p>
      </div>

      <div className="flex justify-between pt-3">
     <Button 
       type="button" 
       variant="outline"
       onClick={onBack}
       disabled={loading}
        className="w-1/2 mr-2 border-emerald-900 "
       >
       <ArrowLeft className="h-4 w-4 mr-2" />
       Change Slot
       </Button>
       <Button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : (
            "Confirm Booking"
          )}
        </Button>


      </div>   
    </form>
  )
}

export default AppointmentForm