"use client";

import { useCartStore } from "@/lib/store/cartStore";
import { toast } from "sonner";
import { Plus, Sparkles } from "lucide-react";

type Props = {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
};

export default function ServiceCard({
  id,
  name,
  description,
  price,
  unit,
}: Props) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({ id, name, price, unit, quantity: 1 });
    toast.success(`${name} added to cart! 🧺`);
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl">
      <div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3 w-3" /> Premium Care
          </span>
        </div>

        <h3 className="mt-3 text-xl font-bold text-slate-800 transition group-hover:text-blue-600">
          {name}
        </h3>

        <p className="mt-2 text-sm text-slate-500 line-clamp-2">{description}</p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          <span className="text-2xl font-extrabold text-slate-900">₹{price}</span>
          <span className="text-xs text-slate-500"> / {unit}</span>
        </div>

        <button
          onClick={handleAddToCart}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
    </div>
  );
}