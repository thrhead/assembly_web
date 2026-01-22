import { auth } from "@/lib/auth"
import { redirect } from "@/lib/navigation"
import { CustomerHeader } from "@/components/customer/header"
import { CustomerSidebar } from "@/components/customer/sidebar"

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || session.user.role !== "CUSTOMER") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar could be added here */}
      <CustomerSidebar /> 
      
      <div className="flex-1 flex flex-col min-w-0">
        <CustomerHeader user={session?.user as any} />
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}