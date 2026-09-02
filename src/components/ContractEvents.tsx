'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { fetchContractEvents } from '@/lib/api/contracts';

type ContractEventsProps = {
  contractId: string;
};

export default function ContractEvents({ contractId }: ContractEventsProps) {
  const { data: events, isLoading } = useQuery({
    queryKey: ['contract-events', contractId],
    queryFn: () => fetchContractEvents(contractId),
    enabled: !!contractId,
  });

  if (isLoading) {
    return <Loader2Icon className="h-4 w-4 animate-spin" />;
  }

  return (
    <div className="ui-contract-events">
      <h3>Activity</h3>
      <ul className="ui-event-list">
        {events?.map((event) => (
          <li key={event.id} className="ui-event-item">
            <span className="ui-event-type">{event.eventType}</span>
            <span className="ui-event-time">
              {new Date(event.createdAt).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
