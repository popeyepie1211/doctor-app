
import PageHeader from '@/components/page-header'
import { Stethoscope } from 'lucide-react'
import React from 'react'


export const metadata = {  
    title: 'Doctor Dashboard',
  description: 'Managage your appointments and patients'
 }




const DoctorDashboard = ({children}) => {
  return (
    <div className='container mx-auto my-20'>
    <PageHeader icon={<Stethoscope />} title="Doctor Dashboard"/>
    {children}


    </div>
  )
}

export default DoctorDashboard