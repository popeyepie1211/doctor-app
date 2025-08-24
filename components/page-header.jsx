import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

const PageHeader = ({
  icon,
  title,
  backLink = "/",
  backLabel = "Back Home",
}) => {
  return (
    <div className="flex flex-col justify-between gap-5 mb-9">
      {/* Back Button with creative hover */}
      <Link href={backLink} className="w-fit group">
        <Button
          variant="outline"
          size="sm"
          className="pl-6 relative overflow-hidden text-gray-500 border-gray-400 group-hover:text-emerald-500 group-hover:border-emerald-500 transition-all duration-300"
        >
          {/* Gradient overlay that fades in on hover */}
          <span className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></span>

          {/* Icon with slide animation */}
          <ArrowLeft className="h-4 w-4 relative transform group-hover:-translate-x-1 transition duration-300" />
          <span className="pl-2">{backLabel}</span>
        </Button>
      </Link>

      {/* Title + Icon */}
      <div className="flex items-end gap-2">
        {icon && (
          <div className="text-emerald-400">
            {React.cloneElement(icon, {
              className: "h-12 w-12 md:h-16 md:w-16",
            })}
          </div>
        )}

        {/* Title with gradient sweep on hover */}
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-none hover:animate-gradient-sweep">
          {title}
        </h1>
      </div>
    </div>
  );
};

export default PageHeader;
