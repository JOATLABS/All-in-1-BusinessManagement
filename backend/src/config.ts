export const config = {
  port: Number(process.env.PORT ?? 4000),
  sessionTtlMs: 1000 * 60 * 60 * 8 // 8 hours
};
