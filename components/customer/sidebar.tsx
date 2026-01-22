'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BriefcaseIcon, UserIcon, LogOutIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

const navigation = [
  { name: "İşlerim", href: "/customer", icon: BriefcaseIcon },
  { name: "Profil", href: "/customer/profile", icon: UserIcon },
]

export function CustomerSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:flex flex-col w-64 bg-white border-r min-h-screen p-4">
      <div className="mb-8 px-4">
        <h1 className="text-xl font-bold text-gray-900">Müşteri Paneli</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="pt-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => signOut()}
        >
          <LogOutIcon className="h-5 w-5" />
          Çıkış Yap
        </Button>
      </div>
    </div>
  )
}