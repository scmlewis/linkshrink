'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { Link as LinkType } from '@/lib/types';
import { formatDate, formatNumber, copyToClipboard } from '@/lib/utils';

export default function LinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<LinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created');
  const [filterTag, setFilterTag] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirmLink, setDeleteConfirmLink] = useState<LinkType | null>(null);
  const [formData, setFormData] = useState({
    originalUrl: '',
    customAlias: '',
    title: '',
    description: '',
    tags: '',
  });
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    links.forEach((link) => {
      link.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [links]);

  const fetchLinks = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sort: sortBy,
      });

      if (searchQuery) params.append('search', searchQuery);
      if (filterTag) params.append('tag', filterTag);

      const res = await fetch(`/api/links?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLinks(data.links);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filterTag, searchQuery, sortBy]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchLinks();
  }, [fetchLinks]);

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      const tags = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t);

      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalUrl: formData.originalUrl,
          customAlias: formData.customAlias || undefined,
          nickname: formData.title,
          description: formData.description,
          tags,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create link');
      } else {
        setFormData({ originalUrl: '', customAlias: '', title: '', description: '', tags: '' });
        setShowCreateForm(false);
        setCurrentPage(1);
        fetchLinks();
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyShortCode = async (shortCode: string) => {
    const shortUrl = `${process.env.NEXT_PUBLIC_SHORT_URL_BASE}/${shortCode}`;
    if (await copyToClipboard(shortUrl)) {
      setCopiedId(shortCode);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDeleteLink = async (link: LinkType) => {
    setDeleteConfirmLink(link);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmLink) return;

    try {
      const res = await fetch(`/api/links/${deleteConfirmLink.id}`, { method: 'DELETE' });
      if (res.ok) {
        setLinks(links.filter((l) => l.id !== deleteConfirmLink.id));
        setDeleteConfirmLink(null);
      }
    } catch (error) {
      console.error('Failed to delete link:', error);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-surface-container to-transparent pb-4 -mx-6 px-6 lg:-mx-10 lg:px-10 py-4 lg:py-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-on-surface">My Links</h1>
          <p className="text-body-md text-on-surface-variant">Manage all your shortened URLs</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="uppercase tracking-widest text-xs w-full sm:w-auto"
        >
          {showCreateForm ? 'Cancel' : 'Create Link'}
          <span className="material-symbols-outlined">add</span>
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleCreateLink} className="space-y-4">
              <Input
                label="Original URL"
                type="url"
                placeholder="https://example.com/very/long/url"
                value={formData.originalUrl}
                onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                required
              />
              <Input
                label="Custom Alias (optional)"
                type="text"
                placeholder="my-awesome-link"
                value={formData.customAlias}
                onChange={(e) => setFormData({ ...formData, customAlias: e.target.value })}
              />
              <Input
                label="Nickname (optional)"
                type="text"
                placeholder="My awesome link"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Input
                label="Description (optional)"
                type="text"
                placeholder="What this link is about"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Input
                label="Tags (comma-separated, optional)"
                type="text"
                placeholder="marketing, social, important"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
              {error && <p className="text-error text-sm">{error}</p>}

              <div className="flex gap-3">
                <Button variant="primary" type="submit" isLoading={isCreating}>
                  Create Link
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Button>
                <Button variant="outline" type="button" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      {links.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Select
            options={[
              { value: 'created', label: 'Newest First' },
              { value: 'clicks', label: 'Most Clicks' },
              { value: 'recent', label: 'Recently Clicked' },
            ]}
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.currentTarget.value);
              setCurrentPage(1);
            }}
          />
          <Select
            options={[
              { value: '', label: 'All Tags' },
              ...allTags.map((tag) => ({ value: tag, label: tag })),
            ]}
            value={filterTag}
            onChange={(e) => {
              setFilterTag(e.currentTarget.value);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Links List */}
      {links.length > 0 ? (
        <>
          <div className="space-y-3">
            {links.map((link) => (
              <Card key={link.id} className="hover:bg-surface-container-high transition-colors">
                <CardContent className="py-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-3 md:block">
                        <div className="min-w-0">
                          <p className="font-semibold text-on-surface truncate text-lg md:text-base">
                            {link.nickname || link.title || 'Untitled'}
                          </p>
                          <p className="text-xs text-on-surface-variant truncate mb-1">{link.original_url}</p>
                        </div>
                        <div className="md:hidden text-right shrink-0">
                          <p className="font-bold text-secondary text-lg">{formatNumber(link.click_count)}</p>
                          <p className="text-xs text-on-surface-variant">clicks</p>
                        </div>
                      </div>

                      {link.description && (
                        <p className="text-xs text-on-surface-variant line-clamp-2">{link.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        {link.tags && link.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {link.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" size="sm">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-on-surface-variant">
                          Created {formatDate(link.created_at)}
                          {link.last_clicked_at && ` • Last clicked ${formatDate(link.last_clicked_at)}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:justify-end md:border-l md:border-outline-variant md:pl-6">
                      <div className="hidden md:block text-right whitespace-nowrap">
                        <p className="font-bold text-secondary text-lg">{formatNumber(link.click_count)}</p>
                        <p className="text-xs text-on-surface-variant">clicks</p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyShortCode(link.short_code)}
                        title="Copy short URL"
                      >
                        <span className="material-symbols-outlined">content_copy</span>
                        <span className="hidden sm:inline">{copiedId === link.short_code ? 'Copied' : 'Copy'}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/links/${link.id}`)}
                        title="View analytics"
                      >
                        <span className="material-symbols-outlined">bar_chart</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteLink(link)}
                        title="Delete link"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-on-surface-variant">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="space-y-4">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant mx-auto block">
                link_off
              </span>
              <div>
                <p className="text-h2 mb-2">No links found</p>
                <p className="text-on-surface-variant mb-6">
                  {searchQuery || filterTag
                    ? 'Try adjusting your search or filters'
                    : 'Create your first shortened link to get started'}
                </p>
              </div>
              {!searchQuery && !filterTag && (
                <Button variant="primary" onClick={() => setShowCreateForm(true)}>
                  Create Link
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmLink}
        onClose={() => setDeleteConfirmLink(null)}
        title="Delete Link?"
        description={`Are you sure you want to delete "${deleteConfirmLink?.title || deleteConfirmLink?.short_code}"? This action cannot be undone.`}
        actions={[
          { label: 'Cancel', onClick: () => setDeleteConfirmLink(null), variant: 'outline' },
          { label: 'Delete', onClick: confirmDelete, variant: 'danger' },
        ]}
      />
    </div>
  );
}
