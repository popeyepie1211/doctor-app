import React from 'react'
import {TabsContent} from "@/components/ui/tabs"
import { getPendingVerifications } from '@/actions/admin'
import { getverifiedDoctors } from '@/actions/admin'
import { ExternalLink } from 'lucide-react'
import PendingDoctors from './_components/pending-doctors'
import VerifiedDoctors from './_components/verified-doctors'
// import PendingPayouts from './_components/pending-payouts'


const AdminPage = async () => {
    const[pendingVerificationsData, verifiedDoctorsData]=await Promise.all([
    getPendingVerifications(),
    getverifiedDoctors()
    ])

  return (
 <>
      <TabsContent value="pending" className="border-none p-0">
        <PendingDoctors doctors={pendingVerificationsData.doctors || []} />
      </TabsContent>

      <TabsContent value="doctors" className="border-none p-0">
        <VerifiedDoctors doctors={verifiedDoctorsData.doctors || []} />
      </TabsContent>

      <TabsContent value="payouts" className="border-none p-0">
        {/* <PendingPayouts payouts={pendingPayoutsData.payouts || []} /> */}
      </TabsContent>
    </>
  );
}

export default AdminPage 