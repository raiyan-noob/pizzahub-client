"use client";

import React from "react";
import Link from "next/link";
import { Pizza, MapPin, Phone, Mail, Heart } from "lucide-react";

// Modern X Logo SVG (per PDF requirement: "Use the new X logo instead of the old Twitter bird")
function XLogo({ className = "w-4 h-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="w-full bg-stone-900 text-stone-300 border-t border-stone-800 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/20">
                <Pizza className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Pizza<span className="text-amber-500">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed">
              Your premier pizza ordering & delivery marketplace. Connecting food lovers with artisan pizzerias, wood-fired specialists, and gourmet dough masters in every neighborhood.
            </p>
            {/* Social Links with new X logo */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (formerly Twitter)"
                className="w-9 h-9 rounded-full bg-stone-800 hover:bg-red-600 flex items-center justify-center text-stone-300 hover:text-white transition-colors"
              >
                <XLogo className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-stone-800 hover:bg-red-600 flex items-center justify-center text-stone-300 hover:text-white transition-colors text-sm font-bold"
              >
                f
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-stone-800 hover:bg-red-600 flex items-center justify-center text-stone-300 hover:text-white transition-colors text-sm font-bold"
              >
                in
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Explore PizzaHub
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-amber-400 transition-colors">
                  Browse Pizza Menu
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-amber-400 transition-colors">
                  Become a Partner Restaurant
                </Link>
              </li>
              <li>
                <Link href="/signin" className="hover:text-amber-400 transition-colors">
                  Customer Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Pizza Categories */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Pizza Categories
            </h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link href="/menu?category=Classic+Pizzas" className="hover:text-amber-400 transition-colors">
                  Classic Pizzas
                </Link>
              </li>
              <li>
                <Link href="/menu?category=Vegetarian+Pizzas" className="hover:text-amber-400 transition-colors">
                  Vegetarian Pizzas
                </Link>
              </li>
              <li>
                <Link href="/menu?category=Meat+Lovers" className="hover:text-amber-400 transition-colors">
                  Meat Lovers
                </Link>
              </li>
              <li>
                <Link href="/menu?category=Specialty+/+Gourmet+Pizzas" className="hover:text-amber-400 transition-colors">
                  Specialty & Gourmet Pizzas
                </Link>
              </li>
              <li>
                <Link href="/menu?category=Sides+&+Appetizers" className="hover:text-amber-400 transition-colors">
                  Sides & Appetizers
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Information */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Contact & Support
            </h3>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>842 Margherita Boulevard, Little Italy, Pizza City 90210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-5 h-5 text-amber-500 shrink-0" />
                <span>+1 (800) 749-9248 (PIZZAHUB)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-amber-500 shrink-0" />
                <span>support@pizzahub.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="border-t border-stone-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} PizzaHub Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for pizza lovers worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
