'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarIcon, FileTextIcon, Loader2Icon } from 'lucide-react';
import Link from 'next/link';
import { fetchContractStats } from '@/lib/api/contracts';

export default function ContractsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['contract-stats'],
    queryFn: fetchContractStats,
  });

  const statItems = [
    { label: 'Total Contracts', value: stats?.totalContracts },
    { label: 'Drafts', value: stats?.drafts },
    { label: 'Sent', value: stats?.sent },
    { label: 'Viewed', value: stats?.viewed },
    { label: 'Awaiting Signature', value: stats?.awaitingSignature },
    { label: 'Signed', value: stats?.signed },
    { label: 'Expired', value: stats?.expired },
  ];

  return (
    <div className="ui-page">
      <div className="ui-page-header">
        <div>
          <h1 className="ui-page-title">Contracts</h1>
          <p className="ui-page-subtitle">
            Create, send and manage agreements with your clients.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/contracts/templates"
                className="ui-button ui-button-secondary">
            Browse Templates
          </Link>
          <Link href="/admin/contracts/new"
                className="ui-button ui-button-primary">
            New Contract
          </Link>
        </div>
      </div>

      <div className="ui-section">
        <div className="ui-section-header">
          <h2 className="ui-section-title">Contract Dashboard</h2>
        </div>
        <div className="ui-stat-grid">
          {statItems.map((item) => (
            <div key={item.label} className="ui-stat-card">
              <div className="ui-stat-header">
                <h3 className="ui-stat-title">{item.label}</h3>
              </div>
              <div className="ui-stat-content">
                {isLoading ? (
                  <Loader2Icon className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="ui-stat-value">{item.value || 0}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contract List Table */}
      <div className="ui-section">
        <div className="ui-section-header">
          <h2 className="ui-section-title">Recent Contracts</h2>
        </div>
        <div className="ui-table-responsive">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Contract</th>
                <th>Client</th>
                <th>Project</th>
                <th>Status</th>
                <th>Created</th>
                <th>Sent</th>
                <th>Signed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Placeholder for data rows */}
              {[...Array(5)].map((_, index) => (
                <tr key={index}>
                  <td>Contract {index + 1}</td>
                  <td>Client {index + 1}</td>
                  <td>Project {index + 1}</td>
                  <td><span className="ui-badge">Draft</span></td>
                  <td>2026-09-02</td>
                  <td>-</td>
                  <td>-</td>
                  <td>
                    <div className="ui-button-group">
                      <Link href="#"
                            className="ui-button ui-button-small">
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
