'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getSettings } from '@/actions/settings'

export async function getInvoices() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('*, invoice_items(*)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function getInvoiceById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

type InvoiceItemInput = {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discount: number
}

export async function createInvoiceAction(payload: {
  clientId: string
  clientName: string
  date: string
  dueDate: string
  amount: number
  status: string
  notes: string
  items: InvoiceItemInput[]
}) {
  const supabase = await createClient()
  const settings = await getSettings()
  const userId = settings?.user_id
  if (!userId) return { error: 'Non authentifié' }

  // Génération du numéro de facture
  const now = new Date()
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  const number = `FAC-${yearMonth}-${String((count ?? 0) + 1).padStart(4, '0')}`

  const { data: invoice, error: invError } = await supabase
    .from('invoices')
    .insert({
      user_id: userId,
      number,
      client_id: payload.clientId || null,
      client_name: payload.clientName,
      date: payload.date,
      due_date: payload.dueDate || null,
      amount: payload.amount,
      status: payload.status,
      notes: payload.notes,
    })
    .select()
    .single()

  if (invError) return { error: invError.message }

  if (payload.items.length > 0) {
    const { error: itemsError } = await supabase.from('invoice_items').insert(
      payload.items.map(item => ({
        invoice_id: invoice.id,
        product_id: item.productId || null,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount: item.discount,
      }))
    )
    if (itemsError) return { error: itemsError.message }
  }

  revalidatePath('/factures')
  return { success: true, id: invoice.id }
}

export async function updateInvoiceStatusAction(id: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('invoices')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/factures')
  return { success: true }
}

export async function deleteInvoiceAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('invoices').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/factures')
  return { success: true }
}
