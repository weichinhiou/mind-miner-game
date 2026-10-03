// Prefer undiscovered lines; after completing a set, avoid the last line.
export function chooseQuote(quotes, scholarId, collection, random = Math.random) {
  const pool = quotes.filter(q => q.scholarId === scholarId);
  if (!pool.length) return null;
  const seen = new Set(collection?.quoteIds || []);
  const unseen = pool.filter(q => !seen.has(q.id));
  const candidates = unseen.length ? unseen : pool.filter(q => q.id !== collection?.lastQuoteId);
  const choices = candidates.length ? candidates : pool;
  return { quote: choices[Math.floor(random() * choices.length)], isNewQuote: unseen.length > 0 };
}
