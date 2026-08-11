"use client";

import { motion } from "framer-motion";

const reviews = [
  {
    name: "Rahul Sharma",
    city: "Hyderabad",
    rating: "★★★★★",
    review:
      "Excellent service! My clothes were picked up on time and returned perfectly cleaned.",
  },
  {
    name: "Priya Reddy",
    city: "Bangalore",
    rating: "★★★★★",
    review:
      "Very professional team. Booking was simple and delivery was quick.",
  },
  {
    name: "Arjun Kumar",
    city: "Chennai",
    rating: "★★★★★",
    review:
      "Affordable pricing and outstanding quality. Highly recommended.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold">
            What Our Customers Say
          </h2>

          <p className="mt-4 text-gray-500">
            Trusted by thousands of happy customers.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <motion.div
              key={review.name}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl bg-white p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="text-xl text-yellow-500">
                {review.rating}
              </div>

              <p className="mt-5 text-gray-600">
                "{review.review}"
              </p>

              <div className="mt-8">
                <h3 className="font-bold">
                  {review.name}
                </h3>

                <p className="text-gray-500">
                  {review.city}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}