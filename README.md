# LaundryOS 🧺

An on-demand, multi-role laundry service platform built for mobile-first web browsers using Next.js (App Router), TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features & Roles

* **Customer App:** Service catalogue, interactive cart, secure checkout with pickup date/time scheduling, payment methods (Online/UPI & COD), live order tracking timeline, and notification center.
* **Delivery Partner App:** Assigned task queue, task acceptance, and order status updates.
* **Facility / Vendor Panel:** Processing pipeline queue (`AT_FACILITY` → `IN_PROCESS` → `READY`).
* **Admin Control Hub:** Dashboard overview, revenue analytics, customer directory, and order management with real-time Supabase integration.

## 🛠️ Tech Stack

* **Frontend & Backend:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons
* **Database & Auth & Realtime:** Supabase (PostgreSQL with Row Level Security enabled)
* **Hosting:** Vercel (Auto-deploy from main branch)

## ⚙️ Local Setup & Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/ashokbadda/laundryos.git](https://github.com/ashokbadda/laundryos.git)
   cd laundryos