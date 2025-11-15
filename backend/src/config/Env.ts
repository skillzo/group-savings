export default () => ({
  DATABASE_URL: process.env.DATABASE_URL,

  FLUTTERWAVE: {
    SECRET_KEY: process.env.FLW_SECRET_KEY,
    PUBLIC_KEY: process.env.FLW_PUBLIC_KEY,
    BASE_URL: process.env.FLW_BASE_URL,
    WEBHOOK_KEY: process.env.FLW_WEBHOOK_KEY,
  },

  APP: {
    PORT: process.env.PORT,
    FRONTEND_URL: process.env.FRONTEND_URL,
  },
});
