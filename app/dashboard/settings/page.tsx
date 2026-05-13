'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { copyToClipboard } from '@/lib/utils';
import { cachedFetch, invalidateCache } from '@/lib/fetchCache';

export default function SettingsPage() {
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [, setIsLoadingKey] = useState(true);
  const [isRotatingKey, setIsRotatingKey] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiKeyLast4, setApiKeyLast4] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');
  const [apiKeyMessage, setApiKeyMessage] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [prefError, setPrefError] = useState('');
  const [prefMessage, setPrefMessage] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [productUpdates, setProductUpdates] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      setIsLoadingProfile(true);
      setError('');

      try {
        const data = await cachedFetch<{ email?: string; name?: string }>('/api/user');
        if (isActive) {
          setEmail(data.email || '');
          setFullName(data.name || '');
        }
      } catch {
        if (isActive) {
          setError('Failed to load profile');
        }
      } finally {
        if (isActive) {
          setIsLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadPreferences = async () => {
      setIsLoadingPreferences(true);
      setPrefError('');

      try {
        const data = await cachedFetch<{ email_notifications?: boolean; product_updates?: boolean }>(
          '/api/preferences'
        );
        if (isActive) {
          setEmailNotifications(Boolean(data.email_notifications));
          setProductUpdates(Boolean(data.product_updates));
        }
      } catch {
        if (isActive) {
          setPrefError('Failed to load preferences');
        }
      } finally {
        if (isActive) {
          setIsLoadingPreferences(false);
        }
      }
    };

    loadPreferences();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadApiKey = async () => {
      setIsLoadingKey(true);
      setApiKeyError('');

      try {
        const data = await cachedFetch<{ keys?: Array<{ last4?: string }> }>('/api/api-keys');
        if (isActive) {
          // Get the first key (default key)
          if (data.keys && data.keys.length > 0) {
            setApiKeyLast4(data.keys[0].last4 || '');
          }
        }
      } catch {
        if (isActive) {
          setApiKeyError('Failed to load API key');
        }
      } finally {
        if (isActive) {
          setIsLoadingKey(false);
        }
      }
    };

    loadApiKey();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to update profile');
        return;
      }

      const data = await res.json();
      setFullName(data.name || '');
      invalidateCache('/api/user');
      setSuccessMessage('Profile updated');
    } catch {
      setError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyKey = async () => {
    if (!apiKey) {
      setApiKeyError('Regenerate your API key to copy it.');
      return;
    }

    if (await copyToClipboard(apiKey)) {
      setApiKeyMessage('API key copied');
      setTimeout(() => setApiKeyMessage(''), 2000);
    }
  };

  const handleRotateKey = async () => {
    setIsRotatingKey(true);
    setApiKeyError('');
    setApiKeyMessage('');

    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Default API Key' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setApiKeyError(data.error || 'Failed to create API key');
        return;
      }

      const data = await res.json();
      setApiKey(data.key || '');
      setApiKeyLast4(data.last4 || '');
      setApiKeyVisible(true);
      invalidateCache('/api/api-keys');
      setApiKeyMessage('New API key generated');
    } catch {
      setApiKeyError('Failed to create API key');
    } finally {
      setIsRotatingKey(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setApiKeyMessage('');
    setApiKeyError('');

    try {
      const res = await fetch('/api/export?format=json');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setApiKeyError(data.error || 'Failed to export data');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `linkshrink-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      setApiKeyError('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    setDeleteError('');

    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || 'Failed to delete account');
        return;
      }

      await signOut({ callbackUrl: '/' });
    } catch {
      setDeleteError('Failed to delete account');
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSavingPreferences(true);
    setPrefError('');
    setPrefMessage('');

    try {
      const res = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_notifications: emailNotifications,
          product_updates: productUpdates,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPrefError(data.error || 'Failed to save preferences');
        return;
      }

      invalidateCache('/api/preferences');
      setPrefMessage('Preferences saved');
    } catch {
      setPrefError('Failed to save preferences');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const maskedKey = apiKeyLast4 ? `sk_live_****${apiKeyLast4}` : 'No API key yet';

  return (
    <div className="flex items-center justify-center px-4 py-8">
      <div className="space-y-6 max-w-2xl w-full">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-gradient-to-b from-surface-container to-transparent pb-4 -mx-4 px-4 lg:-mx-10 lg:px-10 py-4 text-center">
          <h1 className="text-h1 font-bold text-on-surface">Settings</h1>
          <p className="text-body-md text-on-surface-variant">Manage your account preferences</p>
        </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            disabled
          />
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            disabled={isLoadingProfile}
          />
          {error && <p className="text-sm text-error">{error}</p>}
          {successMessage && <p className="text-sm text-secondary">{successMessage}</p>}
          <Button
            variant="primary"
            isLoading={isSaving}
            onClick={handleSave}
            disabled={isLoadingProfile}
          >
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* API Settings */}
      <Card>
        <CardHeader>
          <CardTitle>API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-on-surface-variant">Use your API key to programmatically create and manage shortened links.</p>
          <div className="flex gap-2">
            <input
              type={apiKeyVisible ? 'text' : 'password'}
              readOnly
              value={apiKey || maskedKey}
              className="flex-1 px-4 py-2 bg-surface-container border border-outline rounded-lg text-on-surface"
            />
            <Button
              variant="outline"
              onClick={() => setApiKeyVisible(!apiKeyVisible)}
              disabled={!apiKey}
            >
              <span className="material-symbols-outlined">visibility</span>
              {apiKeyVisible ? 'Hide' : 'Show'}
            </Button>
            <Button variant="outline" onClick={handleCopyKey} disabled={!apiKey}>
              <span className="material-symbols-outlined">content_copy</span>
              Copy
            </Button>
          </div>
          {apiKeyError && <p className="text-sm text-error">{apiKeyError}</p>}
          {apiKeyMessage && <p className="text-sm text-secondary">{apiKeyMessage}</p>}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRotateKey}
            isLoading={isRotatingKey}
            disabled={isRotatingKey}
          >
            <span className="material-symbols-outlined">refresh</span>
            Regenerate Key
          </Button>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-on-surface">Data Export</p>
              <p className="text-sm text-on-surface-variant">Download all your links and analytics data</p>
            </div>
            <Button variant="outline" onClick={handleExport} isLoading={isExporting}>
              <span className="material-symbols-outlined">download</span>
              Export
            </Button>
          </div>
          <div className="border-t border-outline pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-on-surface text-error">Delete Account</p>
                <p className="text-sm text-on-surface-variant">Permanently delete your account and all associated data</p>
              </div>
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
                isLoading={isDeletingAccount}
              >
                <span className="material-symbols-outlined">delete</span>
                Delete
              </Button>
            </div>
            {deleteError && <p className="text-sm text-error mt-3">{deleteError}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Checkbox
            label="Send me email notifications about activity"
            checked={emailNotifications}
            onChange={(event) => setEmailNotifications(event.target.checked)}
            disabled={isLoadingPreferences}
          />
          <Checkbox
            label="Include me in product updates and feature announcements"
            checked={productUpdates}
            onChange={(event) => setProductUpdates(event.target.checked)}
            disabled={isLoadingPreferences}
          />
          {prefError && <p className="text-sm text-error">{prefError}</p>}
          {prefMessage && <p className="text-sm text-secondary">{prefMessage}</p>}
          <Button
            variant="outline"
            onClick={handleSavePreferences}
            isLoading={isSavingPreferences}
            disabled={isLoadingPreferences}
          >
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Account?"
        description="This will permanently delete your account and all associated data. This action cannot be undone."
        actions={[
          { label: 'Cancel', onClick: () => setShowDeleteConfirm(false), variant: 'outline' },
          {
            label: 'Delete',
            onClick: handleDeleteAccount,
            variant: 'danger',
            isLoading: isDeletingAccount,
          },
        ]}
      />
      </div>
    </div>
  );
}
