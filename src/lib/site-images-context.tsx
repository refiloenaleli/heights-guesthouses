import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Site images allow the admin to replace every image that appears on the
 * public website (heroes, logos, landing cards, welcome galleries, dining
 * photos, ...). Each slot is identified by a stable `slot_key`:
 *
 *   landing.hero                     — landing page hero background
 *   landing.card.greater-heights     — landing "Greater Heights" card image
 *   landing.card.new-heights         — landing "New Heights" card image
 *   logo.greater-heights             — navbar / footer logo (Greater)
 *   logo.new-heights                 — navbar / footer logo (New)
 *   <house>.home.hero                — home hero background
 *   <house>.home.welcome             — home welcome gallery (multi-slot)
 *   <house>.home.dining_cta          — home dining call-to-action image
 *   <house>.about.hero               — about page hero background
 *   <house>.dining.hero              — dining page hero background
 *   <house>.dining.interior          — dining page interior photo
 *   <house>.dining.meals             — dining page food gallery (multi-slot)
 *
 * When a slot has no rows in the database the built-in default asset is used,
 * so the website always renders even before this table exists.
 */

export type SiteImageRow = {
  id: string;
  slot_key: string;
  image_url: string;
  alt_text: string;
  display_order: number;
};

type SiteImagesMap = Record<string, SiteImageRow[]>;

const SiteImagesContext = createContext<SiteImagesMap>({});

let warnedTableMissing = false;
let warnedInvalidUrls = false;

function isAllowedSiteImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  if (
    url.startsWith("/") ||
    url.startsWith("./") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return true;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;

    const configuredSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    if (!configuredSupabaseUrl) return true;

    const configuredHost = new URL(configuredSupabaseUrl).hostname;
    return parsed.hostname === configuredHost;
  } catch {
    return false;
  }
}

export function SiteImagesProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<SiteImagesMap>({});

  useEffect(() => {
    let cancelled = false;

    supabase
      .from("site_images")
      .select("id, slot_key, image_url, alt_text, display_order")
      .order("slot_key")
      .order("display_order")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          // Table not migrated yet — fall back to defaults silently (warn once).
          if (!warnedTableMissing) {
            warnedTableMissing = true;
            console.warn("site_images not available, using default assets:", error.message);
          }
          return;
        }

        const validRows = ((data as SiteImageRow[]) || []).filter((row) =>
          isAllowedSiteImageUrl(row.image_url),
        );

        if (!warnedInvalidUrls && validRows.length !== ((data as SiteImageRow[]) || []).length) {
          warnedInvalidUrls = true;
          console.warn(
            "Ignoring invalid site image URLs that do not match the configured Supabase project.",
          );
        }

        const map: SiteImagesMap = {};
        for (const row of validRows) {
          (map[row.slot_key] ||= []).push(row);
        }
        setImages(map);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return <SiteImagesContext.Provider value={images}>{children}</SiteImagesContext.Provider>;
}

/** Returns the override URL for a single-image slot, or `fallback`. */
export function useSiteImage(slotKey: string, fallback: string): string {
  const images = useContext(SiteImagesContext);
  return useMemo(() => {
    const rows = images[slotKey];
    return rows && rows.length > 0 ? rows[0].image_url : fallback;
  }, [images, slotKey, fallback]);
}

/** Returns the override URLs for a multi-image slot, or `fallbacks` when empty. */
export function useSiteImageList(slotKey: string, fallbacks: string[]): string[] {
  const images = useContext(SiteImagesContext);
  return useMemo(() => {
    const rows = images[slotKey];
    const urls = (rows || []).map((r) => r.image_url).filter(Boolean);
    return urls.length > 0 ? urls : fallbacks;
  }, [images, slotKey, fallbacks]);
}
