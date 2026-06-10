'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getSettings } from '@/actions/settings'

export async function getSuppliers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name')
  if (error) throw new Error(error.message)
  return data
}

export async function createSupplierAction(formData: FormData) {
  const supabase = await createClient()
  const settings = await getSettings()
  const userId = settings?.user_id
  if (!userId) return { error: 'Non authentifié' }

  const { error } = await supabase.from('suppliers').insert({
    user_id: userId,
    name: formData.get('name') as string,
    phone: formData.get('phone') as string || '',
    email: formData.get('email') as string || '',
    address: formData.get('address') as string || '',
    notes: formData.get('notes') as string || '',
  })

  if (error) return { error: error.message }
  revalidatePath('/fournisseurs')
  return { success: true }
}

export async function updateSupplierAction(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('suppliers').update({
    name: formData.get('name') as string,
    phone: formData.get('phone') as string || '',
    email: formData.get('email') as string || '',
    address: formData.get('address') as string || '',
    notes: formData.get('notes') as string || '',
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/fournisseurs')
  return { success: true }
}

export async function deleteSupplierAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('suppliers').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/fournisseurs')
  return { success: true }
}
