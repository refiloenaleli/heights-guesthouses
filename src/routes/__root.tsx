import { Outlet, Link, createRootRoute, useLocation } from "@tanstack/react-router";
import { GuestHouseProvider, useGuestHouse } from "@/lib/guest-house-context";
import { SiteImagesProvider } from "@/lib/site-images-context";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <GuestHouseProvider>
      <Navbar />
      <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-24">
        <div className="max-w-md text-center">
          <h1 className="text-7xl font-heading text-gold">404</h1>
          <h2 className="mt-4 text-xl font-heading text-foreground">Page not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="mt-6">
            <Link to="/home" className="btn-gold inline-block">
              Go home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </GuestHouseProvider>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Greater Heights & New Heights Guest Houses | Luxury Accommodation" },
      {
        name: "description",
        content:
          "Experience luxury accommodation at Greater Heights & New Heights Guest Houses in Lesotho. Modern rooms, fine dining, and exceptional hospitality.",
      },
      { name: "author", content: "Heights Guest Houses" },
      { property: "og:title", content: "Greater Heights & New Heights Guest Houses" },
      { property: "og:description", content: "Luxury guest house accommodation in Lesotho" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // ✅ NO favicon here at all
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <GuestHouseProvider>
      <SiteImagesProvider>
        <ThemedApp />
      </SiteImagesProvider>
    </GuestHouseProvider>
  );
}

function ThemedApp() {
  const { activeHouse } = useGuestHouse();
  const location = useLocation();
  const theme = location.pathname === "/" ? "landing" : activeHouse;
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div data-house-theme={theme}>
      {!isAdmin && <Navbar />}
      <main>
        <Outlet />
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}
