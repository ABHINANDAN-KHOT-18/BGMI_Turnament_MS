import { describe, it, expect } from 'vitest'
import { registrationFormSchema } from '../lib/validation'

describe('Squad Registration Validation Constraints', () => {
  it('accepts a valid 4-player squad with unique BGMI UIDs', () => {
    const validData = {
      team_name: 'SOUL CYPRESS',
      igl_name: 'Mortal',
      igl_bgmi_uid: '5123456789',
      whatsapp_number: '+919876543210',
      player_2_bgmi_id: '5123456790',
      player_3_bgmi_id: '5123456791',
      player_4_bgmi_id: '5123456792',
    }

    const result = registrationFormSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects duplicate player IDs within the same squad', () => {
    const duplicateData = {
      team_name: 'SOUL CYPRESS',
      igl_name: 'Mortal',
      igl_bgmi_uid: '5123456789',
      whatsapp_number: '+919876543210',
      player_2_bgmi_id: '5123456789', // Duplicate of IGL
      player_3_bgmi_id: '5123456791',
      player_4_bgmi_id: '5123456792',
    }

    const result = registrationFormSchema.safeParse(duplicateData)
    expect(result.success).toBe(false)
  })

  it('rejects invalid or too short BGMI UIDs', () => {
    const invalidUidData = {
      team_name: 'SOUL CYPRESS',
      igl_name: 'Mortal',
      igl_bgmi_uid: '12', // Less than 5 characters
      whatsapp_number: '+919876543210',
      player_2_bgmi_id: '5123456790',
      player_3_bgmi_id: '5123456791',
      player_4_bgmi_id: '5123456792',
    }

    const result = registrationFormSchema.safeParse(invalidUidData)
    expect(result.success).toBe(false)
  })
})
