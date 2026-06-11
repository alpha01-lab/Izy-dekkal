import { createClient } from '@/lib/supabase/server'

type StockItem = {
  product_id: string | null
  quantity: number
}

/**
 * Ajuste la quantité en stock de chaque produit d'une liste de lignes
 * (facture ou bon de commande). `direction` = -1 pour décrémenter
 * (vente), +1 pour incrémenter (réception ou annulation).
 */
export async function adjustStockForItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  items: StockItem[],
  direction: 1 | -1
) {
  for (const item of items) {
    if (!item.product_id) continue
    await supabase.rpc('adjust_product_quantity', {
      p_product_id: item.product_id,
      p_delta: item.quantity * direction,
    })
  }
}
