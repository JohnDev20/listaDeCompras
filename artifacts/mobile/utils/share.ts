import type { ShoppingList } from '@/types/shopping';
import { UNIT_LABELS } from '@/types/shopping';

/**
 * Builds a plain-text representation of a list, formatted for sharing
 * (e.g. via WhatsApp). Unchecked items are listed first, checked items
 * are shown with a strike-style marker.
 */
export function buildShareText(list: ShoppingList): string {
  const pending = list.items.filter((item) => !item.checked);
  const done = list.items.filter((item) => item.checked);

  const lines: string[] = [`🛒 ${list.name}`, ''];

  const formatItem = (item: (typeof list.items)[number], checked: boolean) => {
    const qty =
      item.quantity && item.quantity > 0
        ? `${formatQuantity(item.quantity)} ${UNIT_LABELS[item.unit]} `
        : '';
    const marker = checked ? '[x]' : '[ ]';
    const note = item.note ? ` (${item.note})` : '';
    return `${marker} ${qty}${item.name}${note}`.trim();
  };

  if (pending.length === 0 && done.length === 0) {
    lines.push('(lista vazia)');
  } else {
    for (const item of pending) {
      lines.push(formatItem(item, false));
    }
    if (done.length > 0) {
      if (pending.length > 0) lines.push('');
      for (const item of done) {
        lines.push(formatItem(item, true));
      }
    }
  }

  lines.push('', 'Enviado pelo app Lista de Compras');

  return lines.join('\n');
}

function formatQuantity(quantity: number): string {
  return Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(2);
}
