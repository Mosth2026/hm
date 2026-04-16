import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingBag, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileBottomNav = () => {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    {
      label: "المشتريات",
      icon: ShoppingBag,
      path: "/my-orders",
    },
    {
      label: "السلة",
      icon: ShoppingCart,
      path: "/cart",
    },
    {
      label: "البحث",
      icon: Search,
      path: "/search",
    },
    {
      label: "الرئيسية",
      icon: Home,
      path: "/",
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-primary/10 px-4 py-3 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = path === item.path;

          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-300",
                isActive ? "text-secondary scale-110" : "text-muted-foreground hover:text-primary"
              )}
            >
              <div className={cn(
                "p-2 rounded-2xl transition-all duration-300",
                isActive && "bg-secondary/10 shadow-sm shadow-secondary/20"
              )}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-black">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
