'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getSettings } from '@/actions/settings'

export async function getPurchaseOrders() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function createPurchaseOrderAction(formData: FormData) {
  const supabase = await createClient()
  const settings = await getSettings()
  const userId = settings?.user_id
  if (!userId) return { error: 'Non authentifié' }

  const now = new Date()
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const { count } = await supabase
    .from('purchase_orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  const number = `BC-${yearMonth}-${String((count ?? 0) + 1).padStart(4, '0')}`

  const { error } = await supabase.from('purchase_orders').insert({
    user_id: userId,
    number,
    supplier_id: formData.get('supplierId') as string || null,
    supplier_name: formData.get('supplierName') as string,
    date: formData.get('date') as string,
    expected_date: formData.get('expectedDate') as string || null,
    amount: Math.round(parseFloat(formData.get('amount') as string) * 100) || 0,
    notes: formData.get('notes') as string || '',
    status: 'en_attente',
  })

  if (error) return { error: error.message }
  revalidatePath('/achats')
  return { success: true }
}

export async function updatePurchaseOrderStatusAction(id: string, status: string) {
  const supabase = await createClient()
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
  const { error } = await supabase.from('purchase_orders').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/achats')
  return { success: true }
}
