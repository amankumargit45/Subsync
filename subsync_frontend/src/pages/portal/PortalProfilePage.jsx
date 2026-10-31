import { useState } from 'react';
import { Building2, Save } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export function PortalProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || 'Vikram Patel');
  const [company, setCompany] = useState(user?.company || 'ABC Technologies Pvt Ltd');
  const [phone, setPhone] = useState('+91 98765 43212');
  const [address, setAddress] = useState('123 MG Road, Bangalore, Karnataka 560001');
  const [gstNumber, setGstNumber] = useState('29AABCT1234A1ZV');
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      updateUser({ name, company });
      toast.success('Company profile updated successfully');
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
          Client Profile & Billing Address
        </h1>
        <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
          Update your business registration details appearing on legal GST invoices.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 border-b border-surface-100 dark:border-surface-800 pb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary-600" /> Company Registration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Authorized Representative"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Registered Company Legal Name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Billing Email"
              value={user?.email || 'vikram@abctech.in'}
              disabled
              hint="Account identifier (read-only)"
            />
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Input
            label="GSTIN / Corporate Tax ID"
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value)}
          />

          <Textarea
            label="Official Billing Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="sm" loading={saving}>
            <Save className="h-4 w-4" /> Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
