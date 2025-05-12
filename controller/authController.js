const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { sendOTPEmail } = require('../service/sendEmail');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // set in .env
const base = require("../config/airtable");
const tableName = process.env.AIRTABLE_TABLE_NAME;


exports.googleLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) return res.status(400).json({ message: 'No token provided' });

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = new User({
        email,
        password: hashedPassword,
        isVerified: true, // because it is verified by the google 
        name,
        photo: picture,
        authProvider: 'google'
      });

      await user.save();

      try {
        base(tableName).create([
          {
            fields: {
              email,
              name,
              Resume_url: picture, // saving photo URL as resume_url?
            },
          },
        ], function (err, records) {
          if (err) {
            console.error('Airtable error:', err);
          } else {
            console.log('Saved to Airtable:', records[0].getId());
          }
        });
      } catch (err) {
        console.error('Airtable insert failed:', err.message);
      }
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(401).json({ message: 'Invalid Google token' });
  }
};



exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  let user = await User.findOne({ email });

  if (!user) {
    user = new User({ email });
  }

  user.otp = otp;
  user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min from now
  await user.save();

  await sendOTPEmail(email, otp);
  res.status(200).json({ message: 'OTP sent to email' });
};


exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'User not found' });

  if (user.otp !== otp || user.otpExpiresAt < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  user.otp = undefined; // clear OTP immediately
  user.otpExpiresAt = undefined;
  user.isVerified = true;
  await user.save();

  res.status(200).json({ message: 'OTP verified' });
};

exports.setPassword = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (!user.isVerified) return res.status(400).json({ message: 'User is not verified' });

  user.password = await bcrypt.hash(password, 10);
  await user.save();

  try {
    base(tableName).create([
      {
        fields: {
          email,
          // name,
          // Resume_url: picture, // saving photo URL as resume_url?
        },
      },
    ], function (err, records) {
      if (err) {
        console.error('Airtable error:', err);
      } else {
        console.log('Saved to Airtable:', records[0].getId());
      }
    });
  } catch (err) {
    console.error('Airtable insert failed:', err.message);
  }

  res.status(200).json({ message: 'Password set successfully' });
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'User not found' });
  if (!user.isVerified) return res.status(403).json({ message: 'Email not verified' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  res.status(200).json({ token });
};
