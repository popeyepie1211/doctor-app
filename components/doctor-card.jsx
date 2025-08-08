import React from 'react'
import { Card } from './ui/card'
import { Calendar, Star, User } from 'lucide-react'
import { CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import Link from 'next/link'

const DoctorCard = ({ doctor }) => {
  return (
    <Card className="border-emerald-900/20 hover:border-emerald-700/40 transition-all cursor-pointer h-full w-auto">
      <CardContent>
        <div>
          <div className="w-12 h-12 rounded-full bg-emerald-900/20 flex items-center justify-center mb-4 flex-shrink-0">
            {doctor.imageUrl ? (
              <img
                src={doctor.imageUrl}
                alt={doctor.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User className="text-emerald-400 w-6 h-6" />
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <h3 className="font-medium text-white">{doctor.name}</h3>
            <Badge className="bg-emerald-900/20 border-emerald-900/30 text-emerald-400" variant="outline">
              <Star className="w-4 h-4 mr-1" />
              Verified
            </Badge>
          </div>

          <p className="text-muted-foreground text-md mb-2">
            {doctor.specialty + ' · ' + (doctor.experience || 'No experience listed')} years
          </p>

          <div>
            <span className="text-muted-foreground text-sm">
              {doctor.description ? ` - ${doctor.description}` : ''}
            </span>
          </div>

          {/* Fixed version: Link is inside the Button but not using asChild */}
          <Link href={`/doctor/${doctor.specialty}/${doctor.id}`} passHref>
            <Button
              variant="outline"
              className="mt-4 w-full bg-emerald-700/10 hover:bg-emerald-700/20 text-emerald-400"
            >
              Book Appointment
              <Calendar className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default DoctorCard
