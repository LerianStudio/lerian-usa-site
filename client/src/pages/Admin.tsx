import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/contexts/I18nContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Video, Users, BarChart3 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { AdminEvents } from "@/components/admin/AdminEvents";
import { AdminBlog } from "@/components/admin/AdminBlog";
import { AdminVideos } from "@/components/admin/AdminVideos";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";

export default function Admin() {
  const { t } = useI18n();
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{t("admin.dashboard")}</h1>
            <p className="text-muted-foreground">
              Gerencie conteúdo da plataforma Fintech Builders
            </p>
          </div>

          <Tabs defaultValue="events" className="space-y-6">
            <TabsList className="flex flex-wrap gap-2 w-full bg-transparent border-b border-border p-0 h-auto">
              <TabsTrigger value="events" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">{t("admin.events")}</span>
              </TabsTrigger>
              <TabsTrigger value="blog" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">{t("admin.blog")}</span>
              </TabsTrigger>

              <TabsTrigger value="videos" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap">
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">{t("admin.videos")}</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Usuários</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <AdminEvents />
            </TabsContent>

            <TabsContent value="blog">
              <AdminBlog />
            </TabsContent>

            <TabsContent value="videos">
              <AdminVideos />
            </TabsContent>

            <TabsContent value="users">
              <AdminUsers />
            </TabsContent>

            <TabsContent value="analytics">
              <AdminAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
