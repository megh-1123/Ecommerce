import jwt from "jsonwebtoken";

export const tokenBlocklist = new Set();

export const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      token = authHeader.split(" ")[1];

      if (tokenBlocklist.has(token)) {
        return res.status(401).json({ message: "Token has been logged out" });
      }

       
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      req.token = token;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};