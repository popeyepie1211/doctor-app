"use client"
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import { TabsDefaultValue } from '@/components/ui/tabs';
import { TabsTrigger } from '@/components/ui/tabs';
import React from 'react'
import { Clock } from 'lucide-react';
import { TabsValue } from '@/components/ui/tabs'; 
import { useState } from 'react';
import { Card,CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';


const SlotPicker = ({days, onSelectSlot}) => {
 

  const [selectedSlot,setSelectedSlot] =useState(null);

const firstDayWithSlots = days.find(day => day.slots.length > 0)?.date || days[0].date;  // Find the first day with available slots. 

  const [activeTab,setActiveTab] =useState(firstDayWithSlots);

  const handleSlotSelection = (slot) => {
  if (selectedSlot?.startTime === slot.startTime) {  
    // If it's already selected, unselect it
    setSelectedSlot(null);
  } else {
    // Otherwise, select it
    setSelectedSlot(slot);
  }
};

  const confirmSlotSelection = () => {
    if (selectedSlot) {
      onSelectSlot(selectedSlot);  // Confirm slot selection
    }
  };

  return (
   <div>
    <Tabs defaultValue={activeTab} 
      onValueChange={setActiveTab}  // Update active tab on change
    className="w-full">
  <TabsList>
    {days.map(day => (  // Map through each day so that we can display its slots
      <TabsTrigger
        key={day.date}
        value={day.date}
        disabled={!day.slots.length}
        className={day.slots.length === 0 ? "opacity-50 cursor-not-allowed" : ""}
      >
        <div className="flex gap-2">
                <div className=" opacity-80">
                  {format(new Date(day.date), "MMM d")}  {/* Display the date in "MMM d" format */}
                </div>
               <div> ({format(new Date(day.date), "EEE")})</div>  {/* Display the day of the week in "EEE" format */}
              </div>
              {day.slots.length > 0 && (
                <div className="ml-2 bg-emerald-900/30 text-emerald-400 text-xs px-2 py-1 rounded">
                  {day.slots.length}
                </div>
              )}
      </TabsTrigger>
    ))}
  </TabsList>
 
  {
    days.map((day) => ( // Map through each day
      <TabsContent value={day.date} key={day.date} className='pt-4'>
       {day.slots.length  === 0 ? (
        <div className='text-center text-md py-8 text-muted-foreground'>
          No slots available for this day
        </div>
        ):(<div className='space-y-3' >
            <h3 className='text-lg font-medium text-white mb-2'>
             {day.displayDate}
          </h3>
       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                  {day.slots.map((slot) => (
                    <Card
                      key={slot.startTime}
                      className={`border-emerald-900/20 cursor-pointer transition-all ${
                        selectedSlot?.startTime === slot.startTime
                          ? "bg-emerald-900/30 border-emerald-600"
                          : "hover:border-emerald-700/40"
                      }`}
                      onClick={() => handleSlotSelection(slot)}
                    >
                      <CardContent className="p-1
                       flex items-center text-sm">
                        <Clock
                          className={`h-4 w-4 mr-2 ${
                            selectedSlot?.startTime === slot.startTime
                              ? "text-emerald-400"
                              : "text-muted-foreground"
                          }`}
                        />
                        <span
                          className={
                            selectedSlot?.startTime === slot.startTime
                              ? "text-white"
                              : "text-muted-foreground"
                          }
                        >
                          {format(new Date(slot.startTime), "h:mm a")}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      <div className="mt-4">
        <Button
          onClick={confirmSlotSelection}
          disabled={!selectedSlot}
          className={`w-full py-2 px-4 rounded bg-emerald-600 text-white font-semibold transition-colors ${
            !selectedSlot ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700"
          }`}
        >
          Confirm Slot
        </Button>
        <p className="mt-2 text-sm text-muted-foreground">
          By confirming, you agree to the terms and conditions.
        </p>
      </div>
    </div>
  );
}

export default SlotPicker