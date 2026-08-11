export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center">

        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>

        <h2 className="mt-6 text-2xl font-bold">
          LaundryOS
        </h2>

        <p className="mt-2 text-gray-500">
          Loading...
        </p>

      </div>
    </div>
  );
}