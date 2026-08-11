"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Star, MessageSquare } from "lucide-react";

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  order_id: number;
  users: { raw_user_meta_data: { full_name: string } };
}

export default function AdminFeedbackPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      const { data } = await supabase
        .from("reviews")
        .select(`*, users:user_id(raw_user_meta_data)`)
        .order("created_at", { ascending: false });
      
      if (data) setReviews(data);
      setLoading(false);
    }
    fetchReviews();
  }, []);

  if (loading) return <div className="p-10 font-bold">Loading feedback...</div>;

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-sky-600" /> Customer Feedback
        </h1>
        <p className="text-sm text-slate-500 mt-1">Monitor wash quality and delivery ratings.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  {review.users?.raw_user_meta_data?.full_name || "Guest User"}
                </p>
                <p className="text-[10px] text-slate-500">Order #{review.order_id} • {new Date(review.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-700 italic leading-relaxed">
              "{review.comment || "No comment provided."}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}