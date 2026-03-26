export function isSafeWikipediaUrl(url) {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname === 'en.wikipedia.org' &&
      parsed.pathname.startsWith('/wiki/')
    );
  } catch {
    return false;
  }
}
