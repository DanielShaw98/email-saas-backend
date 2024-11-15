import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;
  console.log("Registration data received:", { firstName, lastName, email, password });  // Log the request body

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ firstName, lastName, email, password });
    console.log("User object to be saved:", user);  // Log the user object before saving

    const newUser = await user.save();
    console.log("New user saved:", newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser._id, firstName: newUser.firstName, lastName: newUser.lastName },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    console.log('Login attempt with email:', email);  // Log email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');  // Log if user isn't found
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch');  // Log if password doesn't match
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token, expiresIn: new Date(Date.now() + 60 * 60 * 1000) });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
