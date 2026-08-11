import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company */}
          <div>
            <h2 className="text-3xl font-bold text-blue-400">
              LaundryOS
            </h2>

            <p className="mt-4 text-gray-400">
              Premium laundry service with fast pickup and doorstep delivery.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold">
              Services
            </h3>

            <ul className="mt-4 space-y-3 text-gray-400">
              <li>Wash & Fold</li>
              <li>Wash & Iron</li>
              <li>Dry Cleaning</li>
              <li>Shoe Cleaning</li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold">
              Company
            </h3>

            <ul className="mt-4 space-y-3 text-gray-400">
              <li>
                <Link href="#">
                  About Us
                </Link>
              </li>

              <li>
                <Link href="#">
                  Contact
                </Link>
              </li>

              <li>
                <Link href="#">
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link href="#">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold">
              Contact
            </h3>

            <ul className="mt-4 space-y-3 text-gray-400">
              <li>📞 +91 98765 43210</li>
              <li>✉ support@laundryos.com</li>
              <li>📍 Hyderabad, India</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-700 pt-8 text-center text-gray-500">
          © 2026 LaundryOS. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}