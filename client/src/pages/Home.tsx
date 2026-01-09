import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnimatedLogo } from "@/components/AnimatedLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";

export default function Home() {
  const { t, language } = useI18n();
  const { data: events, isLoading } = trpc.events.getUpcoming.useQuery();

  const dateLocale = language === "pt" ? ptBR : enUS;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 tech-grid">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="container py-16 md:py-24 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 text-center lg:text-left">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight gradient-text">
                  {t("home.hero.title")}
                </h1>
                <p className="text-xl text-muted-foreground">
                  {t("home.hero.subtitle")}
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {t("home.hero.description")}
                </p>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <Button size="lg" variant="outline" asChild className="text-white shadow-lg shadow-primary/50">
                    <a href="/academy" className="hover:!bg-primary hover:!text-black transition-all duration-300">
                      {t("nav.academy")}
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="text-white shadow-lg shadow-primary/50">
                    <a href="/blog" className="hover:!bg-primary hover:!text-black transition-all duration-300">{t("nav.blog")}</a>
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-center lg:justify-end">
                <AnimatedLogo />
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  {t("home.about.title")}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {t("home.about.description")}
                </p>
              </div>
              
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  {t("home.mission.title")}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {t("home.mission.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("home.events.title")}
              </h2>
            </div>

            {isLoading ? (
              <div className="text-center text-muted-foreground">
                {t("common.loading")}
              </div>
            ) : events && events.length > 0 ? (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.slice(0, 2).map((event) => (
                  <Card key={event.id} className="hover:shadow-lg hover:shadow-primary/20 transition-all hover:border-primary/50 group overflow-hidden">
                    {event.imageUrl && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={event.imageUrl}
                          alt={language === "pt" ? event.titlePt : event.titleEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2">
                        {language === "pt" ? event.titlePt : event.titleEn}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(event.eventDate), "PPP", { locale: dateLocale })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {language === "pt" ? event.descriptionPt : event.descriptionEn}
                      </p>
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                      {event.eventUrl && (
                        <Button asChild className="w-full">
                          <a href={event.eventUrl} target="_blank" rel="noopener noreferrer">
                            {t("home.events.participate")}
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-12 text-center">
                <Button size="lg" variant="outline" asChild>
                  <a href="/eventos">
                    {language === "pt" ? "Ver Todos os Eventos" : "View All Events"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                {t("home.events.empty")}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
