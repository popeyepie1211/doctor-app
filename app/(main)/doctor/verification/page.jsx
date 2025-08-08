import React from 'react'
import { getCurrentUser } from "@/actions/onboarding"
import { redirect} from 'next/navigation';
import { AlertCircle, AlertCircleIcon, ClipboardCheck, XCircle, Clock, CheckCircle2, ArrowRight, Home, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const VerificationPage = async() => {

  const user = await getCurrentUser();
  if (user?.verificationStatus == "VERIFIED") {
    redirect('/doctor');
  }
  const isRejected = user?.verificationStatus === "REJECTED";
  
  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/20 dark:via-background dark:to-teal-950/20'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-2xl mx-auto'>
          {/* Header Section */}
          <div className='text-center mb-8'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4 animate-bounce-slow'>
              <UserCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2'>
              Doctor Verification
            </h1>
            <p className='text-muted-foreground text-lg'>
              {isRejected ? 'Application Review Complete' : 'Application Under Review'}
            </p>
          </div>

          {/* Main Card */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-6">
              {/* Status Icon */}
              <div className='relative'>
                <div className={`mx-auto p-6 rounded-full mb-6 w-fit transition-all duration-500 ${
                  isRejected 
                    ? 'bg-red-100 dark:bg-red-900/30 shadow-lg shadow-red-500/20' 
                    : 'bg-amber-100 dark:bg-amber-900/30 shadow-lg shadow-amber-500/20'
                }`}>
                  {isRejected ? (
                    <XCircle className="h-16 w-16 text-red-500 dark:text-red-400" />
                  ) : (
                    <div className='relative'>
                      <ClipboardCheck className="h-16 w-16 text-amber-500 dark:text-amber-400" />
                      <div className='absolute -top-1 -right-1'>
                        <div className='w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center animate-pulse'>
                          <Clock className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Title */}
              <CardTitle className="mb-3">
                <div className='flex items-center justify-center gap-3'>
                  {isRejected ? (
                    <>
                      <Badge variant="destructive" className="px-4 py-2 text-base font-semibold">
                        Rejected
                      </Badge>
                      <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                        Verification Failed
                      </h2>
                    </>
                  ) : (
                    <>
                      <Badge variant="secondary" className="px-4 py-2 text-base font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                        Pending
                      </Badge>
                      <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        Under Review
                      </h2>
                    </>
                  )}
                </div>
              </CardTitle>

              {/* Status Description */}
              <CardDescription className="text-lg max-w-md mx-auto leading-relaxed">
                {isRejected ? 
                  "Your verification has been rejected. Please review the feedback below and resubmit your application." : 
                  "Thank you for submitting your verification request. Our team is carefully reviewing your credentials and will notify you soon."
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Status Details */}
              {isRejected ? (
                <div className='bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border border-red-200 dark:border-red-800/50 p-6 rounded-xl'>
                  <div className='flex items-start gap-4'>
                    <div className='flex-shrink-0'>
                      <div className='w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center'>
                        <AlertCircleIcon className='h-5 w-5 text-red-500 dark:text-red-400' />
                      </div>
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-red-800 dark:text-red-200 mb-3 text-lg'>
                        Application Review Results
                      </h3>
                      <p className='text-red-700 dark:text-red-300 mb-4 leading-relaxed'>
                        Our team at Medimeet has reviewed your submission. The application did not meet the necessary requirements. Please review the following reasons for rejection:
                      </p>
                      <div className='space-y-2'>
                        {[
                          'Insufficient or unclear documentation',
                          'Professional qualifications not met',
                          'Incomplete or vague service description'
                        ].map((reason, index) => (
                          <div key={index} className='flex items-center gap-3 text-red-700 dark:text-red-300'>
                            <div className='w-2 h-2 bg-red-500 rounded-full flex-shrink-0'></div>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                      <p className='text-red-700 dark:text-red-300 mt-4 font-medium'>
                        To proceed, please address the issues mentioned above and resubmit your application.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-6 rounded-xl'>
                  <div className='flex items-start gap-4'>
                    <div className='flex-shrink-0'>
                      <div className='w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center'>
                        <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                      </div>
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-amber-800 dark:text-amber-200 mb-3 text-lg'>
                        Review in Progress
                      </h3>
                      <p className='text-amber-700 dark:text-amber-300 leading-relaxed'>
                        Your application is currently under review by our verification team. This process typically takes 2-3 business days. We will notify you via email once the review is complete.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className='bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/30 p-6 rounded-xl'>
                <div className='flex items-start gap-4'>
                  <div className='flex-shrink-0'>
                    <div className='w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center'>
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-semibold text-emerald-800 dark:text-emerald-200 mb-2 text-lg'>
                      Next Steps
                    </h3>
                    <p className='text-emerald-700 dark:text-emerald-300 leading-relaxed'>
                      {isRejected ?
                        "You can update your doctor profile and resubmit your verification application with the necessary improvements." :
                        "While your application is under review, you can familiarize yourself with the platform and prepare for your first consultation."
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex flex-col sm:flex-row gap-4 pt-4'>
                <Button
                  asChild
                  variant="outline"
                  className='flex-1 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200 group'
                >
                  <Link href="/" className='flex items-center justify-center gap-2'>
                    <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    Go to Home
                  </Link>
                </Button>
                
                {isRejected ? (
                  <Button
                    asChild
                    className='flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 group'
                  >
                    <Link href="/onboarding" className='flex items-center justify-center gap-2'>
                      Update Profile
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    asChild
                    className='flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 group'
                  >
                    <Link href="/doctor/consultations" className='flex items-center justify-center gap-2'>
                      Explore Consultations
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default VerificationPage