import type { Metadata } from 'next'

import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { auth } from '@/lib/auth'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await auth()
  return <DashboardClient userName={session?.user?.name ?? 'there'} />
}
