"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PizzaCard } from "@/components/PizzaCard";
import { apiRequest } from "@/lib/api";
import {
  Pizza,
  Flame,
  Clock,
  ShieldCheck,
  Award,
  ChevronRight,
  ArrowRight,
  Utensils,
  Leaf,
  Drumstick,
  Sparkles,
  CupSoda,
  Cookie,
  Quote,
  Star,
} from "lucide-react";

export default function HomePage() {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await apiRequest("/api/menu/featured");
        if (res.success && Array.isArray(res.data)) {
          setFeaturedItems(res.data);
        }
      } catch (err) {
        console.error("Failed to load featured items:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const categories = [
    {
      title: "Classic Pizzas",
      slug: "Classic Pizzas",
      desc: "Timeless Margherita, Marinara & NY Cheese slices",
      icon: Pizza,
      color: "from-red-500 to-amber-600",
      image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&auto=format&fit=crop&q=80",
    },
    {
      title: "Vegetarian Pizzas",
      slug: "Vegetarian Pizzas",
      desc: "Garden-fresh vegetables, truffle oil & artisan cheeses",
      icon: Leaf,
      color: "from-emerald-500 to-teal-600",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80",
    },
    {
      title: "Meat Lovers",
      slug: "Meat Lovers",
      desc: "Artisan pepperoni, smoked brisket & savory sausages",
      icon: Drumstick,
      color: "from-amber-600 to-red-700",
      image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=80",
    },
    {
      title: "Specialty / Gourmet Pizzas",
      slug: "Specialty / Gourmet Pizzas",
      desc: "Quattro Formaggi, burrata, figs & culinary craft",
      icon: Sparkles,
      color: "from-purple-500 to-pink-600",
      image: "https://images.unsplash.com/photo-1573821663912-569905455b1c?w=500&auto=format&fit=crop&q=80",
    },
    {
      title: "Sides & Appetizers",
      slug: "Sides & Appetizers",
      desc: "Garlic knots, cheesy breadsticks & marinara dips",
      icon: Utensils,
      color: "from-amber-500 to-orange-600",
      image: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=500&auto=format&fit=crop&q=80",
    },
    {
      title: "Beverages & Desserts",
      slug: "Beverages & Desserts",
      desc: "Authentic Italian tiramisu & sparkling San Pellegrino",
      icon: CupSoda,
      color: "from-cyan-500 to-blue-600",
      image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80",
    },
  ];

  const testimonials = [
    {
      name: "Marco Donatelli",
      role: "Culinary Critic, Food & Vine",
      quote: "PizzaHub connects us to true Neapolitan masters. The crust is crispy, bubbly, and arrives steaming hot!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 5,
    },
    {
      name: "Sophia Sterling",
      role: "Verified Foodie",
      quote: "Ordering dinner for family game nights has never been this smooth. The gourmet truffle pizza blew everyone away.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      rating: 5,
    },
    {
      name: "Chef Anthony V.",
      role: "Pizzeria Owner & Vendor",
      quote: "Upgrading to a Premium vendor account brought my local pizzeria hundreds of enthusiastic customers in weeks!",
      avatar: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=120&auto=format&fit=crop&q=80",
      rating: 5,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-amber-100/30 to-transparent dark:from-stone-900/60 dark:to-stone-950 py-20 lg:py-28 border-b border-amber-100 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline, Description & CTA */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 dark:bg-red-950/70 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold tracking-wide uppercase">
                <Flame className="w-4 h-4 fill-red-500" />
                <span>Wood-Fired & Handcrafted Daily</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-stone-900 dark:text-stone-50 leading-[1.1]">
                Hot & Fresh Pizza{" "}
                <span className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Delivered to Your Door
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Craving bubbly cheese, crispy blistered crust, and rich San Marzano marinara? PizzaHub connects you directly with top local artisan pizzerias. Order in seconds, track in real-time, and savor every hot slice.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/menu"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-base shadow-lg shadow-red-500/25 hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                >
                  <Pizza className="w-5 h-5" />
                  <span>Explore Pizza Menu</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border-2 border-stone-300 dark:border-stone-700 hover:border-red-500 font-bold text-sm text-stone-800 dark:text-stone-200 bg-white/70 dark:bg-stone-850 backdrop-blur-xs transition-colors"
                >
                  <span>Restaurant Owner? Join as Vendor</span>
                </Link>
              </div>

              {/* Key Trust Stats */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-stone-200/60 dark:border-stone-800/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <p className="text-2xl font-black text-stone-900 dark:text-stone-100">30 Min</p>
                  <p className="text-xs text-stone-500">Average Delivery</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-stone-900 dark:text-stone-100">100%</p>
                  <p className="text-xs text-stone-500">Artisan Wood-Fired</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-stone-900 dark:text-stone-100">4.9 ★</p>
                  <p className="text-xs text-stone-500">Slice Satisfaction</p>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Dynamic Pizza Imagery */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-5 relative flex justify-center"
            >
              <div className="relative w-full max-w-md aspect-square rounded-full p-4 bg-gradient-to-tr from-amber-400/30 via-red-500/20 to-transparent backdrop-blur-md">
                <img
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80"
                  alt="Hot Sizzling Wood-Fired Pizza"
                  className="w-full h-full object-cover rounded-full shadow-2xl animate-spin-extremely-slow border-4 border-white/50 dark:border-stone-800/80"
                />

                {/* Floating Highlights */}
                <div className="absolute -bottom-2 -left-2 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
                    🔥
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      Baking at 900°F
                    </p>
                    <p className="text-[11px] text-stone-500">Authentic Stone Oven</p>
                  </div>
                </div>

                <div className="absolute -top-2 -right-2 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-600 flex items-center justify-center font-bold">
                    🍕
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      Fresh Mozzarella
                    </p>
                    <p className="text-[11px] text-stone-500">100% Real Fior di Latte</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC SECTION 1: FEATURED MENU ITEMS */}
      <section className="py-20 bg-stone-50/70 dark:bg-stone-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Hand-Selected Slices
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-stone-100">
                Featured Artisan Menu Items
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-xl">
                Browse our highest rated, fresh wood-fired pizzas certified by our local dough artisans and pizza connoisseurs.
              </p>
            </div>

            <Link
              href="/menu"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-400 hover:text-amber-600 transition-colors"
            >
              <span>Explore All Menu Items</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 rounded-2xl bg-stone-200 dark:bg-stone-800 animate-pulse"
                />
              ))}
            </div>
          ) : featuredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredItems.map((item) => (
                <PizzaCard key={item._id} item={item} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <Pizza className="w-12 h-12 text-stone-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold">No items found</h3>
              <p className="text-sm text-stone-500">Check back shortly as bakeries post new slices.</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. DYNAMIC SECTION 2: PIZZA CATEGORIES */}
      <section className="py-20 bg-white dark:bg-stone-900 border-y border-stone-200/80 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Hand-Stretched Variety
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-stone-100 mt-1">
              Explore by Pizza Category
            </h2>
            <p className="text-sm text-stone-500 mt-2">
              From historic Italian heritage styles to hearty meat assortments and crispy starters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  href={`/menu?category=${encodeURIComponent(cat.slug)}`}
                  className="group relative rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative aspect-16/9 w-full overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-red-600/90 flex items-center justify-center text-white backdrop-blur-xs">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-lg text-white">{cat.title}</h3>
                      </div>
                      <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-stone-900">
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. EXTRA SECTION 1: WHY CHOOSE PIZZAHUB? (Required) */}
      <section className="py-20 bg-stone-50/60 dark:bg-stone-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              The PizzaHub Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-stone-100 mt-1">
              Why Choose PizzaHub?
            </h2>
            <p className="text-sm text-stone-500 mt-2">
              We reject industrial conveyor-belt pizzas. Here is why pizza purists trust PizzaHub for their daily cravings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/70 text-red-600 flex items-center justify-center mb-4">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 mb-2">
                Wood-Fired Mastery
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Every partner pizzeria uses genuine refractory stone or wood-fired ovens running at 850°F+ for authentic blistered crusts.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 mb-2">
                Verified Local Bakeries
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                All restaurant vendors and menu additions are reviewed and approved by administrators before appearing on our marketplace.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 mb-2">
                Hot & Timely Delivery
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Choose your exact preferred delivery date and enjoy insulated thermal boxing that keeps pizzas piping hot and cheeses stretchy.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 mb-2">
                Premium Vendor Perks
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Top restaurants upgrade with Stripe to earn verified Gold badges and prominent placement across neighborhood menus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EXTRA SECTION 2: HOW PIZZAHUB WORKS & TESTIMONIALS */}
      <section className="py-20 bg-white dark:bg-stone-900 border-t border-stone-200/80 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-stone-100 mt-1">
              How PizzaHub Works
            </h2>
            <p className="text-sm text-stone-500 mt-2">
              From discovering your neighborhood bakery to opening your box in under half an hour.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mb-24">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-3xl bg-red-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-red-500/20 mb-6">
                1
              </div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 mb-2">
                Browse & Filter
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
                Explore local pizzerias, filter by your favorite style (Classic, Gourmet, Vegetarian), and sort by price.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-3xl bg-amber-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20 mb-6">
                2
              </div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 mb-2">
                Customize & Order
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
                Pick your delivery date, input special kitchen requests, and submit your order directly to the restaurant owner.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6">
                3
              </div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 mb-2">
                Track & Devour
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
                Watch the live order status timeline update from accepted to baking, then enjoy your fresh wood-fired pizza!
              </p>
            </div>
          </div>

          {/* Customer Testimonials Grid */}
          <div className="pt-12 border-t border-stone-200 dark:border-stone-800">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h3 className="text-2xl font-black text-stone-900 dark:text-stone-100">
                Loved by Pizza Devotees
              </h3>
              <p className="text-xs text-stone-500 mt-1">Real feedback from our happy foodies & bakers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 mb-3">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 italic leading-relaxed mb-6">
                      "{t.quote}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-stone-200/60 dark:border-stone-700/60">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {t.name}
                      </p>
                      <p className="text-[11px] text-stone-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION STRIP */}
      <section className="py-16 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready for your favorite slice of the day?
          </h2>
          <p className="text-sm sm:text-base text-red-100 max-w-xl mx-auto">
            Explore authentic dough and wood-fired crusts from your neighborhood's best certified bakeries.
          </p>
          <div className="pt-2">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-red-600 font-bold hover:bg-amber-50 shadow-xl transition-all"
            >
              <Pizza className="w-5 h-5" />
              <span>Browse Pizza Menu Now</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
