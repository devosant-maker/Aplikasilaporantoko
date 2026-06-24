import { z } from "zod";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import {
  findAllProduk,
  findProdukById,
  createProduk,
  updateProduk,
  deleteProduk,
} from "./queries/produk";

export const produkRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        page: z.number().optional(),
        limit: z.number().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(({ input }) => findAllProduk(input)),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => findProdukById(input.id)),

  create: adminQuery
    .input(
      z.object({
        nama: z.string().min(1),
        hargaDefault: z.number().positive(),
        stok: z.number().min(0),
        kategori: z.string().optional(),
      })
    )
    .mutation(({ input }) => createProduk(input)),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        nama: z.string().min(1).optional(),
        hargaDefault: z.number().positive().optional(),
        stok: z.number().min(0).optional(),
        kategori: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateProduk(id, data);
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteProduk(input.id)),
});
