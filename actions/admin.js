
"use server";

import { auth } from "@clerk/nextjs/server"; // ✅ Correct

import { db } from "@/lib/prisma";
import { toast } from "sonner";
import { revalidatePath } from "next/cache";


export async function verifyAdmin(){
  const { userId } = await auth();
if (!userId) {

    return false
  }
 try {
       const user = await db.user.findUnique({
           where: {
           clerkUserId: userId,
           },
          
       });
      return user?.role === "ADMIN" 
 } catch (error) {
    console.error("Error verifying admin:", error);
    return false;

 }
}


export async function getPendingVerifications() {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
        throw new Error("Unauthorized access");
    }
    try {
        const pendingDoctors = await db.user.findMany({
            where: {
                role: "DOCTOR",
                verificationStatus: "PENDING",
            },
            orderBy: {
                createdAt: "desc",
            },

            
        });
        return { doctors: pendingDoctors };

    } catch (error) {
        console.error("Error fetching pending verifications:", error);
        throw new Error("Failed to fetch pending verifications");
    }
}

export async function getverifiedDoctors() {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
        throw new Error("Unauthorized access");
    }
    try {
        const verifiedDoctors = await db.user.findMany({
            where: {
                role: "DOCTOR",
                verificationStatus: "VERIFIED",
            },
            orderBy: {
                createdAt: "asc",
            },
        });
        return { doctors: verifiedDoctors };

    } catch (error) {
        console.error("Error fetching all doctors:", error);
        throw new Error("Failed to fetch all doctors");
    }
}

export async function updateVerificationStatus(formData) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
        throw new Error("Unauthorized access");
    }

  const doctorId = formData.get("doctorId");
  const status = formData.get("status");

  if(!doctorId || !["VERIFIED", "REJECTED"].includes(status)) {
    throw new Error("Invalid input");
  }
  try {
    await db.user.update({
      where: { id: doctorId },
      data: { verificationStatus: status },
    });
    revalidatePath('/admin');
    return { success: true, toast: toast.success("Verification status updated successfully") };
  } catch (error) {
    console.error("Error updating verification status:", error);
    throw new Error("Failed to update verification status");
  }
}


export async function updateDoctoreActiveStatus(formData) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    throw new Error("Unauthorized access");
  }

  const doctorId = formData.get("doctorId");
  const suspend= formData.get("suspend") === "true";

  if(!doctorId){
    throw new Error ("Doctor id is required")
}
try {
    const status= suspend ? "PENDING" : "VERIFIED"
    await db.user.update({
        where: { id: doctorId },
        data: { verificationStatus: status },


    })
    revalidatePath("/admin");   
    return {success:true}

} catch (error) {
  console.error("Failed to update doctor status", error);
 throw new Error("Failed to update doctor status");

}

}