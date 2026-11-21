const SAFE_IMAGE_PROTOCOLS = new Set(["http:", "https:", "blob:"]);
const SAFE_LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

function parseAllowedUrl(
  value: string | null | undefined,
  protocols: Set<string>,
  allowFragment = false,
) {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  if (allowFragment && trimmed.startsWith("#")) return trimmed;

  try {
    const url = new URL(trimmed);
    return protocols.has(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function safeImageUrl(value: string | null | undefined) {
  return parseAllowedUrl(value, SAFE_IMAGE_PROTOCOLS);
}

export function safeLinkUrl(value: string | null | undefined) {
  return parseAllowedUrl(value, SAFE_LINK_PROTOCOLS, true);
}
