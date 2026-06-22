import { relations } from "drizzle-orm";
import {
  hariKerja,
  barangKeluar,
  operasional,
  barangMasuk,
  lainLain,
  member,
} from "./schema";

export const hariKerjaRelations = relations(hariKerja, ({ many }) => ({
  barangKeluar: many(barangKeluar),
  operasional: many(operasional),
  barangMasuk: many(barangMasuk),
  lainLain: many(lainLain),
}));

export const barangKeluarRelations = relations(barangKeluar, ({ one }) => ({
  hariKerja: one(hariKerja, {
    fields: [barangKeluar.hariKerjaId],
    references: [hariKerja.id],
  }),
  member: one(member, {
    fields: [barangKeluar.memberId],
    references: [member.id],
  }),
}));

export const operasionalRelations = relations(operasional, ({ one }) => ({
  hariKerja: one(hariKerja, {
    fields: [operasional.hariKerjaId],
    references: [hariKerja.id],
  }),
}));

export const barangMasukRelations = relations(barangMasuk, ({ one }) => ({
  hariKerja: one(hariKerja, {
    fields: [barangMasuk.hariKerjaId],
    references: [hariKerja.id],
  }),
}));

export const lainLainRelations = relations(lainLain, ({ one }) => ({
  hariKerja: one(hariKerja, {
    fields: [lainLain.hariKerjaId],
    references: [hariKerja.id],
  }),
}));
