
import { auth } from "@/lib/auth"
import { redirect } from "@/lib/navigation"
import { getAllTeamsReports } from "@/lib/data/teams"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, TrendingUp, Wallet, Zap, Crown } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Link } from "@/lib/navigation"
import { Button } from "@/components/ui/button"

export default async function TeamReportsPage() {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
        redirect("/login")
    }

    const { reports, globalStats } = await getAllTeamsReports()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Ekip Raporları</h1>
                <p className="text-muted-foreground">
                    Tüm ekiplerin performans, finansal ve verimlilik karşılaştırmaları.
                </p>
            </div>

            {/* Global Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Ekip</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{globalStats.totalTeams}</div>
                        <p className="text-xs text-muted-foreground">{globalStats.totalEmployees} çalışan</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tamamlanan İşler</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{globalStats.totalJobsCompleted}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ortalama Verimlilik</CardTitle>
                        <Zap className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{globalStats.avgEfficiency}%</div>
                        <Progress value={globalStats.avgEfficiency} className="mt-2 h-2" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Genel Harcama</CardTitle>
                        <Wallet className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₺{globalStats.totalExpenses.toLocaleString('tr-TR')}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ekip Karşılaştırma Tablosu</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ekip Adı</TableHead>
                                <TableHead>Lider</TableHead>
                                <TableHead className="text-center">Üye</TableHead>
                                <TableHead className="text-center">Aktif İşler</TableHead>
                                <TableHead className="text-center">Tamamlanan</TableHead>
                                <TableHead className="text-center">Verimlilik</TableHead>
                                <TableHead className="text-right">Toplam Harcama</TableHead>
                                <TableHead className="text-right">Eylem</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {report.name}
                                            {report.stats.efficiencyScore >= 90 && (
                                                <Zap className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{report.leadName}</TableCell>
                                    <TableCell className="text-center">{report.memberCount}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary">{report.stats.totalJobs - report.stats.completedJobs}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-green-600">
                                        {report.stats.completedJobs}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="font-bold">{report.stats.efficiencyScore}</span>
                                            <Progress value={report.stats.efficiencyScore} className="w-16 h-2" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                        ₺{report.stats.totalExpenses.toLocaleString('tr-TR')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/teams/${report.id}`}>
                                            <Button variant="outline" size="sm">Detay</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {reports.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                        Henüz aktif bir ekip bulunmuyor.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
