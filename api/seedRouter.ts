import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { seedDatabase } from "./queries/seed";

export const seedRouter = createRouter({
  run: publicQuery
    .input(
      z.object({
        secretKey: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const expectedKey = process.env.SEED_SECRET_KEY;
      
      if (!expectedKey || input.secretKey !== expectedKey) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Akses ditolak: Secret key tidak valid!",
        });
      }

      await seedDatabase();
      return { success: true, message: "Database berhasil di-seed!" };
    }),
});
