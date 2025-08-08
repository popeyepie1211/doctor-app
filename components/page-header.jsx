import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { ArrowLeft } from 'lucide-react'

const PageHeader = ({
    icon,
    title,
    backLink="/",
    backLabel="Back Home",
}) => {

    
  return (
    <div className='flex flex-col justify-between gap-5 mb-9'>
     <Link href={backLink} className='flex items-center gap-2 text-gray-500 hover:text-gray-700'>
     <Button variant="outline" size="sm"
     className="text-gray-500 mb-2 hover:text-gray-700"
     >
        <ArrowLeft className='h-4 w-4 mr-2' />
        {backLabel}
        </Button>
      </Link>



    <div className='flex items-end gap-2'>
        {icon && (    
        <div className='text-5xl text-emerald-400'>
            {React.cloneElement(icon, { className: 'h-12 w-12 md:h-16 md:w-16' })}   {/* react.cloneElement allows passing additional props to the icon */}
        </div>
        )}
        <h1 className='text-4xl font-bold gradient-title'>{title}</h1>
    </div>
    </div>
  )
}


export default PageHeader