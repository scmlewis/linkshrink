import { supabase, supabaseAdmin } from './supabase';
import { Link, ApiResponse } from './types';
import { generateShortCode, isValidUrl, normalizeUrl } from './shortener';

/**
 * Create a new shortened link
 */
export async function createLink(
  userId: string,
  originalUrl: string,
  options?: {
    customAlias?: string;
    title?: string;
    nickname?: string;
    description?: string;
    tags?: string[];
  }
): Promise<ApiResponse<Link>> {
  try {
    // Validate URL
    const normalizedUrl = normalizeUrl(originalUrl);
    if (!isValidUrl(normalizedUrl)) {
      return {
        success: false,
        error: 'Invalid URL format',
      };
    }

    // Determine short code
    let shortCode = options?.customAlias || generateShortCode(6);

    // Create link with retry on conflict
    let result = await supabaseAdmin
      .from('links')
      .insert([
        {
          user_id: userId,
          short_code: shortCode,
          original_url: normalizedUrl,
          custom_alias: options?.customAlias,
          title: options?.title,
          nickname: options?.nickname,
          description: options?.description,
          is_active: true,
        },
      ])
      .select()
      .single();

    // If custom alias conflicts, generate a new one and retry
    if (result.error && options?.customAlias && (result.error as any).code === '23505') {
      const newShortCode = generateShortCode(6);
      result = await supabaseAdmin
        .from('links')
        .insert([
          {
            user_id: userId,
            short_code: newShortCode,
            original_url: normalizedUrl,
            custom_alias: options?.customAlias,
            title: options?.title,
            nickname: options?.nickname,
            description: options?.description,
            is_active: true,
          },
        ])
        .select()
        .single();
    }

    const { data: link, error } = result;

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Add tags if provided
    if (options?.tags && options.tags.length > 0) {
      const tagRecords = options.tags.map((tag) => ({
        link_id: link.id,
        tag: tag.toLowerCase(),
      }));

      await supabaseAdmin.from('tags').insert(tagRecords);
    }

    // Fetch full link with tags
    return getLink(link.id);
  } catch (error) {
    console.error('Error creating link:', error);
    return {
      success: false,
      error: 'Failed to create link',
    };
  }
}

/**
 * Get a specific link by ID
 */
export async function getLink(linkId: string): Promise<ApiResponse<Link>> {
  try {
    const { data: link, error } = await supabaseAdmin
      .from('links')
      .select('*')
      .eq('id', linkId)
      .single();

    if (error) {
      return {
        success: false,
        error: 'Link not found',
      };
    }

    // Get tags
    const { data: tags } = await supabaseAdmin.from('tags').select('tag').eq('link_id', linkId);

    const linkWithTags: Link = {
      ...link,
      tags: tags?.map((t) => t.tag) || [],
    };

    return {
      success: true,
      data: linkWithTags,
    };
  } catch (error) {
    console.error('Error getting link:', error);
    return {
      success: false,
      error: 'Failed to get link',
    };
  }
}

/**
 * Get all links for a user with pagination
 */
export async function getUserLinks(
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse<{ links: Link[]; total: number }>> {
  try {
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data: links, error, count } = await supabaseAdmin
      .from('links')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Get tags for all links
    const linkIds = links?.map((l) => l.id) || [];
    let tagsMap: Record<string, string[]> = {};

    if (linkIds.length > 0) {
      const { data: allTags } = await supabaseAdmin
        .from('tags')
        .select('link_id, tag')
        .in('link_id', linkIds);

      if (allTags) {
        tagsMap = allTags.reduce(
          (acc, t) => {
            if (!acc[t.link_id]) acc[t.link_id] = [];
            acc[t.link_id].push(t.tag);
            return acc;
          },
          {} as Record<string, string[]>
        );
      }
    }

    const linksWithTags: Link[] =
      links?.map((link) => ({
        ...link,
        tags: tagsMap[link.id] || [],
      })) || [];

    return {
      success: true,
      data: {
        links: linksWithTags,
        total: count || 0,
      },
    };
  } catch (error) {
    console.error('Error getting user links:', error);
    return {
      success: false,
      error: 'Failed to get links',
    };
  }
}

/**
 * Update a link
 */
export async function updateLink(
  linkId: string,
  updates: Partial<Link>
): Promise<ApiResponse<Link>> {
  try {
    const { error } = await supabaseAdmin.from('links').update(updates).eq('id', linkId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return getLink(linkId);
  } catch (error) {
    console.error('Error updating link:', error);
    return {
      success: false,
      error: 'Failed to update link',
    };
  }
}

/**
 * Delete a link
 */
export async function deleteLink(linkId: string): Promise<ApiResponse<null>> {
  try {
    // Delete the link (database has ON DELETE CASCADE for tags and analytics)
    const { error } = await supabaseAdmin.from('links').delete().eq('id', linkId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error('Error deleting link:', error);
    return {
      success: false,
      error: 'Failed to delete link',
    };
  }
}

/**
 * Get link by short code
 */
export async function getLinkByShortCode(shortCode: string): Promise<ApiResponse<Link>> {
  try {
    const { data: link, error } = await supabase
      .from('links')
      .select('*')
      .eq('short_code', shortCode)
      .eq('is_active', true)
      .single();

    if (error) {
      return {
        success: false,
        error: 'Link not found',
      };
    }

    // Check if expired
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return {
        success: false,
        error: 'Link has expired',
      };
    }

    return {
      success: true,
      data: link,
    };
  } catch (error) {
    console.error('Error getting link by short code:', error);
    return {
      success: false,
      error: 'Failed to get link',
    };
  }
}

/**
 * Increment click count for a link
 */
export async function incrementClickCount(linkId: string): Promise<void> {
  try {
    await supabaseAdmin.rpc('increment_click_count', { link_id: linkId });
  } catch (error) {
    console.error('Error incrementing click count:', error);
  }
}

/**
 * Search links by query
 */
export async function searchLinks(
  userId: string,
  query: string
): Promise<ApiResponse<Link[]>> {
  try {
    const { data: links, error } = await supabaseAdmin
      .from('links')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%,original_url.ilike.%${query}%,short_code.ilike.%${query}%`);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: links || [],
    };
  } catch (error) {
    console.error('Error searching links:', error);
    return {
      success: false,
      error: 'Failed to search links',
    };
  }
}
