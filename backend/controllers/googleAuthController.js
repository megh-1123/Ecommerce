import { OAuth2Client } from "google-auth-library";

import jwt from "jsonwebtoken";
import User from "../models/User.js";

 
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
   
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @route  POST /api/auth/google
// @desc   Verify a Google ID token, find-or-create the user, return our own JWT
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body; // the ID token sent from the frontend button

    if (!credential) {
      return res.status(400).json({ message: "Missing Google credential" });
    }

    // Verifies the token's signature and that it was issued for OUR client id.
    // This is the step that actually proves the token is genuine — never skip it.
    const ticket = await client.verifyIdToken({
      idToken: credential,
       
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Find by googleId first, then fall back to matching an existing
    // email/password account so the same person doesn't end up with two accounts.
    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        // Existing email/password account — link the Google id to it
        user.googleId = googleId;
        await user.save();
      } else {
        // Brand new user
        user = await User.create({ name, email, googleId });
      }
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
    
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Google authentication failed" });
  }
};