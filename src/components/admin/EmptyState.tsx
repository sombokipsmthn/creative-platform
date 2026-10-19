'use client';
import { ReactNode } from 'react';
interface Props { icon?: ReactNode; title: string; description: string; action?: ReactNode; filtered?: boolean }
export default function EmptyState({ icon, title, description, action, filtered }: Props) { return <div className="admin-empty-state" role="status">{icon && <div className="admin-empty-state__icon" aria-hidden="true">{icon}</div>}<h2>{title}</h2><p>{description}</p>{filtered && <p className="admin-empty-state__hint">Try changing your search or filters.</p>}{action && <div>{action}</div>}</div>; }
