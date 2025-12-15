"use client";
import React, { useEffect } from 'react';
import { useState } from 'react';
import { generateVideoToken} from '@/actions/appointments';
import { cancelAppointment,addAppointmentNotes,markAppointmentCompleted } from '@/actions/doctor';
import useFetch from '@/hooks/fetch-api';
import { CardContent } from './ui/card';
import { Card } from './ui/card';
import format from 'date-fns/format';
import { Calendar, CheckCircle2, Clock, Edit, Loader, Loader2, User, } from 'lucide-react';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { Video } from 'lucide-react';
import { set } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';



const AppointmentCard = ({ appointment, userRole }) => {

  const [open, setOpen] = useState(false);
  const [action, setAction] = useState(null);
  const [notes, setNotes] = useState(appointment.notes || "");   // used for notes

const {
    loading: cancelLoading,
    fn: submitCancel,
    data: cancelData,
  } = useFetch(cancelAppointment);
  const {
    loading: notesLoading,
    fn: submitNotes,
    data: notesData,
  } = useFetch(addAppointmentNotes);
  const {
    loading: tokenLoading,
    fn: submitTokenRequest,
    data: tokenData,
  } = useFetch(generateVideoToken);
  const {
    loading: completeLoading,
    fn: submitMarkCompleted,
    data: completeData,
  } = useFetch(markAppointmentCompleted);


  const router=useRouter();
  const otherParty=
    userRole === "DOCTOR" ? appointment.patient : appointment.doctor;
  
     const otherPartyLabel = userRole === "DOCTOR" ? "Patient" : "Doctor";
  const otherPartyName = otherParty?.name || "Unknown";
  const otherPartyIcon= userRole === "DOCTOR" ? "😷" : "👨‍⚕️";
  
  const formatDateTime=(dateString)=>{
    try{
      return format(new Date(dateString), "MMMM d, yyyy 'at' h:mm a");

    }catch(e){
      return "Invalid Date";
    }
  }
  
  const formatTime=(dateString)=>{
    try{
      return format(new Date(dateString), "h:mm a");

    }catch(e){
      return "Invalid Date";
    }
  }


   const markCompleted=()=>{

    if(userRole !=="DOCTOR" && appointment.status ==="SCHEDULED"){
      return false;
    }

    const now = new Date();
    const appointmentEndTime= new Date(appointment.endTime);
    return now >= appointmentEndTime;

  }
    
  const handleMarkComplete= async()=>{
    if(completeLoading ) return ;

    if(window.confirm(
      "Are you sure you want to mark this appointment as completed?"
    )) {
      const formData = new FormData();
      formData.append("appointmentId", appointment.id);
      await submitMarkCompleted(formData);
    }
  }

  useEffect(() => {
    if(completeData?.success) {
      toast.success("Appointment marked as completed");
      setOpen(false); //it simply closes the dialog if it was open
    }
  }, [completeData]);

    
   const isAppointmentActive = () => {
    const now = new Date();
    const appointmentTime = new Date(appointment.startTime);
    const appointmentEndTime = new Date(appointment.endTime);

    // Can join 30 minutes before start until end time
    return (
      (appointmentTime.getTime() - now.getTime() <= 30 * 60 * 1000 &&
        now < appointmentTime) ||                 // Can join 30 minutes before start
      (now >= appointmentTime && now <= appointmentEndTime)   // Can join during the appointment
    );
  };
     

     const handleJoinVideoCall = async () => {
      
       if (tokenLoading) return; // Prevent multiple clicks

       const formData = new FormData();
       formData.append("appointmentId", appointment.id);
       await submitTokenRequest(formData);
     };
        


  useEffect(() => {
    if (tokenData?.success) {
      router.push( `/video-call?sessionId=${tokenData.videoSessionId}&token=${tokenData.token}&appointmentId=${appointment.id}`
      );
    }
  }, [tokenData, appointment.id]);

       const handleSaveNotes = async () => {
    if (notesLoading) return;

    const formData = new FormData();
    formData.append("appointmentId", appointment.id);
    formData.append("notes", notes);

    await submitNotes(formData);
  };

  useEffect(() => {
    if (notesData?.success) {
      toast.success("Notes saved successfully");
      setAction(null); // Exit editing mode
    }
  }, [notesData]);

  const handleCancelAppointment = async () => {
    if (cancelLoading) return;

    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      const formData = new FormData();
      formData.append("appointmentId", appointment.id);
      await submitCancel(formData);
    }
  };
  useEffect(() => {
  if (cancelData?.success) {
    toast.success("Appointment cancelled successfully");
    setOpen(false);
  } else if (cancelData?.error) {
    toast.error(cancelData.error);
  }
}, [cancelData]);
    return (
      <>
    <Card className="border-emerald-900/20 hover:border-emerald-700/30 transition-all">
      <CardContent className='p-4'>
        <div className='flex flex-col md:flex-row justify-between gap-4'>
          <div className='flex items-start gap-3'>
            <div className='bg-muted/20 rounded-full p-2 mt-1'>
            {otherPartyIcon}
            </div>
            <div>
              <h3 className='font-medium text-white'>
                {userRole=== 'DOCTOR' ?
                  otherPartyName :
                  `Dr. ${otherPartyName}` }

              </h3>

              { userRole ==="DOCTOR" && (
                <p className='text-sm text-muted-foreground'>
                  {otherParty.email}
                </p>
              
              )}

              { userRole === "PATIENT" && (
                <p className='text-sm text-muted-foreground'>
                  {otherParty.specialty}
                </p>
              )}

              <div className='flex items-center mt-2 text-sm text-muted-foreground'>
               <Calendar className='h-4 w-4 mr-2' />
                <span>{formatDateTime(appointment.startTime)}
                </span>
              </div>
              <div className='flex items-center mt-2 text-sm text-muted-foreground'>
               <Clock className='h-4 w-4 mr-1' />
                <span>{formatTime(appointment.startTime)} -{" "}
                  {formatTime(appointment.endTime) }
                </span>
              </div>
            </div>
          </div>
           <div className="flex flex-col gap-2 self-end md:self-start">
              <Badge
                variant="outline"
                className={
                  appointment.status === "COMPLETED"
                    ? "bg-emerald-900/20 border-emerald-900/30 text-emerald-400"
                    : appointment.status === "CANCELLED"
                    ? "bg-red-900/20 border-red-900/30 text-red-400"
                    : "bg-amber-900/20 border-amber-900/30 text-amber-400"
                }
              >
                {appointment.status}
              </Badge>
              <div className='flex gap-2 flex-wrap mt-2'> 
                {markCompleted() && (
                  <Button 
                  size="sm"
                  onClick={handleMarkComplete}
                  disabled={completeLoading}     //it disables the button while loading
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                 {completeLoading ? (<Loader2 className=" h-2 w-2 mr-1 animate-spin" /> ): (<>
                 <CheckCircle2 className="h-4 w-4 mr-1" />
                 Mark as Completed</>
                 )}
                </Button>
                )}
                <Button
                size="sm"
                variant="outline"
                onClick={() => setOpen(true)}
                className="border-emerald-700/15"
              >
                View Details
              </Button>
              </div>
        </div>
        </div>
      </CardContent>
    </Card>
    <Dialog open={open} onOpenChange={setOpen}>

  <DialogContent>
    <DialogHeader>
      <DialogTitle className="text-xl font-bold text-white">
              Appointment Details
            </DialogTitle>
            <DialogDescription>
              {appointment.status === "SCHEDULED"
                ? "Manage your upcoming appointment"
                : "View appointment information"}
            </DialogDescription>
    </DialogHeader>

    {/* Other Party Information */}
    <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
               {otherPartyLabel}
              </h4>
              <div className="flex items-center">
                <div className="h-5 w-5 text-emerald-400 mr-2">
                  {otherPartyIcon}
                </div>
                <div>
                  <p className="text-white font-medium">
                    {userRole === "DOCTOR"
                      ? otherParty.name
                      : `Dr. ${otherParty.name}`}
                  </p>
                  {userRole === "DOCTOR" && (
                    <p className="text-muted-foreground text-sm">
                      {otherParty.email}
                    </p>
                  )}
                  {userRole === "PATIENT" && (
                    <p className="text-muted-foreground text-sm">
                      {otherParty.specialty}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Scheduled Time */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Scheduled Time
              </h4>
              <div className="flex flex-col gap-1">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-emerald-400 mr-2" />
                  <p className="text-white">
                    {formatDateTime(appointment.startTime)}
                  </p>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-emerald-400 mr-2" />
                  <p className="text-white">
                    {formatTime(appointment.startTime)} -{" "}
                    {formatTime(appointment.endTime)}
                  </p>
                </div>
              </div>
            </div>

            {/*Status */}
             <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Status
              </h4>
              <Badge
                variant="outline"
                className={
                  appointment.status === "COMPLETED"
                    ? "bg-emerald-900/20 border-emerald-900/30 text-emerald-400"
                    : appointment.status === "CANCELLED"
                    ? "bg-red-900/20 border-red-900/30 text-red-400"
                    : "bg-amber-900/20 border-amber-900/30 text-amber-400"
                }
              >
                {appointment.status}
              </Badge>
            </div>


             {/* Patient Description */}
            {appointment.patientDescription && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {userRole === "DOCTOR"
                    ? "Patient Description"
                    : "Your Description"}
                </h4>
                <div className="p-3 rounded-md bg-muted/20 border border-emerald-900/20">
                  <p className="text-white whitespace-pre-line">
                    {appointment.patientDescription}
                  </p>
                </div>
              </div>
            )}


             {appointment.status === "SCHEDULED" && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Video Consultation
                </h4>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={
                    !isAppointmentActive() || action === "video" || tokenLoading
                  }
                  onClick={handleJoinVideoCall}
                >
                  {tokenLoading || action === "video" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing Video Call...
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4 mr-2" />
                      {isAppointmentActive()
                        ? "Join Video Call"
                        : "Video call will be available 30 minutes before appointment"}
                    </>
                  )}
                </Button>
              </div>
          )}<div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <h4 className='text-sm font-medium text-muted-foreground'>Doctor Notes</h4>
            {userRole ==="DOCTOR" && appointment.status !="CANCELLED" && action!="notes"
                 &&(
                  <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAction("notes")}
                  className="h-7 text-blue-500 text-shadow-emerald-700 hover:text-blue-200 hover:bg-muted"
                >
                 <Edit className='h-4 w-4 mr-1' />
                  {appointment.notes ? "Edit Notes" : "Add Notes"}
                </Button>
              )}
            </div>
            {userRole === "DOCTOR" && action === "notes" ? (
                <div className="space-y-3">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter your clinical notes here..."
                    className="bg-background border-emerald-900/20 min-h-[100px]"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAction(null);
                        setNotes(appointment.notes || "");
                      }}
                      disabled={notesLoading}
                      className="border-emerald-900/30"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveNotes}
                      disabled={notesLoading}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {notesLoading ? (
                        <>
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Notes"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-md bg-muted/20 border border-emerald-900/20 min-h-[80px]">
                  {appointment.notes ? (
                    <p className="text-white whitespace-pre-line">
                      {appointment.notes}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No notes added yet
                    </p>
                  )}
                </div>
              )}
          </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <div className="flex gap-2">
              {/* Mark as Complete Button - Only for doctors */}
              {markCompleted() && (
                <Button
                  onClick={handleMarkComplete}
                  disabled={completeLoading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {completeLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark Complete
                    </>
                  )}
                </Button>
              )}

              {/* Cancel Button - For scheduled appointments */}
              {appointment.status === "SCHEDULED" && (
                <Button
                  variant="outline"
                  onClick={handleCancelAppointment}
                  disabled={cancelLoading}
                  className="border-red-900/30 text-red-400 hover:bg-red-900/10 mt-3 sm:mt-0"
                >
                  {cancelLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      Cancel Appointment
                    </>
                  )}
                </Button>
              )}
            </div>

            <Button
              onClick={() => setOpen(false)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Close
            </Button>
          </DialogFooter> 


  </DialogContent>
</Dialog>

    </>
  );
            }
            
           
   


export default AppointmentCard;
