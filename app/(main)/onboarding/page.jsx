"use client"
// import { Description } from '@radix-ui/react-dialog';
import React from 'react';

import { toast } from "sonner";
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, Stethoscope, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import useFetch from '@/hooks/fetch-api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SPECIALTIES } from '@/lib/specialty';
import { Textarea } from '@/components/ui/textarea';


import { setUserRole } from '@/actions/onboarding';
import { useRouter } from 'next/navigation';
// Define the schema for the doctor onboarding form
// This schema will validate the form inputs
const doctorFormSchema = z.object({   // Schema for doctor onboarding form
  specialty: z.string().min(1, "Specialty is required"),
  experience: z.number().min(1, "Experience must be more than 1 year").max(50, "Experience must be less than 50 years"),
  credentialUrl: z.string().url("Must be a valid URL").min(1, "Credential URL is required"),
  description: z.string().min(20, "Description must be at least 20 characters").max(500, "Description must be less than 500 characters"),
});


const OnboardingPage = () => {
const [step, setStep] = useState("choose-role"); // State to manage the current step of the onboarding process
const router = useRouter(); // Next.js router for navigation
const { loading, data, fn: submitUserRole } = useFetch(setUserRole);

const { register, // Register the form fields with react-hook-form
  handleSubmit, // Handle form submission
  watch, // Watch the form values and re-render when they change
  formState: { errors }, // Access form errors
  setValue // Set form values programmatically
   } = useForm({
  resolver: zodResolver(doctorFormSchema),// Use zodResolver to validate the form against the schema
  defaultValues: { // Set default values for the form fields
  specialty: "",
  experience: undefined,
  credentialUrl: "",
  description: "",
  },
});

const specialtyValue = watch("specialty"); // Watch the specialty field to conditionally render the form

const handlePatientSelection = async () => {
  if(loading) return; // Prevent submission if already loading

  const formData = new FormData(); // Create a new FormData object to hold the form data
  formData.append("role", "PATIENT"); // Append the role to the form data

  await submitUserRole(formData); // Submit the form data to set the user role
};

useEffect(() => {
if (data && data?.success){   // Check if the submission was successful

  toast.success("Role set successfully! Redirecting..."); // Show success message
router.push(data.redirect);  // Redirect to the appropriate page based on the role

}
}, [data]);


const onDoctorSubmit = async (data) => {
    if (loading) return;

    const formData = new FormData();
    formData.append("role", "DOCTOR");
    formData.append("specialty", data.specialty);
    formData.append("experience", data.experience.toString());
    formData.append("credentialUrl", data.credentialUrl);
    formData.append("description", data.description);

    await submitUserRole(formData);
  };


if(step === "choose-role") {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4'>
      <Card
        onClick={() => !loading && handlePatientSelection()}
        className="border-emerald-900/20 hover:bg-emerald-700/40 transition-all cursor-pointer shadow-lg hover:shadow-2xl"
        style={{
          boxShadow: '0 4px 24px 0 rgba(16, 185, 129, 0.15), 0 1.5px 6px 0 rgba(16, 185, 129, 0.10)'
        }}
      >
        <CardContent className="pt-6 pb-4 flex flex-col items-center text-center">
          <div className='p-4 bg-emerald-500/20 text-emerald-500 rounded-full mb-4'>
            <User className='w-8 h-8  text-emerald-400' />
          </div>
          <CardTitle className="text-xl font-semibold text-white mb-2">Join as Patient</CardTitle>
          <CardDescription className="mb-4 text-muted-foreground">Book appointments, consult with doctors, manage your health and wellness</CardDescription>
          <Button className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600" disabled={loading} >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>) : (
              "Continue as Patient"
            )}
          </Button>
        </CardContent>
      </Card>
      <Card
        onClick={() => {
          if (!loading) setStep("doctor-form");
        }}
        className="border-emerald-900/20 hover:bg-emerald-700/40 transition-all  cursor-pointer shadow-lg hover:shadow-2xl"
        style={{
          boxShadow: '0 4px 24px 0 rgba(16, 185, 129, 0.15), 0 1.5px 6px 0 rgba(16, 185, 129, 0.10)'
        }}
      >
        <CardContent className="pt-6 pb-4 flex flex-col items-center text-center">
          <div className='p-4 bg-emerald-500/20 text-emerald-500 rounded-full mb-4'>
            <Stethoscope className='w-8 h-8  text-emerald-400' />
          </div>
          <CardTitle className="text-xl font-semibold text-white mb-2">Join as Doctor</CardTitle>
          <CardDescription className="mb-4 text-muted-foreground">Provide medical consultations, manage patient health, and more</CardDescription>
          <Button
            className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600"
            disabled={loading}
          >
            {loading && step === "doctor-form" ? ( // Show loading spinner if loading and step is doctor-form
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...                               // Show loading state
                
              </>
            ) : (
              "Continue as Doctor"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

}
if (step === "doctor-form") {
  return( <Card className="border-emerald-900/20">
        <CardContent className="pt-6">
          <div className="mb-6">
            <CardTitle className="text-2xl font-bold text-blue-300">
              Complete Your Doctor Profile
            </CardTitle>
            <CardDescription>
              Please provide your professional details for verification
            </CardDescription>
          </div>

          <form onSubmit={handleSubmit(onDoctorSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="specialty">Medical Specialty</Label>
              <Select
                value={specialtyValue}
                onValueChange={(value) => setValue("specialty", value)}
              >
                <SelectTrigger id="specialty">
                  <SelectValue placeholder="Select your specialty" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((spec) => (
                    <SelectItem
                      key={spec.name}
                      value={spec.name}
                      className="flex items-center gap-2"
                    >
                      <span className="text-emerald-400">{spec.icon}</span>
                      {spec.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.specialty && (
                <p className="text-sm font-medium text-red-500 mt-1">
                  {errors.specialty.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                placeholder="e.g. 5"
                {...register("experience", { valueAsNumber: true })}
              />
              {errors.experience && (
                <p className="text-sm font-medium text-red-500 mt-1">
                  {errors.experience.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="credentialUrl">Link to Credential Document</Label>
              {/* htmlFor is used for accessibility, linking the label to the input */}
              <Input
                id="credentialUrl"   // Input field for the credential URL
                type="url"
                placeholder="https://example.com/my-medical-degree.pdf"
                {...register("credentialUrl")}
              />
              {errors.credentialUrl && (
                <p className="text-sm font-medium text-red-500 mt-1"> // Display error message if credentialUrl validation fails
                  {errors.credentialUrl.message}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Please provide a link to your medical degree or certification
              </p>
            </div>

            <div className="space-y-2">  
              <Label htmlFor="description">Description of Your Services</Label> 
              <Textarea
                id="description"
                placeholder="Describe your expertise, services, and approach to patient care..."
                rows="4"
                {...register("description")} // Register the description field with react-hook-form
              />
              {errors.description && (
                <p className="text-sm font-medium text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("choose-role")}  // Button to go back to the role selection step
                className="border-emerald-900/30"
                disabled={loading} // Disable the button if loading is true
              >
                Back
              </Button>
              <Button
                type="submit"
                className="bg-blue-400 hover:bg-blue-800"
                disabled={loading} // Disable the button if loading is true
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit for Verification"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }
}

export default OnboardingPage;