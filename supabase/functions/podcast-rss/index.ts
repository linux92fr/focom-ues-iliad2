import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://www.focomues-iliad.fr";
const PODCAST_URL = `${SITE_URL}/podcasts`;

const FEED_META = {
  title: "Le Podcast FO COM UES ILIAD",
  description:
    "Chaque mois, vos délégués FO COM décryptent l'actualité sociale, vos droits et les négociations en cours au sein d'UES ILIAD.",
  author: "FOCOM UES ILIAD",
  email: "contact@focomues-iliad.fr",
  language: "fr",
  category: "Society & Culture",
  explicit: "false",
  imageUrl: `${SITE_URL}/og-image.png`,
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatRfc822(iso: string): string {
  return new Date(iso).toUTCString();
}

function secondsToHHMMSS(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Seuls les épisodes publics (non members_only) dans le flux RSS public
  const { data: episodes, error } = await supabase
    .from("podcasts")
    .select("*")
    .eq("is_published", true)
    .eq("is_members_only", false)
    .order("episode_number", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const items = (episodes ?? [])
    .map((ep) => {
      const pubDate = ep.published_at
        ? formatRfc822(ep.published_at)
        : formatRfc822(ep.created_at);
      const duration = ep.duration_seconds ? secondsToHHMMSS(ep.duration_seconds) : "";
      const description = ep.description ?? ep.title;
      const transcript = ep.transcript ? `\n\n---\n\n${ep.transcript}` : "";

      return `
    <item>
      <title>${escapeXml(ep.title)}</title>
      <link>${PODCAST_URL}#episode-${ep.episode_number}</link>
      <guid isPermaLink="false">podcast-focom-ep-${ep.episode_number}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}${transcript}]]></description>
      <itunes:summary>${escapeXml(description)}</itunes:summary>
      <itunes:episode>${ep.episode_number}</itunes:episode>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:explicit>false</itunes:explicit>
      ${duration ? `<itunes:duration>${duration}</itunes:duration>` : ""}
      ${ep.cover_url ? `<itunes:image href="${escapeXml(ep.cover_url)}" />` : ""}
      <enclosure
        url="${escapeXml(ep.audio_url)}"
        type="audio/mpeg"
        length="0"
      />
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_META.title)}</title>
    <link>${PODCAST_URL}</link>
    <atom:link href="${Deno.env.get("SUPABASE_URL")}/functions/v1/podcast-rss" rel="self" type="application/rss+xml" />
    <description>${escapeXml(FEED_META.description)}</description>
    <language>${FEED_META.language}</language>
    <managingEditor>${FEED_META.email} (${FEED_META.author})</managingEditor>
    <itunes:owner>
      <itunes:name>${escapeXml(FEED_META.author)}</itunes:name>
      <itunes:email>${FEED_META.email}</itunes:email>
    </itunes:owner>
    <itunes:author>${escapeXml(FEED_META.author)}</itunes:author>
    <itunes:explicit>${FEED_META.explicit}</itunes:explicit>
    <itunes:category text="${escapeXml(FEED_META.category)}" />
    <itunes:image href="${escapeXml(FEED_META.imageUrl)}" />
    <image>
      <url>${escapeXml(FEED_META.imageUrl)}</url>
      <title>${escapeXml(FEED_META.title)}</title>
      <link>${PODCAST_URL}</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
