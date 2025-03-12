export const corsMiddleware = (req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://sristi-kheduthaat.vercel.app",
    "https://sristi-kheduthaat-keshavchahal2002kc-gmailcoms-projects.vercel.app",
    "https://sristi-kheduth-git-419fa9-keshavchahal2002kc-gmailcoms-projects.vercel.app",
    "https://vendor-app-8wrx.onrender.com"
  ];

  const origin = req.headers.origin;
  
  // Handle same-origin requests and undefined origins
  if (!origin || origin === `http://${req.headers.host}` || origin === `https://${req.headers.host}`) {
    // Allow same-origin requests and undefined origins
    return next();
  }

  // Check if origin is allowed
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    console.warn(`Origin ${origin} not allowed by CORS`);
    return res.status(403).json({ 
      message: 'CORS policy: Origin not allowed',
      allowedOrigins
    });
  }

  // Set CORS headers
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).json({});
  }

  next();
};
