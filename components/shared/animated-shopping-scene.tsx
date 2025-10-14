'use client'

import { useEffect, useState } from 'react'

export default function AnimatedShoppingScene() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-gradient-to-br from-[#2c3e50] via-[#34495e] to-[#2c3e50] mb-16">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24%,rgba(255,255,255,.05)_25%,rgba(255,255,255,.05)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.05)_75%,rgba(255,255,255,.05)_76%,transparent_77%,transparent)] bg-[length:50px_50px]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(255,255,255,.05)_25%,rgba(255,255,255,.05)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.05)_75%,rgba(255,255,255,.05)_76%,transparent_77%,transparent)] bg-[length:50px_50px]" />
      </div>

      {/* Floating shopping items */}
      <div className="absolute inset-0">
        {/* Person 1 - Left side with shopping bag */}
        <div className="absolute left-[10%] top-[20%] animate-float-slow">
          <div className="relative">
            {/* Person silhouette */}
            <div className="w-16 h-24 md:w-20 md:h-32 bg-gradient-to-b from-[#0066ff]/80 to-[#0066ff]/40 rounded-full relative">
              {/* Head */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 md:w-10 md:h-10 bg-[#0066ff]/80 rounded-full border-2 border-white/30" />
              {/* Shopping bag */}
              <div className="absolute -right-6 top-8 w-8 h-10 md:w-10 md:h-12 bg-[#00d4aa]/80 rounded-sm border-2 border-white/30">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-3 border-2 border-white/30 rounded-t-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Person 2 - Right side with clothing */}
        <div className="absolute right-[15%] top-[30%] animate-float-medium">
          <div className="relative">
            {/* Person silhouette */}
            <div className="w-16 h-24 md:w-20 md:h-32 bg-gradient-to-b from-[#00d4aa]/80 to-[#00d4aa]/40 rounded-full relative">
              {/* Head */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 md:w-10 md:h-10 bg-[#00d4aa]/80 rounded-full border-2 border-white/30" />
              {/* Clothing item */}
              <div className="absolute -left-6 top-6 w-12 h-8 md:w-14 md:h-10 bg-[#0066ff]/80 rounded-lg border-2 border-white/30 rotate-12">
                <div className="absolute inset-2 border border-white/20 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Person 3 - Center with cart */}
        <div className="absolute left-[45%] top-[50%] animate-float-fast">
          <div className="relative">
            {/* Person silhouette */}
            <div className="w-14 h-20 md:w-18 md:h-28 bg-gradient-to-b from-purple-500/80 to-purple-500/40 rounded-full relative">
              {/* Head */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 md:w-9 md:h-9 bg-purple-500/80 rounded-full border-2 border-white/30" />
              {/* Shopping cart */}
              <div className="absolute -right-8 top-4 w-10 h-8 md:w-12 md:h-10">
                <div className="w-full h-full bg-[#0066ff]/80 rounded border-2 border-white/30 relative">
                  <div className="absolute -top-2 right-0 w-2 h-4 bg-[#0066ff]/80 border-2 border-white/30" />
                  <div className="absolute -bottom-2 left-1 w-2 h-2 bg-white/80 rounded-full" />
                  <div className="absolute -bottom-2 right-1 w-2 h-2 bg-white/80 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating clothing items */}
        <div className="absolute left-[25%] top-[15%] animate-spin-slow">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#0066ff]/60 to-[#0066ff]/30 rounded-lg border-2 border-white/30 rotate-12">
            {/* T-shirt icon */}
            <div className="absolute inset-2 border-2 border-white/40 rounded flex items-center justify-center">
              <div className="text-white/80 text-xl">👕</div>
            </div>
          </div>
        </div>

        <div className="absolute right-[30%] top-[60%] animate-bounce-slow">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-[#00d4aa]/60 to-[#00d4aa]/30 rounded-lg border-2 border-white/30 -rotate-12">
            {/* Pants icon */}
            <div className="absolute inset-2 border-2 border-white/40 rounded flex items-center justify-center">
              <div className="text-white/80 text-lg">👖</div>
            </div>
          </div>
        </div>

        <div className="absolute left-[60%] top-[25%] animate-float-medium delay-1000">
          <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-purple-500/60 to-purple-500/30 rounded-full border-2 border-white/30">
            {/* Shoe icon */}
            <div className="absolute inset-1 flex items-center justify-center">
              <div className="text-white/80 text-sm">👟</div>
            </div>
          </div>
        </div>

        {/* Price tags floating */}
        <div className="absolute left-[20%] bottom-[20%] animate-swing">
          <div className="px-3 py-1 md:px-4 md:py-2 bg-[#0066ff]/80 rounded-full border-2 border-white/30 text-white text-xs md:text-sm font-bold shadow-lg">
            50% OFF
          </div>
        </div>

        <div className="absolute right-[20%] bottom-[35%] animate-swing delay-500">
          <div className="px-3 py-1 md:px-4 md:py-2 bg-[#00d4aa]/80 rounded-full border-2 border-white/30 text-white text-xs md:text-sm font-bold shadow-lg">
            NEW
          </div>
        </div>

        <div className="absolute left-[50%] bottom-[15%] animate-swing delay-1000">
          <div className="px-3 py-1 md:px-4 md:py-2 bg-purple-500/80 rounded-full border-2 border-white/30 text-white text-xs md:text-sm font-bold shadow-lg">
            SALE
          </div>
        </div>
      </div>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/80 via-transparent to-[#2c3e50]/60 pointer-events-none" />

      {/* Text content overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
            Live Shopping Experience
          </h2>
          <p className="text-lg md:text-xl text-white/90 drop-shadow-md max-w-2xl">
            Discover amazing deals on fashion and lifestyle products
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-40px) translateX(-10px); }
          75% { transform: translateY(-20px) translateX(10px); }
        }

        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-15px) translateX(-15px); }
          50% { transform: translateY(-30px) translateX(15px); }
          75% { transform: translateY(-15px) translateX(-15px); }
        }

        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-25px) translateX(15px); }
          66% { transform: translateY(-50px) translateX(-15px); }
        }

        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.1); }
        }

        @keyframes swing {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }

        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }

        .animate-float-medium {
          animation: float-medium 6s ease-in-out infinite;
        }

        .animate-float-fast {
          animation: float-fast 5s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }

        .animate-swing {
          animation: swing 3s ease-in-out infinite;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-float-slow,
          .animate-float-medium,
          .animate-float-fast,
          .animate-spin-slow,
          .animate-bounce-slow,
          .animate-swing {
            animation: none;
          }
        }
      `}</style>
    </section>
  )
}
