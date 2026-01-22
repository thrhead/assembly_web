
import { auth } from "@/lib/auth"
import { redirect } from "@/lib/navigation"
import { GanttChart } from "@/components/admin/gantt-chart"
import { RouteOptimizer } from "@/components/admin/route-optimizer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function GanttPage() {
    const session = await auth()

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
        redirect("/login")
    }

    return (
        <div className="p-4 space-y-6 max-w-[1400px] mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Gelişmiş Planlama</h1>
                <p className="text-muted-foreground">
                    Tüm montaj süreçlerini zaman çizelgesi ve harita üzerinde yönetin.
                </p>
            </div>

            <Tabs defaultValue="gantt" className="space-y-4">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="gantt">Zaman Çizelgesi (Gantt)</TabsTrigger>
                    <TabsTrigger value="route">Rota Optimizasyonu</TabsTrigger>
                </TabsList>
                <TabsContent value="gantt">
                    <GanttChart />
                </TabsContent>
                <TabsContent value="route">
                    <RouteOptimizer />
                </TabsContent>
            </Tabs>
        </div>
    )
}
