import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGuestHouse } from "@/lib/guest-house-context";
import { supabase } from "@/integrations/supabase/client";
import ghOutdoorDining from "@/assets/gh-outdoor-dining.jpg";
import nhDining2 from "@/assets/nh-dining2.jpg";

export const Route = createFileRoute("/dining")({
  component: DiningPage,
});

function DiningPage() {
  const { houseName, activeHouse } = useGuestHouse();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const heroImage = activeHouse === "greater-heights" ? ghOutdoorDining : nhDining2;

  useEffect(() => {
    supabase.from("menu_items").select("*").eq("guest_house", activeHouse).order("display_order").then(({ data }) => {
      setMenuItems(data || []);
    });
  }, [activeHouse]);

  const categories = ["breakfast", "lunch", "dinner"];
  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = menuItems.filter((item) => item.category === cat);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <>
      <section className="relative h-[50vh] min-h-[350px]">
        <img src={heroImage} alt="Dining" className="absolute inset-0 h-full w-full object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
          <span className="section-label text-gold-light">Culinary Excellence</span>
          <h1 className="section-title text-warm-white mt-2">Dining & Menus</h1>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-center text-sm text-muted-foreground mb-12 max-w-lg mx-auto">
            Savour gourmet dishes and refreshing cocktails at {houseName}'s elegant restaurant and bar.
          </p>

          {categories.map((meal) => (
            <motion.div key={meal} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
              <h2 className="font-heading text-2xl text-foreground mb-6 capitalize border-b border-border pb-3">{meal}</h2>
              <div className="space-y-4">
                {(grouped[meal] || []).map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                    <span className="text-sm font-semibold text-gold-dark whitespace-nowrap">{item.price}</span>
                  </div>
                ))}
                {(!grouped[meal] || grouped[meal].length === 0) && (
                  <p className="text-xs text-muted-foreground">No items available.</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
