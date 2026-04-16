
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants";

const AppSplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [stage, setStage] = useState(0); // 0: Init, 1: Opening Wrapper, 2: Logo Reveal, 3: Exit

  useEffect(() => {
    // Stage 1: Wrapper opening shortly after start
    const t1 = setTimeout(() => setStage(1), 500);
    // Stage 2: Logo reveal
    const t2 = setTimeout(() => setStage(2), 1500);
    // Stage 3: Transition out
    const t3 = setTimeout(() => setStage(3), 3500);
    // Final callback to parent
    const t4 = setTimeout(() => onFinish(), 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish]);

  if (stage === 4) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[9999] bg-[#000000] flex flex-col items-center justify-center transition-all duration-1000",
        stage === 3 ? "opacity-0 scale-110 pointer-events-none" : "opacity-100"
      )}
    >
      <div className="relative w-full max-w-sm flex flex-col items-center">
        {/* Animated Wrapper Container */}
        <div className="relative h-64 w-64 md:h-80 md:w-80 overflow-hidden flex items-center justify-center">
          
          {/* THE PRODUCT (The Reveal) */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-[2000ms] ease-out-expo",
            stage >= 2 ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 rotate-12 blur-xl"
          )}>
            <img 
              src="/assets/logo.png" 
              alt={SITE_CONFIG.name} 
              className="h-full w-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]"
            />
          </div>

          {/* THE WRAPPER (Visual Effect) */}
          {/* Left Wrapper Half */}
          <div 
            className={cn(
              "absolute top-0 left-0 w-1/2 h-full bg-[#f31b3e] transition-transform duration-[1500ms] ease-in-out z-20",
              stage >= 1 ? "-translate-x-full -rotate-12" : "translate-x-0"
            )}
            style={{ borderRadius: '2rem 0 0 2rem', boxShadow: '10px 0 30px rgba(0,0,0,0.5)' }}
          />
          {/* Right Wrapper Half */}
          <div 
            className={cn(
              "absolute top-0 right-0 w-1/2 h-full bg-[#f31b3e] transition-transform duration-[1500ms] ease-in-out z-20",
              stage >= 1 ? "translate-x-full rotate-12" : "translate-x-0"
            )}
             style={{ borderRadius: '0 2rem 2rem 0', boxShadow: '-10px 0 30px rgba(0,0,0,0.5)' }}
          />
          
          {/* Gold Foil/Sparkle Effect */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent z-30 transition-opacity duration-1000",
            stage === 1 ? "opacity-100 translate-x-full" : "opacity-0 -translate-x-full"
          )} 
            style={{ transitionProperty: 'opacity, transform' }}
          />
        </div>

        {/* Logo Text Animation (Bottom-up) */}
        <div className="mt-8 space-y-4 text-center overflow-hidden">
          <div className={cn(
            "flex flex-col items-center transition-all duration-[1000ms] delay-1000",
            stage >= 2 ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
          )}>
            <div className="h-[2px] w-12 bg-secondary mb-4 rounded-full" />
            <span className="text-white text-3xl md:text-5xl font-black italic tracking-tighter">
               {SITE_CONFIG.name.slice(0, 3)}<span className="text-[#f31b3e]">{SITE_CONFIG.name.slice(3, 4)}</span>{SITE_CONFIG.name.slice(4)}
            </span>
            <div className="flex items-center gap-3 mt-4">
              <span className="h-px w-8 bg-white/20" />
              <span className="text-white/40 text-[10px] md:text-xs font-black uppercase tracking-[0.4em]">
                {SITE_CONFIG.englishName}
              </span>
              <span className="h-px w-8 bg-white/20" />
            </div>
          </div>
        </div>

        {/* Loading Bar at Bottom */}
        <div className="absolute bottom-[-10vh] left-1/2 -translate-x-1/2 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full bg-secondary transition-all duration-[4000ms] ease-linear",
              stage === 0 ? "w-0" : "w-full"
            )} 
          />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes expo-out {
          0% { transform: scale(0.5); opacity: 0; filter: blur(20px); }
          100% { transform: scale(1); opacity: 1; filter: blur(0); }
        }
        .ease-out-expo {
          transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
        }
      `}} />
    </div>
  );
};

export default AppSplashScreen;
