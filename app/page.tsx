'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function Home() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[90vh] overflow-hidden bg-black">
        {/* Background Image with Parallax */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <Image
            src="/Undefeated.webp"
            alt="Basketball court background"
            fill
            className="object-cover blur-sm"
            priority
          />
        </div>

        {/* Main Content */}
        <div className="relative h-full flex flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-4xl"
          >
            <Image
              src="/Undefeated.webp"
              alt="Undefeated Basketball League"
              width={600}
              height={600}
              className="mx-auto mb-8"
              priority
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Welcome to <span className="text-orange-500">Undefeated</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-2xl mx-auto">
              Join weekly basketball sessions, compete with randomized teams, and climb the leaderboard!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="bg-orange-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors transform hover:scale-105 duration-200 inline-block"
              >
                Register Now
              </Link>
              <Link 
                href="/leaderboard" 
                className="bg-teal-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-teal-600 transition-colors transform hover:scale-105 duration-200 inline-block"
              >
                View Leaderboard
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      {/* Content Section */}
      <div className="bg-black text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800">
              <h3 className="text-2xl font-bold mb-4 text-orange-500">Weekly Sessions</h3>
              <p className="text-gray-300">Join exciting basketball sessions with balanced team matchups every week.</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800">
              <h3 className="text-2xl font-bold mb-4 text-teal-500">Fair Teams</h3>
              <p className="text-gray-300">Experience balanced gameplay with our smart team allocation system.</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800">
              <h3 className="text-2xl font-bold mb-4 text-orange-500">Track Progress</h3>
              <p className="text-gray-300">Monitor your performance and climb the ranks on our leaderboard.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

