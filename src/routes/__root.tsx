import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "ห้องเรียนธรรมชาติของ ไบรอั่น";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "description", content: "ห้องเรียนธรรมชาติของ ไบรอั่น เรียนรู้แสงแดด น้ำ ดิน และอากาศผ่านการปลูกต้นไม้" },
      { name: "theme-color", content: "#8fd3f7" },
    ],
    links: [
      { rel: "icon", type: "image/png", sizes: "48x48", href: "/favicon-48.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preload", as: "image", href: "/assets/byron-stand.webp", type: "image/webp" },
      { rel: "preload", as: "font", href: "/fonts/mali-700-thai.woff2", type: "font/woff2", crossOrigin: "anonymous" },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="th" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
