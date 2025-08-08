import { verifyAdmin } from '@/actions/admin';
import PageHeader from '@/components/page-header';
import { AlertCircle, ShieldCheck, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from 'next/navigation';
import { CreditCard } from 'lucide-react';
export const metadata = {
  title: "Admin Settings - Medimeet",
  description: "Manage Doctors and Appointments in Medimeet",
};

const AdminLayout = async ({ children }) => {
  const isAdmin = await verifyAdmin();

  if (!isAdmin) {
    redirect("/onboarding");
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <PageHeader icon={<ShieldCheck />} title="Admin Settings" />
      <Tabs defaultValue="pending" className="grid grid-cols-1 gap-4 md:grid-cols-4 ">
        <TabsList className="md:col-span-1 bg-muted/30 border h-14 md:h-40 flex sm:flex-row md:flex-col w-full p-2 md:p-1 rounded-md md:space-y-2 sm:space-x-2 md:space-x-0">
          <TabsTrigger
            value="pending"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <AlertCircle className="h-4 w-4 mr-2 hidden md:inline text-amber-300" />
            <span>Pending Verification</span>
          </TabsTrigger>
          <TabsTrigger
            value="doctors"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <Users className="h-4 w-4 mr-2 hidden md:inline text-blue-500" />
            <span>Doctors</span>
          </TabsTrigger>
          <TabsTrigger
            value="payouts"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <CreditCard className="h-4 w-4 mr-2 hidden md:inline text-green-400" />
            <span>Payouts</span>
          </TabsTrigger>
        </TabsList>
        <div className="md:col-span-3">{children}</div>
      </Tabs>
    </div>
  );
}

export default AdminLayout;


