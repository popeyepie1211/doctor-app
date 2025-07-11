"use client"
import React from 'react';
import { useParams } from 'next/navigation';

const SpecialtyPage = () => {

    const {specialty} = useParams();
  return (
    <div>SpecialtyPage : {specialty}</div>
  )
}

export default SpecialtyPage