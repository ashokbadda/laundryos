export default function FAQ() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-6">

        <h2 className="text-center text-4xl font-bold">
          Frequently Asked Questions
        </h2>

        <p className="mt-4 text-center text-gray-500">
          Everything you need to know about LaundryOS.
        </p>

        <div className="mt-12 space-y-6">

          <div className="rounded-xl border p-6">
            <h3 className="text-xl font-semibold">
              How long does laundry take?
            </h3>

            <p className="mt-3 text-gray-600">
              Most orders are completed within 24–48 hours.
            </p>
          </div>

          <div className="rounded-xl border p-6">
            <h3 className="text-xl font-semibold">
              Do you offer same-day pickup?
            </h3>

            <p className="mt-3 text-gray-600">
              Yes, depending on your location.
            </p>
          </div>

          <div className="rounded-xl border p-6">
            <h3 className="text-xl font-semibold">
              Can I track my order?
            </h3>

            <p className="mt-3 text-gray-600">
              Yes. Every order can be tracked in real time.
            </p>
          </div>

          <div className="rounded-xl border p-6">
            <h3 className="text-xl font-semibold">
              Which payment methods are accepted?
            </h3>

            <p className="mt-3 text-gray-600">
              Razorpay Test Mode, UPI, Cards and Cash on Delivery.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}