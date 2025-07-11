import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();
  
  if(!user) {
    console.log("No user is logged in.");
    return null;
  }
  
  try {
    const loggedInUser = await db.user.findUnique({   // Find the user by their Clerk ID
  where: {   
    clerkUserId: user.id,    // Use the Clerk user ID to find the user in the database
  },
  include: { // Include transactions related to the user
    transactions: { 
      where: {
        type: "CREDIT_PURCHASE", // Filter transactions of type CREDIT_PURCHASE
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Filter transactions from the current month
        },
      },
      orderBy: { // Order by createdAt in descending order
        createdAt: "desc",
      },
      take: 1,  // Get the most recent transaction
    },
  },
});

    if (loggedInUser) {
      
      return loggedInUser;
    }

    const name = `${user.firstName} ${user.lastName}`;

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name: name,
        email: user.emailAddresses[0].emailAddress,
        profilePicture: user.imageUrl,
      transactions: {
        create: {
          type:"CREDIT_PURCHASE",
          packageId:"free_user",
          amount: 2,

        }
      },
    },
  }
  );
  } catch (error) {
    console.log(error.message);
     
  }
}
// This function checks if a user is logged in and logs their data to the console.
