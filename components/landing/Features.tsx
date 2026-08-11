"use client";

import { motion } from "framer-motion";
import {
  Truck,
  MapPinned,
  ShieldCheck,
  Sparkles,
  BadgeDollarSign,
  Leaf,
} from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Same Day Pickup",
    description:
      "Book today and we'll collect your laundry within hours.",
  },
  {
    icon: MapPinned,
    title: "Live Order Tracking",
    description:
      "Track every stage of your laundry order in real time.",
  },
  {
    icon: ShieldCheck,
    title: "OTP Secure Delivery",
    description:
      "Pickup and delivery are verified using OTP for maximum security.",
  },
  {
    icon: Sparkles,
    title: "Premium Cleaning",
    description:
      "Professional care for everyday and delicate garments.",
  },
  {
    icon: BadgeDollarSign,
    title: "Affordable Pricing",
    description:
      "Transparent pricing with absolutely no hidden charges.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Process",
    description:
      "Environment-friendly detergents and sustainable cleaning methods.",
  },
];

export default function Features() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="text-center">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">
            Why Choose Us
          </span>

          <h2 className="mt-5 text-4xl font-bold text-gray-900 md:text-5xl">
            Why Choose LaundryOS?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-500">
            Experience premium laundry services with fast pickup, secure
            delivery, live tracking and affordable pricing.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                whileHover={{ y: -8, scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="group rounded-3xl border border-gray-200 bg-white p-8 shadow-md"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 transition duration-300 group-hover:bg-blue-600">
                  <Icon
                    size={30}
                    className="text-blue-600 transition duration-300 group-hover:text-white"
                  />
                </div>

                <h3 className="mt-6 text-2xl font-bold text-gray-900">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-7 text-gray-500">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}