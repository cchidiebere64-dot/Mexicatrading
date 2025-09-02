import jwt from "jsonwebtoken";

/**
 * Generate a JWT token for a user
 * @param {string} id - User's MongoDB _id
 * @returns {string} - Signed JWT token
 */
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // token expires in 30 days
  });
};

export default generateToken;
