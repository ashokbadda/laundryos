"use client";

import { motion } from "framer-motion";
import {
  Shirt,
  Sparkles,
  WashingMachine,
  Flame,
  Crown,
  Footprints,
} from "lucide-react";

const services = [
  {
    title: "Wash & Fold",
    price: "₹79 / kg",
    icon: WashingMachine,
    description: "Freshly washed and neatly folded clothes.",
  },
  {
    title: "Wash & Iron",
    price: "₹99 / kg",
    icon: Shirt,
    description: "Perfectly cleaned and professionally ironed.",
  },
  {
    title: "Dry Cleaning",
    price: "Starts ₹149",
    icon: Sparkles,
    description: "Premium care for delicate and expensive garments.",
  },
  {
    title: "Steam Iron",
    price: "₹20 / Piece",
    icon: Flame,
    description: "Professional wrinkle-free steam ironing.",
  },
  {
    title: "Premium Care",
    price: "Starts ₹199",
    icon: Crown,
    description: "Luxury cleaning for premium fabrics.",
  },
  {
    title: "Shoe Cleaning",
    price: "₹249 / Pair",
    icon: Footprints,
    description: "Deep cleaning and restoration for shoes.",
  },
];

export default function Services() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">
            Our Services
          </span>

          <h2 className="mt-5 text-4xl font-bold text-gray-900 md:text-5xl">
            Professional Laundry Services
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-500">
            Fast pickup, premium cleaning, transparent pricing, and doorstep
            delivery.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <motion.div
                key={service.title}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="group rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-3 hover:border-blue-500 hover:shadow-2xl"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 transition group-hover:bg-blue-600">
                  <Icon
                    size={30}
                    className="text-blue-600 group-hover:text-white"
                  />
                </div>

                <h3 className="mt-6 text-2xl font-bold text-gray-900">
                  {service.title}
                </h3>

                <p className="mt-3 text-gray-500">
                  {service.description}
                </p>

                <div className="mt-6">
                  <p className="text-sm text-gray-400">
                    Starting From
                  </p>

                  <p className="text-3xl font-bold text-blue-600">
                    {service.price}
                  </p>
                </div>

                <button className="mt-8 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700">
                  Book Now
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}