export const corsMiddleware = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://sristi-kheduthaat.vercel.app"); // Allow all origins
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    return res.status(200).json({});
  }
  next();
};
