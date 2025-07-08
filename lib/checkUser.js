import { currentUser } from "@clerk/nextjs/server";

export const checkUser = async () => {
  const user = await currentUser();
  
  console.log("User data:", user);
}
// This function checks if a user is logged in and logs their data to the console.
