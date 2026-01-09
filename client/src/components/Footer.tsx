import { useI18n } from "@/contexts/I18nContext";

export function Footer() {
  const { language } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Fintech Builders" className="h-10 w-10" />
              <span className="font-bold text-lg">Fintech Builders</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {language === "pt"
                ? "Construindo o futuro das finanças através de tecnologia e inovação."
                : "Building the future of finance through technology and innovation."}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">
              {language === "pt" ? "Links Rápidos" : "Quick Links"}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/" className="hover:text-primary transition-colors">
                  {language === "pt" ? "Início" : "Home"}
                </a>
              </li>
              <li>
                <a href="/academy" className="hover:text-primary transition-colors">
                  Academy
                </a>
              </li>
              <li>
                <a href="/blog" className="hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">
              {language === "pt" ? "Contato" : "Contact"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "pt"
                ? "Entre em contato conosco para saber mais sobre nossa comunidade e eventos."
                : "Get in touch to learn more about our community and events."}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {currentYear} Fintech Builders. {language === "pt" ? "Todos os direitos reservados." : "All rights reserved."}</p>
        </div>
      </div>
    </footer>
  );
}
