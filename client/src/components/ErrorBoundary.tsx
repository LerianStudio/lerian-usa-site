import React, { ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the entire app.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-destructive/50">
            <CardHeader className="bg-destructive/10">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle className="text-destructive">Algo deu errado</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Desculpe, encontramos um erro inesperado. Por favor, tente novamente ou entre em contato com o suporte.
                </p>
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <details className="mt-4 p-3 bg-muted rounded-md text-xs">
                    <summary className="cursor-pointer font-semibold mb-2">
                      Detalhes do Erro (Desenvolvimento)
                    </summary>
                    <div className="space-y-2 text-muted-foreground overflow-auto max-h-48">
                      <div>
                        <strong>Mensagem:</strong>
                        <pre className="bg-background p-2 rounded mt-1 overflow-auto">
                          {this.state.error.toString()}
                        </pre>
                      </div>
                      {this.state.errorInfo && (
                        <div>
                          <strong>Stack Trace:</strong>
                          <pre className="bg-background p-2 rounded mt-1 overflow-auto text-xs">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <Button
                  onClick={this.handleReset}
                  variant="default"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Voltar para Início
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="ghost"
                  className="w-full text-muted-foreground"
                >
                  Recarregar Página
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center pt-2">
                Se o problema persistir, por favor entre em contato com o suporte.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
