'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .single()
  if (error) return null
  return data
}

export async function updateSettingsAction(formData: FormData) {
  const supabase = await createClient()
  const existing = await getSettings()
  const userId = existing?.user_id
  if (!userId) return { error: 'Non authentifié' }

  const { error } = await supabase.from('settings').upsert({
    user_id: userId,
    name: formData.get('name') as string,
    address: formData.get('address') as string || '',
    phone: formData.get('phone') as string || '',
    email: formData.get('email') as string || '',
    logo_url: formData.get('logoUrl') as string || '',
    devise: formData.get('devise') as string || 'FCFA',
    invoice_prefix: formData.get('invoicePrefix') as string || 'FAC',
    tva_rate: parseInt(formData.get('tvaRate') as string) || 18,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  if (error) return { error: error.message }
  revalidatePath('/parametres')
  return { success: true }
}
