import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useGuestHouse } from "@/lib/guest-house-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reviews")({
  component: ReviewsPage,
});

function StarRating({
  rating,
  interactive,
  onRate,
}: {
  rating: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type={interactive ? "button" : undefined}
          onClick={() => interactive && onRate?.(i)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star className={`h-4 w-4 ${i <= rating ? "fill-gold text-gold" : "text-border"}`} />
        </button>
      ))}
    </div>
  );
}

function ReviewsPage() {
  const { houseName, activeHouse } = useGuestHouse();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("guest_house", activeHouse)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      setReviews(data || []);
      setLoading(false);
    };
    fetchReviews();
  }, [activeHouse]);

  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("reviews").insert({
      guest_house: activeHouse,
      reviewer_name: newReview.name,
      rating: newReview.rating,
      comment: newReview.comment,
    });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setNewReview({ name: "", rating: 5, comment: "" });
  };

  return (
    <>
      <section className="bg-charcoal py-20 text-center">
        <span className="section-label text-gold-light">WORDS FROM OUR GUESTS</span>
        <h1 className="section-title text-warm-white mt-2">The stay speaks for itself.</h1>
        <p className="mt-3 max-w-xl mx-auto text-sm text-warm-white/60">
          Every visit leaves a story. Here are some of the experiences our guests have chosen to
          share.
        </p>
        {reviews.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <StarRating rating={Math.round(avgRating)} />
            <span className="text-sm text-gold-light">{avgRating.toFixed(1)}/5</span>
            <span className="text-xs text-warm-white/50">({reviews.length} reviews)</span>
          </div>
        )}
      </section>

      <section className="py-16 bg-background">
        <div className="mx-auto max-w-4xl px-4">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center mb-12">
              No reviews yet. Be the first to share your experience!
            </p>
          ) : (
            <div className="grid gap-6 mb-16">
              {reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card border border-border p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {review.reviewer_name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Write Review Form */}
          <div className="bg-cream border border-border p-8">
            <h2 className="font-heading text-2xl text-foreground mb-2">Stayed with us?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Tell us what made your stay memorable.
            </p>
            {submitted ? (
              <p className="text-sm text-gold-dark">
                Thank you for your review! It will be published after moderation.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={newReview.name}
                  onChange={(e) => setNewReview((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:border-gold-dark"
                />
                <div>
                  <label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
                    Your Rating
                  </label>
                  <StarRating
                    rating={newReview.rating}
                    interactive
                    onRate={(r) => setNewReview((p) => ({ ...p, rating: r }))}
                  />
                </div>
                <textarea
                  placeholder="Share your experience..."
                  required
                  rows={4}
                  value={newReview.comment}
                  onChange={(e) => setNewReview((p) => ({ ...p, comment: e.target.value }))}
                  className="w-full border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:border-gold-dark resize-none"
                />
                <button type="submit" className="btn-gold">
                  Submit Review
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
