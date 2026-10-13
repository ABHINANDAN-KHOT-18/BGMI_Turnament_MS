import { z } from 'zod'

/**
 * Normalizes BGMI player ID/UID:
 * Usually 8 to 12 digits, or standard gamer alphanumeric tags
 */
export const bgmiUidSchema = z
  .string()
  .trim()
  .min(5, 'BGMI UID must be at least 5 characters')
  .max(16, 'BGMI UID cannot exceed 16 characters')
  .regex(/^[0-9A-Za-z_-]+$/, 'BGMI UID must contain only letters, numbers, or dashes')

export const registrationFormSchema = z
  .object({
    team_name: z.string().trim().min(3, 'Team name must be at least 3 characters').max(32, 'Team name too long'),
    igl_name: z.string().trim().min(2, 'IGL name must be at least 2 characters').max(32, 'IGL name too long'),
    igl_bgmi_uid: bgmiUidSchema,
    whatsapp_number: z
      .string()
      .trim()
      .min(10, 'WhatsApp number must be at least 10 digits')
      .max(15, 'Invalid phone number length')
      .regex(/^\+?[0-9\s-]+$/, 'Must be a valid phone number'),
    player_2_bgmi_id: bgmiUidSchema,
    player_3_bgmi_id: bgmiUidSchema,
    player_4_bgmi_id: bgmiUidSchema,
  })
  .refine(
    (data) => {
      const uids = [
        data.igl_bgmi_uid.toLowerCase(),
        data.player_2_bgmi_id.toLowerCase(),
        data.player_3_bgmi_id.toLowerCase(),
        data.player_4_bgmi_id.toLowerCase(),
      ]
      const uniqueUids = new Set(uids)
      return uniqueUids.size === 4
    },
    {
      message: 'All 4 player BGMI IDs must be unique within the squad',
      path: ['player_4_bgmi_id'],
    }
  )

export type RegistrationFormData = z.infer<typeof registrationFormSchema>
