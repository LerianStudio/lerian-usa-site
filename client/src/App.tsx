import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nProvider } from "./contexts/I18nContext";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Calendar from "./pages/Calendar";
import Academy from "./pages/Academy";
import AcademyVideo from "./pages/AcademyVideo";
import Admin from "./pages/Admin";
import ProfileOnboarding from "./components/ProfileOnboarding";
import { useAuth } from "./hooks/useAuth";

function Router() {
  const { user, isLoading } = useAuth();

  // Show onboarding if user is logged in but hasn't completed profile
  if (!isLoading && user && !user.profileCompleted) {
    return <ProfileOnboarding />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/eventos" component={Calendar} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/academy" component={Academy} />
      <Route path="/academy/:id" component={AcademyVideo} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <I18nProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
