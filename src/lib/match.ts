// Cosine similarity between two vectors
export function cosineSimilarity(a: Record<string, number>, b: Record<string, number>): number {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  keys.forEach((key) => {
    const valA = a[key] || 0;
    const valB = b[key] || 0;
    dotProduct += valA * valB;
    magnitudeA += valA * valA;
    magnitudeB += valB * valB;
  });

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  if (magnitude === 0) return 0;
  return (dotProduct / magnitude) * 100;
}

// Normalize a vector so max value = 1
export function normalizeVector(vector: Record<string, number>): Record<string, number> {
  const maxVal = Math.max(...Object.values(vector), 1);
  const normalized: Record<string, number> = {};
  for (const [key, value] of Object.entries(vector)) {
    normalized[key] = value / maxVal;
  }
  return normalized;
}

// Sum weight vectors from selected options
export function sumVectors(vectors: Record<string, number>[]): Record<string, number> {
  const result: Record<string, number> = {};
  vectors.forEach((v) => {
    Object.entries(v).forEach(([key, value]) => {
      result[key] = (result[key] || 0) + value;
    });
  });
  return result;
}
