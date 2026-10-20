import { db } from '@/db';
import { equipment } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function EquipmentPage() {
  const items = await db.select().from(equipment).orderBy(desc(equipment.createdAt));

  return (
    <main className="ui-page ui-page-padded">
      <div className="ui-shell space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="ui-eyebrow">Production inventory</p>
            <h1 className="ui-page-title">Equipment Inventory</h1>
            <p className="ui-body">Manage rental equipment and pricing.</p>
          </div>
          <Button type="button">Add Equipment</Button>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Equipment inventory">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>
                  {[item.brand, item.category].filter(Boolean).join(' • ') || 'Uncategorised equipment'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.specs && <p className="text-sm text-muted-foreground">{item.specs}</p>}
                <div className="flex items-end justify-between border-t pt-4">
                  <span className="text-sm text-muted-foreground">Per day</span>
                  <span className="text-lg font-semibold tabular-nums">KES {item.dailyRate.toLocaleString('en-KE')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && <p className="text-sm text-muted-foreground">No equipment has been added yet.</p>}
        </section>
      </div>
    </main>
  );
}
