import { z } from "zod";

export const submissionInput = z.object({
  ogrenciAdSoyad: z.string().min(2).max(120),
  ogretimUyesi: z.string().min(2).max(160),
  tcKimlik: z.string().min(5).max(20),
  telefon: z.string().max(40).optional().default(""),
  okulFakulteBolum: z.string().max(240).optional().default(""),
  etkinlikler: z.array(z.string().max(500)).min(1).max(50),
  aktifRolDusunce: z.string().max(2000).optional().default(""),
  kazanim: z.string().max(2000).optional().default(""),
  toplumaFayda: z.string().max(2000).optional().default(""),
  belgeTeslimTarihi: z.string().max(20).optional().default(""),
  hocaEmail: z
    .string()
    .email()
    .max(160)
    .optional()
    .or(z.literal(""))
    .default(""),
});

export type SubmissionInput = z.infer<typeof submissionInput>;
