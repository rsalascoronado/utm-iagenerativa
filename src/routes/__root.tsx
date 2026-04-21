import { Outlet, createRootRoute, HeadContent, Scripts, Link } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Página no encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La sección que buscas no existe en este dashboard.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Análisis Encuesta UTM — Dashboard interactivo" },
      {
        name: "description",
        content:
          "Dashboard interactivo del análisis de la encuesta de la Universidad Tecnológica de la Mixteca: estudiantes, docentes, dimensiones y hallazgos.",
      },
      { property: "og:title", content: "Análisis Encuesta UTM — Dashboard interactivo" },
      { name: "twitter:title", content: "Análisis Encuesta UTM — Dashboard interactivo" },
      { name: "description", content: "Analyzes survey results from Excel files, cross-referencing with dictionary data for comprehensive insights." },
      { property: "og:description", content: "Analyzes survey results from Excel files, cross-referencing with dictionary data for comprehensive insights." },
      { name: "twitter:description", content: "Analyzes survey results from Excel files, cross-referencing with dictionary data for comprehensive insights." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/90616567-1abe-4773-8a6c-e4390bd7671f/id-preview-62e6ff39--b904d36e-3942-42c2-af02-d134efa964e0.lovable.app-1776476734314.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/90616567-1abe-4773-8a6c-e4390bd7671f/id-preview-62e6ff39--b904d36e-3942-42c2-af02-d134efa964e0.lovable.app-1776476734314.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
      { name: "theme-color", content: "#1e3a5f" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "UTM Encuesta" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/icon-512.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger />
          <div className="flex-1 text-sm font-medium text-muted-foreground">
            Universidad Tecnológica de la Mixteca · Análisis de Encuesta
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </SidebarInset>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}
