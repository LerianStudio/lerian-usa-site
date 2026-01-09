import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Briefcase, Building2, Activity } from "lucide-react";
import { AdminAnalyticsBlog } from "@/components/AdminAnalyticsBlog";
import { AdminAnalyticsAcademy } from "@/components/AdminAnalyticsAcademy";
import { useI18n } from "@/contexts/I18nContext";

type TabType = "users" | "blog" | "academy";

export function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const { t } = useI18n();
  const { data: analytics, isLoading } = trpc.users.getAnalytics.useQuery();

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: "users", label: "Usuários" },
    { id: "blog", label: "Blog" },
    { id: "academy", label: "Academy" },
  ];

  if (isLoading && activeTab === "users") {
    return <div>Carregando analytics...</div>;
  }

  if (!analytics && activeTab === "users") {
    return <div>Nenhum dado disponível</div>;
  }

  // Prepare data for registration chart
  const monthNames: Record<string, string> = {
    '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
    '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
    '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
  };

  const registrationData = analytics ? Object.entries(analytics.registrationsByMonth || {})
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => {
      const [year, monthNum] = month.split('-');
      return {
        month: `${monthNames[monthNum]} ${year}`,
        count
      };
    }) : [];

  const maxRegistrations = registrationData.length > 0 ? Math.max(...registrationData.map(d => d.count), 1) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics</h2>
        <p className="text-muted-foreground">Métricas e estatísticas da plataforma</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? "text-yellow-500 border-b-2 border-yellow-500"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === "users" && analytics && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Membros cadastrados na plataforma
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.profileCompletionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Perfis completados com dados profissionais
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.mostActiveUsers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Com comentários ou avaliações
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Registration Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Cadastros por Mês</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              {registrationData.length > 0 ? (
                <div className="space-y-6">
                  {registrationData.map(({ month, count }) => (
                    <div key={month} className="flex items-center gap-4">
                      <div className="w-20 text-sm text-muted-foreground">{month}</div>
                      <div className="flex-1">
                        <div className="h-8 bg-primary/20 rounded relative overflow-hidden">
                          <div
                            className="h-full bg-primary rounded flex items-center justify-end pr-2 text-xs font-medium text-primary-foreground transition-all"
                            style={{ width: `${(count / maxRegistrations) * 100}%` }}
                          >
                            {count > 0 && count}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum cadastro nos últimos 6 meses</p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Job Titles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-4">
                  <Briefcase className="h-5 w-5" />
                  Top 5 Cargos
                </CardTitle>
                <CardDescription>Mais comuns na comunidade</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.topJobTitles.length > 0 ? (
                  <div className="space-y-6">
                    {analytics.topJobTitles.map(({ title, count }, index) => (
                      <div key={title} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="text-sm">{title}</span>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {count} {count === 1 ? 'pessoa' : 'pessoas'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum cargo informado</p>
                )}
              </CardContent>
            </Card>

            {/* Top Companies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-4">
                  <Building2 className="h-5 w-5" />
                  Top 10 Empresas
                </CardTitle>
                <CardDescription>Mais representadas</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.topCompanies.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {analytics.topCompanies.map(({ company, count }, index) => (
                      <div key={company} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="text-sm truncate max-w-[200px]">{company}</span>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma empresa informada</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Most Active Users */}
          <Card>
            <CardHeader>
              <CardTitle>Usuários Mais Ativos</CardTitle>
              <CardDescription>Por comentários e avaliações</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.mostActiveUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 text-sm font-medium">#</th>
                        <th className="text-left p-4 text-sm font-medium">Nome</th>
                        <th className="text-left p-4 text-sm font-medium">Email</th>
                        <th className="text-right p-4 text-sm font-medium">Atividades</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.mostActiveUsers.map((user, index) => (
                        <tr key={user.id} className="border-b hover:bg-muted/50">
                          <td className="p-4 text-sm">{index + 1}</td>
                          <td className="p-4 text-sm">{user.name}</td>
                          <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                          <td className="p-4 text-sm text-right font-medium">
                            <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {user.activityCount}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma atividade registrada</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Blog Tab */}
      {activeTab === "blog" && <AdminAnalyticsBlog />}

      {/* Academy Tab */}
      {activeTab === "academy" && <AdminAnalyticsAcademy />}
    </div>
  );
}
