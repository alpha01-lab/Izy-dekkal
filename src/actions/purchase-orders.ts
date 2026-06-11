'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getSettings } from '@/actions/settings'
import { adjustStockForItems } from '@/lib/stock'

export async function getPurchaseOrders() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*, purchase_order_items(*)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

type PurchaseOrderItemInput = {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export async function createPurchaseOrderAction(formData: FormData) {
  const supabase = await createClient()
  const settings = await getSettings()
  const userId = settings?.user_id
  if (!userId) return { error: 'Non authentifié' }

  const items: PurchaseOrderItemInput[] = JSON.parse(formData.get('items') as string || '[]')
  const amount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  const now = new Date()
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const { count } = await supabase
    .from('purchase_orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  const number = `BC-${yearMonth}-${String((count ?? 0) + 1).padStart(4, '0')}`

  const { data: order, error } = await supabase.from('purchase_orders').insert({
    user_id: userId,
    number,
    supplier_id: formData.get('supplierId') as string || null,
    supplier_name: formData.get('supplierName') as string,
    date: formData.get('date') as string,
    expected_date: formData.get('expectedDate') as string || null,
    amount,
    notes: formData.get('notes') as string || '',
    status: 'en_attente',
  }).select().single()

  if (error) return { error: error.message }

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from('purchase_order_items').insert(
      items.map(item => ({
        purchase_order_id: order.id,
        product_id: item.productId || null,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      }))
    )
    if (itemsError) return { error: itemsError.message }
  }

  revalidatePath('/achats')
  return { success: true }
}

export async function updatePurchaseOrderStatusAction(id: string, status: string) {
  const supabase = await createClient()

  const { data: current, error: fetchError } = await supabase
    .from('purchase_orders')
    .select('status, purchase_order_items(product_id, quantity)')
    .eq('id', id)
    .single()
  if (fetchError) return { error: fetchError.message }

  const wasReceived = current.status === 'recue'
  const isReceived = status === 'recue'

  // La réception complète d'un bon ajoute les quantités au stock,
  // et les retire si le statut est annulé après coup.
  if (!wasReceived && isReceived) {
    await adjustStockForItems(supabase, current.purchase_order_items, 1)
    revalidatePath('/stock')
  } else if (wasReceived && !isReceived) {
    await adjustStockForItems(supabase, current.purchase_order_items, -1)
    revalidatePath('/stock')
  }

  const { error } = await supabase
    .from('purchase_orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/achats')
  return { success: true }
}

export async function deletePurchaseOrderAction(id: string) {
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('purchase_orders')
    .select('status, purchase_order_items(product_id, quantity)')
    .eq('id', id)
    .single()

  if (order && order.status === 'recue') {
    await adjustStockForItems(supabase, order.purchase_order_items, -1)
    revalidatePath('/stock')
  }

  const { error } = await supabase.from('purchase_orders').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/achats')
  return { success: true }
}
