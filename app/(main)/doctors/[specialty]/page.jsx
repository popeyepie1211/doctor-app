import PageHeader from '@/components/page-header';
import { redirect } from 'next/navigation';
import React from 'react'

import { doctorsListBySpecialty } from '@/actions/doctor-listing';

import { DoctorCard } from '../components/doctor-card';

const SpecialtyPage = async ({ params }) => {
 
  const { specialty } = await params; // Extracting the specialty from params
 
  if (!specialty) {
    redirect('/doctors'); // Redirect if specialty is not found
  }

  const {doctors,error}= await doctorsListBySpecialty(specialty);
  if (error) {
    console.error("Error fetching doctors:", error);
    redirect('/doctors'); // Redirect if there's an error fetching doctors
  }
  return <div>
    <PageHeader 
    title={specialty.split("%20").join(" ")}
    backLink='/doctors' 
    backLabel='Back to Specialties' 
    />
    {doctors && doctors.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {doctors.map((doctor) => (
        
          <DoctorCard doctor={doctor} key={doctor.id} />
        
      ))}
    </div>
    ):(
      <div className="text-center text-muted-foreground">
        No doctors found for this specialty.
      </div>
    )}

  </div>
}

export default SpecialtyPage