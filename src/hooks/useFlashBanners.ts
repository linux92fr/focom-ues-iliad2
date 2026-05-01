import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FlashBanner {
  id: string;
  message: string;
  type: 'urgent' | 'info' | 'event' | 'announcement';
  link?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export const useFlashBanners = () => {
  const [banners, setBanners] = useState<FlashBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveBanners();

    // Subscribe to changes
    const channel = supabase
      .channel('flash_banners_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flash_banners',
        },
        () => {
          fetchActiveBanners();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActiveBanners = async () => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('flash_banners')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching flash banners:', error);
        setBanners([]);
      } else {
        setBanners(data || []);
      }
    } catch (error) {
      console.error('Error fetching flash banners:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  return { banners, loading };
};
