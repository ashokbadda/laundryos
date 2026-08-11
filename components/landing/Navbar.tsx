import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          LaundryOS
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex gap-8">
          <Link href="#">Services</Link>
          <Link href="#">Pricing</Link>
          <Link href="#">Track Order</Link>
          <Link href="#">About</Link>
          <Link href="#">Contact</Link>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex gap-3">

          <button className="px-4 py-2">
            Login
          </button>

          <button className="border rounded-lg px-4 py-2">
            Register
          </button>

          <button className="rounded-lg bg-blue-600 px-5 py-2 text-white">
            Book Pickup
          </button>

        </div>

        {/* Mobile Menu Icon */}
        <button className="lg:hidden text-3xl">
          ☰
        </button>

      </div>
    </header>
  );
}