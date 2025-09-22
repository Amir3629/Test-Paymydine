"use client"

import React, { Suspense } from "react"
import { useLanguageStore } from "@/store/language-store"
import { useCmsStore } from "@/store/cms-store"
import { Logo } from "@/components/logo"
import { Car, Utensils } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const MotionLink = motion(Link)

// FIXED: Create a component that uses client-side hooks
function HomePageContent() {
  const { t } = useLanguageStore()
  const { settings } = useCmsStore()

  // Debug logging for theme consistency
  if (typeof window !== 'undefined') {
    console.info("HOMEPAGE ACTIVE FILE ✅");
    console.log("data-theme:", document.documentElement.getAttribute('data-theme'));
    console.log("--theme-background:", getComputedStyle(document.documentElement).getPropertyValue('--theme-background'));
    console.log("body bg:", getComputedStyle(document.body).background);
  }

  const cardStyles = "relative flex flex-col items-center rounded-3xl p-8 sm:p-12 shadow-sm hover:shadow-xl transition duration-500 border w-72 h-56 justify-center surface-sub"
  const iconContainerStyles = "rounded-full p-6 mb-6"

  return (
        <div className="min-h-screen bg-theme-background flex flex-col items-center justify-center p-4">
      <Logo className="mb-8" />
      
      <div className="flex flex-row flex-wrap gap-6 justify-center">
        <MotionLink 
          href="/menu"
          className="relative group"
          whileHover="hover"
          initial="initial"
          animate="animate"
        >
          <motion.div
            className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-paydine-champagne/30 to-paydine-rose-beige/30 opacity-0 group-hover:opacity-100 blur transition duration-500"
            variants={{
              hover: { scale: 1.1 },
              initial: { scale: 0.9 }
            }}
          />
          <motion.div
            className={cardStyles}
            variants={{
              hover: { y: -8 },
              initial: { y: 0 }
            }}
          >
            <motion.div
              className={iconContainerStyles}
              style={{ backgroundColor: 'var(--theme-cart-bg, var(--theme-input))' }}
              variants={{
                hover: { 
                  scale: 1.1,
                  backgroundColor: "var(--theme-cart-bg, var(--theme-input))",
                },
                initial: { 
                  scale: 1,
                  backgroundColor: "var(--theme-cart-bg, var(--theme-input))",
                }
              }}
            >
              <Utensils className="w-10 h-10" style={{ color: 'var(--theme-text-primary)' }} />
            </motion.div>
            <h2 className="text-2xl font-medium" style={{ color: 'var(--theme-text-primary)' }}>{t("menuCard")}</h2>
          </motion.div>
        </MotionLink>

        <MotionLink 
          href="/valet"
          className="relative group"
          whileHover="hover"
          initial="initial"
          animate="animate"
        >
          <motion.div
            className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-paydine-champagne/30 to-paydine-rose-beige/30 opacity-0 group-hover:opacity-100 blur transition duration-500"
            variants={{
              hover: { scale: 1.1 },
              initial: { scale: 0.9 }
            }}
          />
          <motion.div
            className={cardStyles}
            variants={{
              hover: { y: -8 },
              initial: { y: 0 }
            }}
          >
            <motion.div
              className={iconContainerStyles}
              style={{ backgroundColor: 'var(--theme-cart-bg, var(--theme-input))' }}
              variants={{
                hover: { 
                  scale: 1.1,
                  backgroundColor: "var(--theme-cart-bg, var(--theme-input))",
                },
                initial: { 
                  scale: 1,
                  backgroundColor: "var(--theme-cart-bg, var(--theme-input))",
                }
              }}
            >
              <Car className="w-10 h-10" style={{ color: 'var(--theme-text-primary)' }} />
            </motion.div>
            <h2 className="text-2xl font-medium" style={{ color: 'var(--theme-text-primary)' }}>{t("valetParking")}</h2>
          </motion.div>
        </MotionLink>
      </div>
    </div>
  )
}

// FIXED: Main component with Suspense wrapper
export default function HomePage() {
  return (
    <div className="page--home">
      <Suspense fallback={
        <div className="min-h-screen bg-theme-background flex flex-col items-center justify-center p-4">
          <div className="text-center">
            <div className="text-lg" style={{ color: 'var(--theme-text-primary)' }}>Loading...</div>
          </div>
        </div>
      }>
        <HomePageContent />
      </Suspense>
    </div>
  )
}