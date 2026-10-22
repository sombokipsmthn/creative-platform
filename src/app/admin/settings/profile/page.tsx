import { redirect } from 'next/navigation';

export default function AdminProfileSettingsRedirect() {
  redirect('/admin/settings?tab=account-profile');
}
