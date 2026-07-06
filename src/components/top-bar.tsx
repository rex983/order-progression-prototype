import { ThemeToggle } from "@/components/theme-toggle";

export function TopBar() {
  return (
    <header className="h-14 border-b bg-background/80 backdrop-blur sticky top-0 z-30 flex items-center justify-between gap-4 px-6">
      <div className="text-sm font-semibold tracking-tight">
        Order Progression <span className="text-muted-foreground font-normal">· Building Success Team</span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="hidden sm:flex items-center gap-2 pl-3 ml-1 border-l">
          <div className="h-8 w-8 rounded-full bg-muted grid place-items-center text-xs font-semibold">
            J
          </div>
          <div className="text-xs leading-tight">
            <div className="font-medium">Jordan Pace</div>
            <div className="text-muted-foreground">BST</div>
          </div>
        </div>
      </div>
    </header>
  );
}
