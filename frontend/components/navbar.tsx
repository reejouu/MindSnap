import React from "react";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { UserButton } from "@civic/auth/react";
import Link from "next/link";

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showSidebarToggle?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  showSidebarToggle = true,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const tabRoutes = [
    { tab: "Features", path: "#features" },
    { tab: "Dashboard", path: "/dashboard" },
    { tab: "Leaderboard", path: "/leaderboard" },
    { tab: "About us", path: "#about-us" }
  ];


  return (
    <div className="border-b border-primary/20 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          {showSidebarToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-text hover:bg-primary/10"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <Link href="/" className="focus:outline-none">
            <h1 className="text-2xl font-bold text-primary">MindSnap</h1>
          </Link>
        </div>
        <nav className="hidden md:flex space-x-1">
          {tabRoutes.map(({ tab, path }) => (
            <Button
              asChild
              key={tab}
              variant={pathname === path ? "default" : "ghost"}
              className={`capitalize ${
                pathname === path
                  ? "bg-primary text-background"
                  : "text-text hover:bg-primary/10"
              }`}
            >
              <Link href={path}>{tab}</Link>
            </Button>
          ))}
        </nav>
        <div className="flex items-center space-x-2">
          <UserButton/>
          <ConnectButton/>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
