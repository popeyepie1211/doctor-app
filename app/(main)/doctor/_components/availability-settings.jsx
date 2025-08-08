"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Clock, Loader2, Plus } from "lucide-react";
import useFetch from "@/hooks/fetch-api";
import { Button } from "@/components/ui/button";
import { setAvailabilitySlots } from "@/actions/doctor";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";

const AvailabilitySettings = ({ slots }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      startTime: "",
      endTime: "",
    },
  });

  const { loading, fn: submitSlots, data, error } = useFetch(setAvailabilitySlots);
  const [showForm, setShowForm] = useState(false);

  const createLocalDatefromTime = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    return date;
  };

  const formatTimeString = (dateString) => {
    try {
      return format(new Date(dateString), "h:mm a");
    } catch (e) {
      return "Invalid time";
    }
  };

  const onSubmit = async (data) => {
    if (loading) return;

    const startDate = createLocalDatefromTime(data.startTime);
    const endDate = createLocalDatefromTime(data.endTime);

    if (startDate >= endDate) {
      toast.error("Start time must be before end time");
      return;
    }

    const formData = new FormData();
    formData.append("startTime", startDate.toISOString());
    formData.append("endTime", endDate.toISOString());

    await submitSlots(formData);
    setShowForm(false);
    toast.success("Availability slots updated successfully!");
  };

  return (
    <Card className="border-emerald-500/20 bg-emerald-950/10">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center">
          <Clock className="mr-2 h-5 w-5 text-emerald-500" />
          Availability Settings
        </CardTitle>
        <CardDescription>
          Set your daily availability for patient appointments
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!showForm ? (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3">Current Availability</h3>
              {slots.length === 0 ? (
                <p className="text-muted-foreground">
                  You haven't set any availability slots yet. Add your
                  availability to start accepting appointments.
                </p>
              ) : (
                <div className="space-y-3">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center p-3 rounded-md bg-muted/20 border border-emerald-900/20"
                    >
                      <div className="bg-emerald-900/20 p-2 rounded-full mr-3">
                        <Clock className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {formatTimeString(slot.startTime)} - {formatTimeString(slot.endTime)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {slot.appointment ? "Booked" : "Available"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() => setShowForm(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white w-full mb-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Set New Availability
            </Button>
          </>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 border border-emerald-900/20 p-4 rounded-md"
          >
            <h3 className="text-lg font-semibold text-white">Add Availability Slot</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  {...register("startTime", {
                    required: "Start time is required",
                  })}
                  className="bg-background border-emerald-900/20"
                />
                {errors.startTime && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.startTime.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  {...register("endTime", {
                    required: "End time is required",
                  })}
                  className="bg-background border-emerald-900/20"
                />
                {errors.endTime && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-red-500 hover:bg-red-600 text-white"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Availability"
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailabilitySettings;
