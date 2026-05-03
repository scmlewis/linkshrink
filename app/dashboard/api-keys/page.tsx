'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  last4: string;
  created_at: string;
  last_used_at?: string;
}

export default function ApiKeysPage() {
  const { addToast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [keyName, setKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<ApiKey | null>(null);

  const fetchApiKeys = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/api-keys');
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data.keys || []);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      addToast('Failed to load API keys', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchApiKeys();
  }, [fetchApiKeys]);

  const handleCreateKey = async () => {
    if (!keyName.trim()) {
      addToast('Please enter a key name', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: keyName }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedKey(data);
        setKeyName('');
        await fetchApiKeys();
        addToast('API key created successfully', 'success');
      } else {
        addToast('Failed to create API key', 'error');
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
      addToast('Failed to create API key', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      const res = await fetch(`/api/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setApiKeys(apiKeys.filter((k) => k.id !== keyId));
        setShowDeleteConfirm(null);
        addToast('API key deleted', 'success');
      } else {
        addToast('Failed to delete API key', 'error');
      }
    } catch (error) {
      console.error('Failed to delete API key:', error);
      addToast('Failed to delete API key', 'error');
    }
  };

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      addToast('API key copied to clipboard', 'success');
    } catch {
      addToast('Failed to copy API key', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
      <div className="space-y-6 max-w-4xl w-full">
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center">
          <div>
            <h1 className="text-h1 font-bold text-on-surface">API Keys</h1>
            <p className="text-body-md text-on-surface-variant">
              Manage API keys for programmatic access
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="mt-4"
          >
            <span className="material-symbols-outlined">add</span>
            Create Key
          </Button>
        </div>

        {/* Create Modal */}
        <Modal
        isOpen={showCreateModal}
        onClose={() => !createdKey && setShowCreateModal(false)}
        title="Create API Key"
        description="Give your API key a descriptive name for easy identification"
      >
        <div className="space-y-4">
          {!createdKey ? (
            <>
              <input
                type="text"
                placeholder="e.g., Production Server, Mobile App"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="w-full px-4 py-2 bg-black/80 border border-outline-variant rounded-lg text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
                disabled={isCreating}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateKey}
                  isLoading={isCreating}
                >
                  Create
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 space-y-2">
                <p className="text-sm font-semibold text-on-surface">
                  Save your API key now - you won&apos;t see it again!
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdKey.key}
                    className="flex-1 px-3 py-2 bg-black/50 border border-outline-variant rounded text-xs font-mono text-on-surface"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyKey(createdKey.key)}
                  >
                    <span className="material-symbols-outlined">content_copy</span>
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreatedKey(null);
                  }}
                >
                  Done
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

        {/* API Keys List */}
        {apiKeys.length > 0 ? (
        <div className="space-y-3">
          {apiKeys.map((apiKey) => (
            <Card key={apiKey.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-on-surface">{apiKey.name}</p>
                      <Badge variant="secondary" size="sm">
                        sk_live_****{apiKey.last4}
                      </Badge>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Created {formatDate(apiKey.created_at)}
                      {apiKey.last_used_at && (
                        <> • Last used {formatDate(apiKey.last_used_at)}</>
                      )}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      title="API keys are only visible upon creation"
                    >
                      <span className="material-symbols-outlined">
                        visibility_off
                      </span>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setShowDeleteConfirm(apiKey.id)}
                      title="Delete API key"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="space-y-4">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant mx-auto block">
                vpn_key
              </span>
              <div>
                <p className="text-h2 mb-2">No API Keys Yet</p>
                <p className="text-on-surface-variant mb-6">
                  Create your first API key to start building integrations
                </p>
              </div>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Create API Key
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          title="Delete API Key?"
          description="This action cannot be undone. Any applications using this key will stop working."
          actions={[
            { label: 'Cancel', onClick: () => setShowDeleteConfirm(null), variant: 'outline' },
            {
              label: 'Delete',
              onClick: () => showDeleteConfirm && handleDeleteKey(showDeleteConfirm),
              variant: 'danger',
            },
          ]}
        />
      </div>
    </div>
  );
}
