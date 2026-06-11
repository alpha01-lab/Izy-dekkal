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

export async function uploadLogoAction(formData: FormData) {
  const supabase = await createClient()
  const existing = await getSettings()
  const userId = existing?.user_id
  if (!userId) return { error: 'Non authentifié' }

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { error: 'Aucun fichier sélectionné.' }
  if (file.size > 2 * 1024 * 1024) return { error: 'Le fichier dépasse 2 Mo.' }
  if (!file.type.startsWith('image/')) return { error: 'Le fichier doit être une image.' }

  const ext = file.name.split('.').pop() || 'png'
  const path = `${userId}/logo.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)
  const logoUrl = `${publicUrl}?t=${Date.now()}`

  const { error } = await supabase
    .from('settings')
    .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  if (error) return { error: error.message }
  revalidatePath('/parametres')
  return { success: true, logoUrl }
}
