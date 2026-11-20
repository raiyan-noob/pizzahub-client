# PizzaHub — Frontend Client

A responsive, high-performance web application powering **PizzaHub**, the modern pizza ordering and delivery platform. Built with Next.js (App Router), Better Auth, Tailwind CSS, Framer Motion, and Stripe Checkout.

---

## 🍕 Project Overview

PizzaHub gives pizza lovers an intuitive and visually mouthwatering experience to discover local pizzerias, browse artisan menus, customize orders, leave verified reviews, and track delivery progress in real time. Restaurant owners manage their digital storefront, handle incoming orders, and upgrade to Premium using Stripe Checkout. Administrators oversee users, moderate menu submissions, and review platform transactions.

- **Live Website Link:** `https://pizzahub-app.vercel.app` (or local `http://localhost:3000`)
- **Client Repository:** `https://github.com/your-username/pizzahub-client`
- **Server Repository:** `https://github.com/your-username/pizzahub-server`

---

## 🚀 Key Features

1. **Role-Based Dynamic Layouts:**
   - **Customer:** Browse catalog, order pizzas, save wishlist favorites, leave reviews/ratings, track order status timelines, and cancel pending orders.
   - **Vendor (Restaurant Owner):** Manage pizzeria profile, publish menu items with ImgBB file uploads, enforce Free plan limits (max 3 active items), accept/reject orders, and upgrade to Premium via Stripe.
   - **Admin:** System overview dashboard, search and filter users, block/unblock accounts, approve/reject submitted pizzas, and audit transactions.

2. **Homepage Showcase:**
   - **Hero Banner:** Smooth Framer Motion animations, warm pizza theme, and direct call-to-action.
   - **Featured Menu Items:** Live dynamic database query featuring at least 6 approved slices with Premium badges.
   - **Pizza Categories:** 6 categories (Classic Pizzas, Vegetarian Pizzas, Meat Lovers, Specialty / Gourmet Pizzas, Sides & Appetizers, Beverages & Desserts).
   - **Extra Sections:** "Why Choose PizzaHub?" benefits section, 3-step "How PizzaHub Works" guide, and customer testimonials.

3. **Menu Catalog & Advanced Search:**
   - Real-time search across item names, descriptions, and locations.
   - Category filtering and price sorting (`price_asc`, `price_desc`, `newest`).
   - Equal card heights, fixed image aspect ratios, and responsive mobile/tablet/desktop grid.

4. **Authentication & Authorization:**
   - Powered by Better Auth with MongoDB adapter.
   - Email/password authentication with password strength validation (min 6 characters, uppercase, and lowercase).
   - Google OAuth integration.
   - Profile image upload via ImgBB.
   - Immediate Navbar state updates upon sign in, role switch, or logout.

5. **Stripe Checkout & Webhook Integration:**
   - Seamless checkout redirect for vendor subscriptions ($19.99/mo).
   - Payment success celebration with `canvas-confetti` and automatic tier upgrade.
   - Payment cancellation recovery flow.

6. **Optional Requirements Completed:**
   - **Reviews & Ratings:** 1-5 star selector with customer feedback on item details.
   - **Dark / Light Mode Toggle:** Seamless switching with `next-themes`.
   - **Order Status Timeline:** Visual stepper on customer order cards (Placed -> Accepted -> Baking/Delivered).
   - **Wishlist / Favorites:** Customer bookmarks with instant toggle.

---

## 🛠️ Technology Stack & Dependencies

- **Framework:** Next.js `16.4.6` (App Router)
- **Library:** React `19.3.0` & React DOM `19.3.0`
- **Authentication:** Better Auth `v1.7.27` & `@better-auth/mongo-adapter`
- **Styling & UI:** Tailwind CSS `v4.3.3`, `clsx`, `tailwind-merge`
- **Animations:** Framer Motion `v14.14.0`, Canvas Confetti `v1.9.4`
- **Icons:** Lucide React `v1.77.0` (including custom modern X logo per requirements)
- **Theme:** `next-themes` `v0.4.6`
- **Notifications:** Sonner `v2.0.8` (no native `alert()`)
- **Data Visualization:** Recharts `v3.11.0`

---

## 🔐 Environment Variables

Create a `.env` file in the root of `pizzahub-client`:

```env
MONGODBURI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/pizzahub?retryWrites=true&w=majority
BETTER_AUTH_SECRET=your_better_auth_secret_here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
JWT_SECRET=your_jwt_secret_here

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
IMAGEBB_API=your_imgbb_api_key
NEXT_PUBLIC_IMAGEBB_API=your_imgbb_api_key
```

> **Security Note:** `.env` is ignored in `.gitignore` and credentials are never pushed to GitHub.

---

## 💻 Installation & Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/pizzahub-client.git
   cd pizzahub-client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Next.js development server:**
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

---

## 📝 Challenge Requirements Implementation Details

### Challenge 1: Advanced Search and Sorting
- In `src/app/menu/page.js`, search inputs trigger debounced query updates against the Express endpoint `/api/menu/public`.
- The user can combine:
  - Text search: Matches item name, toppings description, or location.
  - Category selector: Filters by any of the 6 artisan pizza categories.
  - Location input: Matches restaurant neighborhood.
  - Price sorting: Toggles between `price_asc` (Low to High), `price_desc` (High to Low), and `newest`.
- All states are synced with pagination for clean browser navigation.

### Challenge 2: JWT / Token Verification Flow
- When a user signs in via Better Auth, the client requests a signed JWT from `/api/auth/token`.
- The token is securely stored and attached via `Authorization: Bearer <token>` on all API calls via `src/lib/api.js`.
- The Express backend decodes the token, extracts fresh user permissions, checks `isBlocked` status, and guards private routes.
- Unauthorized access triggers a graceful redirect to `/signin` with toast alerts.

### Challenge 3: Visual & UX Enhancements
- Warm pizza theme with custom CSS variables (warm reds `#dc2626`, radiant oranges `#ea580c`, and creamy backgrounds).
- Responsive mobile side drawer and desktop navigation.
- Smooth Framer Motion animations on hero and category cards.
- Integrated Dark / Light mode toggle supporting system preferences.
- Confetti celebration upon Stripe subscription confirmation.
