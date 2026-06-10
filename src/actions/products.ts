'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getSettings } from '@/actions/settings'

export async function getProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('name')
  if (error) throw new Error(error.message)
  return data
}

export async function createProductAction(formData: FormData) {
  const supabase = await createClient()
  const settings = await getSettings()
  const userId = settings?.user_id
  if (!userId) return { error: 'Non authentifié' }

  const { error } = await supabase.from('products').insert({
    user_id: userId,
    name: formData.get('name') as string,
    category: formData.get('category') as string || 'Divers',
    quantity: parseInt(formData.get('quantity') as string) || 0,
    alert_threshold: parseInt(formData.get('alertThreshold') as string) || 5,
    purchase_price: Math.round(parseFloat(formData.get('purchasePrice') as string) * 100) || 0,
    sale_price: Math.round(parseFloat(formData.get('salePrice') as string) * 100) || 0,
    unit: formData.get('unit') as string || 'pièce',
  })

  if (error) return { error: error.message }
  revalidatePath('/stock')
  return { success: true }
}

export async function updateProductAction(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('products').update({
    name: formData.get('name') as string,
    category: formData.get('category') as string || 'Divers',
    quantity: parseInt(formData.get('quantity') as string) || 0,
    alert_threshold: parseInt(formData.get('alertThreshold') as string) || 5,
    purchase_price: Math.round(parseFloat(formData.get('purchasePrice') as string) * 100) || 0,
    sale_price: Math.round(parseFloat(formData.get('salePrice') as string) * 100) || 0,
    unit: formData.get('unit') as string || 'pièce',
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/stock')
  return { success: true }
}

export async function deleteProductAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('products').update({ active: false }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/stock')
  return { success: true }
}
