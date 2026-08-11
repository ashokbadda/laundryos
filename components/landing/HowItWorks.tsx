const steps = [
  {
    number: "01",
    title: "Book Pickup",
    icon: "📅",
    description: "Choose your preferred pickup date and time."
  },
  {
    number: "02",
    title: "Pickup",
    icon: "🚚",
    description: "Our delivery partner collects your laundry."
  },
  {
    number: "03",
    title: "Professional Cleaning",
    icon: "🧺",
    description: "Your clothes are cleaned with premium care."
  },
  {
    number: "04",
    title: "Quality Check",
    icon: "✅",
    description: "Every item is inspected before delivery."
  },
  {
    number: "05",
    title: "Delivered",
    icon: "🏠",
    description: "Fresh clothes delivered back to your doorstep."
  }
];

export default function HowItWorks() {
  return (
    <section className="bg-slate-50 py-20">

      <div className="mx-auto max-w-7xl px-6">

        <h2 className="text-center text-4xl font-bold">
          How It Works
        </h2>

        <p className="mt-3 text-center text-gray-500">
          Laundry completed in five simple steps.
        </p>

        <div className="mt-14 grid gap-8 md:grid-cols-5">

          {steps.map((step) => (

            <div
              key={step.number}
              className="rounded-2xl bg-white p-6 text-center shadow-md"
            >

              <div className="text-5xl">
                {step.icon}
              </div>

              <div className="mt-5 text-blue-600 font-bold">
                {step.number}
              </div>

              <h3 className="mt-3 text-xl font-bold">
                {step.title}
              </h3>

              <p className="mt-3 text-sm text-gray-500">
                {step.description}
              </p>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}