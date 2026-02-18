/**
 * Count words in TipTap JSON content.
 * Recursively walks the document tree and counts whitespace-separated tokens.
 */
export function countWordsInTipTapJson(content: any): number {
  if (!content || !content.content) return 0;
  let count = 0;
  const walk = (node: any) => {
    if (node.text) {
      count += node.text.split(/\s+/).filter(Boolean).length;
    }
    if (node.content) {
      node.content.forEach(walk);
    }
  };
  content.content.forEach(walk);
  return count;
}
