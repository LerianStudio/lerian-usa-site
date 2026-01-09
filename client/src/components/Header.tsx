import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/contexts/I18nContext";
import { LanguageSelector } from "./LanguageSelector";
import { GlobalSearch } from "./GlobalSearch";
import { Button } from "./ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Menu, X, Settings } from "lucide-react";
import { useState } from "react";
import EditProfileDialog from "./EditProfileDialog";

export function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const logoutMutation = trpc.auth.logout.useMutation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  // Extract first name from full name
  const getFirstName = (fullName: string | null | undefined) => {
    if (!fullName) return "";
    return fullName.split(" ")[0];
  };

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/academy", label: t("nav.academy") },
    { href: "/eventos", label: t("nav.events") },
    { href: "/blog", label: t("nav.blog") },
  ];

  if (user?.role === "admin") {
    navLinks.push({ href: "/admin", label: t("nav.admin") });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
            <img src="/logo.png" alt="Lerian USA" className="h-10 w-10" />
            <span className="font-bold text-xl hidden sm:inline">Lerian USA</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <GlobalSearch />
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                  location === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSelector />
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditProfileOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                {getFirstName(user?.name)}
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                {t("nav.logout")}
              </Button>
            </div>
          ) : (
            <Button asChild size="sm">
              <a href={getLoginUrl()}>{t("nav.login")}</a>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col gap-4">
            <div className="pb-4 border-b">
              <GlobalSearch />
            </div>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                    location === link.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </span>
              </Link>
            ))}
            <div className="pt-4 border-t flex flex-col gap-4">
              <LanguageSelector />
              {isAuthenticated ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditProfileOpen(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {getFirstName(user?.name)}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    {t("nav.logout")}
                  </Button>
                </>
              ) : (
                <Button asChild size="sm">
                  <a href={getLoginUrl()}>{t("nav.login")}</a>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
      
      {/* Edit Profile Dialog */}
      {isAuthenticated && (
        <EditProfileDialog
          open={editProfileOpen}
          onOpenChange={setEditProfileOpen}
          currentJobTitle={user?.jobTitle || undefined}
          currentCompany={user?.company || undefined}
          currentLinkedin={user?.linkedin || undefined}
        />
      )}
    </header>
  );
}
