import { Menu, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ESTClock from "./ESTClock";
import { logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default function Navbar({ setOpen }: { setOpen: (v: boolean) => void }) {
  const { employee } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden rounded-md p-2 hover:bg-muted"
          onClick={() => setOpen(true)}
        >
          <Menu size={20} />
        </button>

        <span className="hidden lg:block text-sm font-semibold tracking-wide">
          HRMS Dashboard
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <ESTClock />

        <div className="hidden sm:block text-sm text-muted-foreground">
          {employee?.name}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400"
          onClick={logout}
        >
          <LogOut size={16} className="mr-1" />
          Logout
        </Button>
      </div>
    </header>
  );
}
