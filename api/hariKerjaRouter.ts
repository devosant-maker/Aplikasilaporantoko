import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  findAllHariKerja,
  findHariKerjaById,
  findHariKerjaByTanggal,
  findHariKerjaTerakhir,
  createHariKerja,
  updateRekapHariKerja,
  setSetorTunai,
  updateSisaModal,
  getDashboardStats,
} from "./queries/hariKerja";

export const hariKerjaRouter = createRouter({
  list: publicQuery
    .input(z.object({ bulan: z.string().optional() }).optional())
    .query(({ input }) => findAllHariKerja(input?.bulan)),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => findHariKerjaById(input.id)),

  byTanggal: publicQuery
    .input(z.object({ tanggal: z.string() }))
    .query(({ input }) => findHariKerjaByTanggal(input.tanggal)),

  terakhir: publicQuery.query(() => findHariKerjaTerakhir()),

  create: publicQuery
    .input(
      z.object({
        tanggal: z.string(),
        sisaModal: z.string(),
        createdBy: z.string().optional(),
      })
    )
    .mutation(({ input }) => createHariKerja(input)),

  rekap: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => updateRekapHariKerja(input.id)),

  setSetor: publicQuery
    .input(z.object({ id: z.number(), nominal: z.string() }))
    .mutation(({ input }) => setSetorTunai(input.id, input.nominal)),

  updateModal: publicQuery
    .input(z.object({ id: z.number(), sisaModal: z.string() }))
    .mutation(({ input }) => updateSisaModal(input.id, input.sisaModal)),

  dashboard: publicQuery
    .input(z.object({ bulan: z.string() }))
    .query(({ input }) => getDashboardStats(input.bulan)),
});
