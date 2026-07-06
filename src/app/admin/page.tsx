import { ResetButton } from "@/components/reset-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Prototype utilities. Not part of the production system.
        </p>
      </div>
      <Card className="bg-card/40">
        <CardHeader>
          <CardTitle className="text-sm">Reset state</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Wipe all stage progress, checklists, notes, and email logs — re-seed the store back to the initial demo orders. Useful before showing this to a new stakeholder.
          </p>
          <ResetButton />
        </CardContent>
      </Card>
    </div>
  );
}
