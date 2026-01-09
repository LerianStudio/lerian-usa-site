import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "pt" | "en";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  pt: {
    // Navigation
    "nav.home": "Início",
    "nav.academy": "Academy",
    "nav.blog": "Blog",
    "nav.login": "Entrar",
    "nav.logout": "Sair",
    "nav.admin": "Administração",
    
    // Home
    "home.hero.title": "Lerian USA",
    "home.hero.subtitle": "Construindo o futuro das finanças",
    "home.hero.description": "Somos uma comunidade dedicada a impulsionar a inovação no setor financeiro através de educação, networking e desenvolvimento de soluções tecnológicas de ponta.",
    "home.about.title": "Sobre Nós",
    "home.about.description": "A Lerian USA é uma empresa comprometida em transformar o ecossistema financeiro através da tecnologia e inovação. Nossa missão é capacitar profissionais e empresas a construírem soluções financeiras modernas, escaláveis e seguras.",
    "home.mission.title": "Nossa Missão",
    "home.mission.description": "Democratizar o acesso ao conhecimento em tecnologia financeira e criar um ambiente colaborativo onde ideias inovadoras se transformam em realidade.",
    "home.events.title": "Próximos Eventos",
    "home.events.empty": "Nenhum evento programado no momento.",
    "home.events.location": "Local",
    "home.events.date": "Data",
    "home.events.participate": "Participar",
    
    // Academy
    "academy.title": "Academy",
    "academy.subtitle": "Conteúdo educacional exclusivo",
    "academy.description": "Acesse vídeos conceituais e aprenda com especialistas do mercado financeiro.",
    "academy.login.required": "Faça login para acessar o conteúdo da Academy",
    "academy.empty": "Nenhum vídeo disponível no momento.",
    "academy.duration": "Duração",
    "academy.watch": "Assistir",
    "academy.rating.title": "Avaliação",
    "academy.rating.average": "avaliação",
    "academy.rating.averages": "avaliações",
    "academy.rating.your": "Sua avaliação:",
    "academy.rating.rate": "Avalie este vídeo:",
    "academy.comments.title": "Comentários",
    "academy.comments.placeholder": "Deixe seu comentário...",
    "academy.comments.submit": "Comentar",
    "academy.comments.submitting": "Enviando...",
    "academy.comments.empty": "Nenhum comentário ainda. Seja o primeiro a comentar!",
    "academy.comments.delete.confirm": "Tem certeza que deseja deletar este comentário?",
    
    // Blog
    "blog.title": "Blog",
    "blog.subtitle": "Insights e tendências em fintech",
    "blog.filter.all": "Todas as categorias",
    "blog.filter.label": "Filtrar por categoria",
    "blog.filter.clear": "Limpar Filtro",
    "academy.filter.label": "Filtrar por Categoria",
    "academy.filter.clear": "Limpar Filtro",
    "blog.empty": "Nenhum post disponível no momento.",
    "blog.read.more": "Ler mais",
    "blog.published": "Publicado em",
    "blog.author": "Autor:",
    "blog.rating.title": "Avaliação",
    "blog.rating.ratings": "avaliações",
    "blog.rating.yourRating": "Sua avaliação:",
    "blog.rating.loginToRate": "Faça login para avaliar este post",
    "blog.comments.title": "Comentários",
    "blog.comments.placeholder": "Deixe seu comentário...",
    "blog.comments.submit": "Comentar",
    "blog.comments.loginToComment": "Faça login para comentar",
    "blog.comments.empty": "Nenhum comentário ainda. Seja o primeiro a comentar!",
    "blog.comments.confirmDelete": "Tem certeza que deseja deletar este comentário?",
    "blog.comments.newest": "Mais recentes",
    "blog.comments.oldest": "Mais antigos",
    
    // Auth
    "auth.login.title": "Entrar na Academy",
    "auth.login.subtitle": "Acesse conteúdo exclusivo",
    "auth.login.button": "Entrar com Manus",
    "auth.signup.title": "Criar Conta",
    "auth.signup.subtitle": "Junte-se à comunidade Lerian USA",
    "auth.signup.button": "Criar Conta",
    "auth.name": "Nome completo",
    "auth.email": "E-mail",
    "auth.jobTitle": "Cargo",
    "auth.company": "Empresa atual",
    "auth.linkedin": "LinkedIn (opcional)",
    "auth.password": "Senha",
    "auth.required": "Campo obrigatório",
    
    // Admin
    "admin.dashboard": "Painel Administrativo",
    "admin.events": "Gerenciar Eventos",
    "admin.blog": "Gerenciar Blog",
    "admin.videos": "Gerenciar Vídeos",
    "admin.create": "Criar Novo",
    "admin.edit": "Editar",
    "admin.delete": "Excluir",
    "admin.save": "Salvar",
    "admin.cancel": "Cancelar",
    "admin.upload": "Upload",
    "admin.published": "Publicado",
    "admin.draft": "Rascunho",
    "admin.categories": "Categorias",
    "admin.no_categories": "Nenhuma categoria disponível",
    
    // Search
    "search.title": "Buscar",
    "search.placeholder": "Buscar",
    "search.noResults": "Nenhum resultado encontrado",
    "search.events": "Eventos",
    "search.blog": "Blog",
    "search.videos": "Vídeos",
    
    // Common
    "common.loading": "Carregando...",
    "common.error": "Erro ao carregar dados",
    "common.success": "Operação realizada com sucesso",
    "common.confirm": "Confirmar",
    "common.back": "Voltar",
    "common.save": "Salvar",
    "common.cancel": "Cancelar",
    "common.saving": "Salvando...",
    "common.allCategories": "Todas as categorias",
    "common.sort": "Ordenar por",
    "common.newest": "Mais Recentes",
    "common.popular": "Populares",
    "common.rating": "Melhor Avaliacao",
    
      // Calendar
    "nav.events": "Eventos",
    "calendar.title": "Calendário de Eventos",
    "calendar.subtitle": "Conecte-se com a comunidade fintech através de eventos online",
    "calendar.today": "Hoje",
    "calendar.previousMonth": "Mês anterior",
    "calendar.nextMonth": "Próximo mês",
    "calendar.more": "mais",
    "calendar.event": "Evento",
    "calendar.noEvents": "Nenhum evento cadastrado no momento.",
    "calendar.eventsOf": "Eventos de",
    "calendar.technology": "Tecnologia",
    "calendar.all": "Todos",
    "calendar.conferences": "Conferências",
    "calendar.featured": "Destaque",
    "calendar.register": "Inscrever-se",
    "calendar.upcomingEvents": "Próximos Eventos",
    "calendar.daysWithEvents": "Dias com eventos",
    "calendar.statistics": "Estatísticas",
    "calendar.totalEvents": "Total de Eventos",
    "calendar.thisMonth": "Este Mês",
    
    // Profile Onboarding
    "profile.completeProfile": "Completar Perfil",
    "profile.completeProfileDescription": "Precisamos de algumas informações para personalizar sua experiência",
    "profile.jobTitle": "Cargo",
    "profile.jobTitlePlaceholder": "Ex: Desenvolvedor, Analista, Gerente...",
    "profile.jobTitleRequired": "O cargo é obrigatório",
    "profile.company": "Empresa",
    "profile.companyPlaceholder": "Ex: Fintech XYZ",
    "profile.linkedin": "LinkedIn",
    "profile.continue": "Continuar",
    "profile.updated": "Perfil atualizado com sucesso!",
    "profile.updatedDescription": "Suas informações foram salvas",
    "profile.editProfile": "Editar Perfil",
    "profile.editProfileDescription": "Atualize suas informações profissionais",
    "profile.profilePhoto": "Foto de Perfil",
    "profile.dragDropImage": "Arraste uma imagem aqui ou clique para selecionar",
    "profile.imageLimits": "JPG, PNG ou WebP (máximo 3MB)",
    "profile.cropInstructions": "Arraste para mover, use a roda do mouse para zoom",
    "profile.zoom": "Zoom",
    "profile.cropAndSave": "Cortar e Salvar",
    "profile.photoUploaded": "Foto enviada com sucesso",
    "profile.photoUploadError": "Erro ao enviar foto",
    "profile.invalidFileType": "Por favor, selecione uma imagem",
    "profile.fileTooLarge": "Arquivo muito grande (máximo 3MB)",
    
    // Pagination
    "pagination.page": "Página",
    "pagination.of": "de",
    "pagination.previous": "Anterior",
    "pagination.next": "Próxima",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.academy": "Academy",
    "nav.blog": "Blog",
    "nav.login": "Sign In",
    "nav.logout": "Sign Out",
    "nav.admin": "Admin",
    
    // Home
    "home.hero.title": "Lerian USA",
    "home.hero.subtitle": "Building the future of finance",
    "home.hero.description": "We are a community dedicated to driving innovation in the financial sector through education, networking, and development of cutting-edge technological solutions.",
    "home.about.title": "About Us",
    "home.about.description": "Lerian USA is a company committed to transforming the financial ecosystem through technology and innovation. Our mission is to empower professionals and companies to build modern, scalable, and secure financial solutions.",
    "home.mission.title": "Our Mission",
    "home.mission.description": "Democratize access to knowledge in financial technology and create a collaborative environment where innovative ideas become reality.",
    "home.events.title": "Upcoming Events",
    "home.events.empty": "No events scheduled at the moment.",
    "home.events.location": "Location",
    "home.events.date": "Date",
    "home.events.participate": "Participate",
    
    // Academy
    "academy.title": "Academy",
    "academy.subtitle": "Exclusive educational content",
    "academy.description": "Access conceptual videos and learn from financial market experts.",
    "academy.login.required": "Please sign in to access Academy content",
    "academy.empty": "No videos available at the moment.",
    "academy.duration": "Duration",
    "academy.watch": "Watch",
    "academy.rating.title": "Rating",
    "academy.rating.average": "rating",
    "academy.rating.averages": "ratings",
    "academy.rating.your": "Your rating:",
    "academy.rating.rate": "Rate this video:",
    "academy.comments.title": "Comments",
    "academy.comments.placeholder": "Leave your comment...",
    "academy.comments.submit": "Comment",
    "academy.comments.submitting": "Submitting...",
    "academy.comments.empty": "No comments yet. Be the first to comment!",
    "academy.comments.delete.confirm": "Are you sure you want to delete this comment?",
    
    // Blog
    "blog.title": "Blog",
    "blog.subtitle": "Insights and trends in fintech",
    "blog.filter.all": "All categories",
    "blog.filter.label": "Filter by category",
    "blog.filter.clear": "Clear Filter",
    "academy.filter.label": "Filter by Category",
    "academy.filter.clear": "Clear Filter",
    "blog.empty": "No posts available at the moment.",
    "blog.read.more": "Read more",
    "blog.published": "Published on",
    "blog.author": "Author:",
    "blog.rating.title": "Rating",
    "blog.rating.ratings": "ratings",
    "blog.rating.yourRating": "Your rating:",
    "blog.rating.loginToRate": "Sign in to rate this post",
    "blog.comments.title": "Comments",
    "blog.comments.placeholder": "Leave your comment...",
    "blog.comments.submit": "Comment",
    "blog.comments.loginToComment": "Sign in to comment",
    "blog.comments.empty": "No comments yet. Be the first to comment!",
    "blog.comments.confirmDelete": "Are you sure you want to delete this comment?",
    "blog.comments.newest": "Newest first",
    "blog.comments.oldest": "Oldest first",
    
    // Auth
    "auth.login.title": "Sign In to Academy",
    "auth.login.subtitle": "Access exclusive content",
    "auth.login.button": "Sign In with Manus",
    "auth.signup.title": "Create Account",
    "auth.signup.subtitle": "Join the Lerian USA community",
    "auth.signup.button": "Create Account",
    "auth.name": "Full name",
    "auth.email": "Email",
    "auth.jobTitle": "Job Title",
    "auth.company": "Current Company",
    "auth.linkedin": "LinkedIn (optional)",
    "auth.password": "Password",
    "auth.required": "Required field",
    
    // Admin
    "admin.dashboard": "Admin Dashboard",
    "admin.events": "Manage Events",
    "admin.blog": "Manage Blog",
    "admin.videos": "Manage Videos",
    "admin.create": "Create New",
    "admin.edit": "Edit",
    "admin.delete": "Delete",
    "admin.save": "Save",
    "admin.cancel": "Cancel",
    "admin.upload": "Upload",
    "admin.published": "Published",
    "admin.draft": "Draft",
    "admin.categories": "Categories",
    "admin.no_categories": "No categories available",
    
    // Search
    "search.title": "Search",
    "search.placeholder": "Search",
    "search.noResults": "No results found",
    "search.events": "Events",
    "search.blog": "Blog",
    "search.videos": "Videos",
    
    // Common
    "common.loading": "Loading...",
    "common.error": "Error loading data",
    "common.success": "Operation completed successfully",
    "common.confirm": "Confirm",
    "common.back": "Back",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.saving": "Saving...",
    "common.allCategories": "All categories",
    "common.sort": "Sort by",
    "common.newest": "Newest",
    "common.popular": "Popular",
    "common.rating": "Best Rating",
    
    // Homendar
    "nav.events": "Events",
    "calendar.title": "Events Calendar",
    "calendar.subtitle": "Connect with the fintech community through online events",
    "calendar.today": "Today",
    "calendar.previousMonth": "Previous month",
    "calendar.nextMonth": "Next month",
    "calendar.more": "more",
    "calendar.event": "Event",
    "calendar.noEvents": "No events registered at the moment.",
    "calendar.eventsOf": "Events of",
    "calendar.technology": "Technology",
    "calendar.all": "All",
    "calendar.conferences": "Conferences",
    "calendar.featured": "Featured",
    "calendar.register": "Register",
    "calendar.upcomingEvents": "Upcoming Events",
    "calendar.daysWithEvents": "Days with events",
    "calendar.statistics": "Statistics",
    "calendar.totalEvents": "Total Events",
    "calendar.thisMonth": "This Month",
    
    // Profile Onboarding
    "profile.completeProfile": "Complete Your Profile",
    "profile.completeProfileDescription": "We need some information to personalize your experience",
    "profile.jobTitle": "Job Title",
    "profile.jobTitlePlaceholder": "E.g.: Developer, Analyst, Manager...",
    "profile.jobTitleRequired": "Job title is required",
    "profile.company": "Company",
    "profile.companyPlaceholder": "E.g.: Fintech XYZ",
    "profile.linkedin": "LinkedIn",
    "profile.continue": "Continue",
    "profile.updated": "Profile updated successfully!",
    "profile.updatedDescription": "Your information has been saved",
    "profile.editProfile": "Edit Profile",
    "profile.editProfileDescription": "Update your professional information",
    "profile.profilePhoto": "Profile Photo",
    "profile.dragDropImage": "Drag an image here or click to select",
    "profile.imageLimits": "JPG, PNG or WebP (maximum 3MB)",
    "profile.cropInstructions": "Drag to move, use mouse wheel to zoom",
    "profile.zoom": "Zoom",
    "profile.cropAndSave": "Crop and Save",
    "profile.photoUploaded": "Photo uploaded successfully",
    "profile.photoUploadError": "Error uploading photo",
    "profile.invalidFileType": "Please select an image",
    "profile.fileTooLarge": "File too large (maximum 3MB)",
    
    // Pagination
    "pagination.page": "Page",
    "pagination.of": "of",
    "pagination.previous": "Previous",
    "pagination.next": "Next",
  },
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("language");
    return (stored === "en" || stored === "pt") ? stored : "pt";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
