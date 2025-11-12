export default () => ({
  DATABASE_URL: process.env.DATABASE_URL,
  FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY,
  FLUTTERWAVE_PUBLIC_KEY: process.env.FLUTTERWAVE_PUBLIC_KEY,

  APP: {
    PORT: process.env.PORT,
  },
});
