"use client"
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, User, Loader2, Check, Ban } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { updateDoctoreActiveStatus } from '@/actions/admin';
import useFetch from '@/hooks/fetch-api';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns'; // For displaying approvedAt
import { toast } from 'sonner';

const VerifiedDoctors = ({ doctors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [targetDoctor, setTargetDoctor] = useState(null);

  const { loading, data, fn: submitStatusUpdate } = useFetch(updateDoctoreActiveStatus);

  const filteredDoctors = doctors.filter((doctor) => {
    const query = searchTerm.toLowerCase();
    return (
      doctor.name.toLowerCase().includes(query) ||
      doctor.specialty.toLowerCase().includes(query) ||
      doctor.experience.toString().includes(query) ||
      doctor.email.toLowerCase().includes(query)
    );
  });

  const handleStatusChange = async (doctor, suspend) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${suspend ? "suspend" : "reinstate"} ${doctor.name}?`
    );
    if (!confirmed || loading) return;
    toast.success(`Doctor ${doctor.name} ${suspend ? "suspended" : "reinstate"} successfully!`);
    const formData = new FormData();
    formData.append("doctorId", doctor.id);
    formData.append("suspend", suspend ? "true" : "false");

    setTargetDoctor(doctor);
    await submitStatusUpdate(formData);
  };

  return (
    <Card className='bg-muted/20 border-emerald-900/20'>
      <CardHeader className='flex flex-col md:flex-row justify-between gap-4 md:items-center'>
        <div>
          <CardTitle className='text-xl font-bold text-white'>Manage Doctors</CardTitle>
          <CardDescription>View and manage all verified doctors</CardDescription>
        </div>
        <div className='relative w-full md:w-64'>
          {searchTerm === '' && (
            <Search className='text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4' />
          )}
          <Input
            placeholder="    Search for Doctors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent>
        {filteredDoctors.length === 0 ? (
          <div className='text-center py-8 text-muted-foreground'>
            {searchTerm
              ? "No Doctors Found matching your criteria"
              : "No Doctors Available"}
          </div>
        ) : (
          <div className='space-y-4'>
            {filteredDoctors.map((doctor) => {
              const isSuspended = doctor.verificationStatus === 'REJECTED';
              return (
                <Card
                  key={doctor.id}
                  className='bg-background border-emerald-900/20 hover:border-emerald-700/30 transition-all'
                >
                  <CardContent className='p-4'>
                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                      <div className='flex items-center gap-3'>
                        <div className='bg-muted/20 rounded-full p-2'>
                          <User className='h-5 w-5 text-emerald-400' />
                        </div>
                        <div>
                          <h3 className='font-medium text-white'>{doctor.name}</h3>
                          <p className='text-sm text-muted-foreground'>
                            {doctor.specialty} • {doctor.experience} years experience
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            {doctor.email}
                          </p>
                          {doctor.approvedAt && !isNaN(new Date(doctor.approvedAt)) && (
                            <p className='text-xs text-muted-foreground'>
                              Approved on: {format(new Date(doctor.approvedAt), "PPP")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className='flex items-center text-muted-foreground gap-2 self-end md:self-auto'>
                        {isSuspended ? (
                          <>
                            <Badge
                              variant='outline'
                              className='bg-red-900/20 border-red-900/30 text-red-400'
                            >
                              Suspended
                            </Badge>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => { handleStatusChange(doctor, false); toast.success(`Doctor ${doctor.name} reinstated successfully!`); }}
                              className='border-emerald-900/30 hover:bg-muted/80'
                              disabled={loading}
                            >
                              {loading && targetDoctor?.id === doctor.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4 mr-1" />
                              )}
                              Reinstate
                            </Button>
                          </>
                        ) : (
                          <>
                            <Badge
                              variant='outline'
                              className='bg-emerald-900/20 border-emerald-900/30 text-emerald-400'
                            >
                              Active
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(doctor, true)
                                
                              }
                              disabled={loading}
                              className="border-red-900/30 hover:bg-red-900/10 text-red-400"
                            >
                              {loading && targetDoctor?.id === doctor.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Ban className="h-4 w-4 mr-1" />
                              )}
                              Suspend
                            </Button>

                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent> 
    </Card>
  );
};

export default VerifiedDoctors;

