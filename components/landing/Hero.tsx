"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-2 text-blue-700">
            Trusted by 10,000+ Customers
          </p>

          <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            Clean Clothes.
            <br />
            Delivered Fresh.
          </h1>

          <p className="mb-8 text-lg text-gray-600">
            Schedule laundry pickup in less than 30 seconds.
            Fast pickup, premium cleaning and secure delivery.
          </p>

          <div className="flex gap-4">
            <button className="rounded-xl bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700">
              Book Pickup
            </button>

            <button className="rounded-xl border px-6 py-3 transition hover:bg-gray-100">
              View Pricing
            </button>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-blue-600">10K+</h2>
              <p>Orders</p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-blue-600">4.9★</h2>
              <p>Rating</p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-blue-600">30 min</h2>
              <p>Pickup</p>
            </div>
          </div>
        </motion.div>

        {/* Right Side */}
        <div className="flex items-center justify-center">
          <div className="flex h-96 w-96 items-center justify-center rounded-3xl bg-blue-100 text-7xl shadow-xl">
            🧺
          </div>
        </div>
      </div>
    </section>
  );
}