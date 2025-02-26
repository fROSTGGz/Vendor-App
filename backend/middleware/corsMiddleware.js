export const corsMiddleware = (req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://sristi-kheduthaat.vercel.app",
    "https://sristi-kheduthaat-keshavchahal2002kc-gmailcoms-projects.vercel.app",
    "https://sristi-kheduth-git-419fa9-keshavchahal2002kc-gmailcoms-projects.vercel.app",
    "https://vendor-app-8wrx.onrender.com"
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    console.log(`Origin ${origin} not allowed by CORS`);
  }

  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).json({});
  }

  next();
};