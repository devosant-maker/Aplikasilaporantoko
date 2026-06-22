import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  findAllMetodePembayaran,
  createMetodePembayaran,
  deleteMetodePembayaran,
} from "./queries/metodePembayaran";

export const metodePembayaranRouter = createRouter({
  list: publicQuery.query(() => findAllMetodePembayaran()),

  create: publicQuery
    .input(
      z.object({
        nama: z.string().min(1),
        jenis: z.enum(["tunai", "non_tunai"]),
      })
    )
    .mutation(({ input }) => createMetodePembayaran(input)),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteMetodePembayaran(input.id)),
});
