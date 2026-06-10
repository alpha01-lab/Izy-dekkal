'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getSettings } from '@/actions/settings'

export async function getClients() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name')
  if (error) throw new Error(error.message)
  return data
}

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()
  const settings = await getSettings()
  const userId = settings?.user_id
  if (!userId) return { error: 'Non authentifié' }

  const { error } = await supabase.from('clients').insert({
    user_id: userId,
    name: formData.get('name') as string,
    phone: formData.get('phone') as string || '',
    email: formData.get('email') as string || '',
    address: formData.get('address') as string || '',
    notes: formData.get('notes') as string || '',
  })

  if (error) return { error: error.message }
  revalidatePath('/clients')
  return { success: true }
}

export async function updateClientAction(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('clients').update({
    name: formData.get('name') as string,
    phone: formData.get('phone') as string || '',
    email: formData.get('email') as string || '',
    address: formData.get('address') as string || '',
    notes: formData.get('notes') as string || '',
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/clients')
  return { success: true }
}

export async function deleteClientAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/clients')
  return { success: true }
}
