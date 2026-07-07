import { Card, Text } from '@/shared/components/ui';
import { formatCurrency } from '@/shared/lib/formatCurrency';

export interface BillingHistoryEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
}

interface BillingHistoryProps {
  entries: BillingHistoryEntry[];
}

export function BillingHistory({ entries }: BillingHistoryProps) {
  return (
    <Card className="flex flex-col gap-4">
      <Text variant="label">Billing History</Text>

      {entries.length === 0 ? (
        <Text variant="body-sm" className="text-muted">
          No billing history yet.
        </Text>
      ) : (
        <ul className="divide-border-subtle flex flex-col divide-y">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between py-3">
              <div className="flex flex-col gap-0.5">
                <Text variant="body-sm">{entry.date}</Text>
                <Text variant="caption">{entry.description}</Text>
              </div>
              <Text variant="body-sm" className="font-semibold">
                {formatCurrency(entry.amount)}
              </Text>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
