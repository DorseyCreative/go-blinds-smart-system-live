export interface LineItem {
  quantity: number;
  description: string;
}

export function parseLineItems(laborToDo: string): LineItem[] {
  if (!laborToDo) return [];
  return laborToDo
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const match = line.match(/Qty: ([\d.]+) - (.+)/i);
      if (match) {
        return {
          quantity: parseFloat(match[1]),
          description: match[2].trim(),
        };
      }
      return null;
    })
    .filter(Boolean) as LineItem[];
} 