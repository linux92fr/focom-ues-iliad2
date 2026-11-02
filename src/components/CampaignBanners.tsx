import FlashBanner from "@/components/FlashBanner";
import { useFlashBanners } from "@/hooks/useFlashBanners";

export default function CampaignBanners() {
  const { banners, loading } = useFlashBanners();
  if (loading || banners.length === 0) return null;

  return (
    <section aria-label="Informations importantes" className="mb-6 space-y-2">
      {banners.map((banner) => (
        <FlashBanner
          key={banner.id}
          message={banner.message}
          type={banner.type}
          link={banner.link || undefined}
        />
      ))}
    </section>
  );
}
