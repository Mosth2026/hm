
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface Balloon {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  popped: boolean;
}

const BALLOON_COLORS = [
  'linear-gradient(135deg, #FFD700 0%, #FDB931 50%, #9E7E38 100%)', // Gold
  'linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 50%, #757575 100%)', // Silver
  'linear-gradient(135deg, #FF4D4D 0%, #CC0000 50%, #800000 100%)', // Metallic Red
  'linear-gradient(135deg, #4D94FF 0%, #0066FF 50%, #003D99 100%)', // Metallic Blue
  'linear-gradient(135deg, #FF66CC 0%, #CC3399 50%, #990066 100%)', // Metallic Purple
  'linear-gradient(135deg, #50C878 0%, #2E8B57 50%, #006400 100%)', // Emerald Green
];

const FestiveBalloons = () => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);

  useEffect(() => {
    // Create initial balloons
    const initialBalloons = Array.from({ length: 15 }).map((_, i) => createBalloon(i));
    setBalloons(initialBalloons);

    // Continuous spawning
    const interval = setInterval(() => {
      setBalloons(prev => {
        // Limit total balloons to 25
        if (prev.length >= 25) {
          // Replace one that's finished its animation
          const oldest = prev[0];
          return [...prev.slice(1), createBalloon(Date.now())];
        }
        return [...prev, createBalloon(Date.now())];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const createBalloon = (id: number): Balloon => ({
    id,
    x: Math.random() * 90 + 5, // 5% to 95%
    delay: Math.random() * 5,
    duration: 15 + Math.random() * 10, // 15s to 25s
    size: 40 + Math.random() * 40, // 40px to 80px
    color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
    popped: false
  });

  const popBalloon = (id: number) => {
    setBalloons(prev => prev.map(b => b.id === id ? { ...b, popped: true } : b));
    
    // Cleanup popped balloon after animation
    setTimeout(() => {
      setBalloons(prev => prev.filter(b => b.id !== id));
    }, 500);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden select-none">
      {balloons.map((balloon) => (
        <div
          key={balloon.id}
          onClick={(e) => {
            e.stopPropagation();
            popBalloon(balloon.id);
          }}
          className={cn(
            "absolute top-[-100px] pointer-events-auto cursor-pointer transition-all duration-300",
            balloon.popped ? "scale-150 opacity-0 bg-white" : "animate-fall"
          )}
          style={{
            left: `${balloon.x}%`,
            width: `${balloon.size}px`,
            height: `${balloon.size * 1.2}px`,
            background: balloon.color,
            borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
            boxShadow: 'inset -5px -5px 15px rgba(0,0,0,0.3), inset 5px 5px 15px rgba(255,255,255,0.4)',
            animation: !balloon.popped 
              ? `fall ${balloon.duration}s linear ${balloon.delay}s infinite, sway 4s ease-in-out infinite alternate`
              : 'none',
          }}
        >
          {/* Reflection */}
          <div 
            className="absolute top-[10%] left-[15%] w-[30%] h-[20%] bg-white/40 blur-[2px] rounded-full transform rotate-[-20deg]"
          />
          
          {/* Balloon Basket/Knot */}
          <div 
            className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-[10px] h-[8px]"
            style={{ 
              background: 'inherit',
              clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
            }}
          />
          
          {/* String */}
          <div 
            className="absolute top-full left-1/2 -translate-x-1/2 w-[1px] h-[60px] bg-white/20 origin-top animate-string-sway"
          />

          {/* Pop Effect */}
          {balloon.popped && (
            <div className="absolute inset-[-20px] bg-white/50 blur-xl rounded-full animate-ping" />
          )}

          <style>{`
            @keyframes fall {
              from { transform: translateY(-100px); }
              to { transform: translateY(120vh); }
            }
            @keyframes sway {
              from { margin-left: -20px; }
              to { margin-left: 20px; }
            }
            @keyframes string-sway {
              0% { transform: rotate(-5deg); }
              100% { transform: rotate(5deg); }
            }
          `}</style>
        </div>
      ))}
    </div>
  );
};

export default FestiveBalloons;
