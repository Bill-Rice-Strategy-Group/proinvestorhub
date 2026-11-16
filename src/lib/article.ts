/**
 * "a" or "an" before a formatted figure, by how it is read aloud:
 * "an 8.5%", "an 88 bps", "an 18.2%", "an 11%", "an $800", but "a 1,800",
 * "a 110 bps", "a 6.9%". A leading "$" is skipped ("$800" is read "eight
 * hundred dollars"); signed values are read with their sign ("a −2.4"), so they
 * keep "a".
 */
export function indefiniteArticle(figure: string): 'a' | 'an' {
  const s = figure.trim().replace(/^\$/, '')
  if (/^8/.test(s)) return 'an'
  // eleven, eighteen (and 11.x / 18.x) — but not 110, 180, 1,100, 1,800
  if (/^1[18](?![\d,])/.test(s)) return 'an'
  return 'a'
}

/** The figure with its article, e.g. "an 88 bps". */
export function withArticle(figure: string): string {
  return `${indefiniteArticle(figure)} ${figure}`
}
