const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'admin' 
    });

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'supersecretjwykey2026',
      { expiresIn: '15m' }
    );

    return res.json({ token, role: user.role, name: user.name });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { email } = req.body;
    
    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(403).json({ message: 'Acceso Denegado. El usuario no existe en la base de datos.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const mfaExpires = new Date(Date.now() + 5 * 60 * 1000); 

    await user.update({ mfaCode: otpHash, mfaExpires });

    try {
      await transporter.sendMail({
        from: `"Sistema de Acceso" <${process.env.SMTP_USER || 'no-reply@ecommerce.com'}>`,
        to: user.email,
        subject: 'Código de verificación 2FA',
        text: `Tu código de acceso es: ${otp}. Expirará en 5 minutos.`,
        html: `<b>Tu código de acceso es: ${otp}</b><br/>Expirará en 5 minutos.`
      });
      console.log(`[DEBUG] Correo enviado a ${user.email} con OTP.`);
    } catch (emailError) {
      console.error('Error al enviar el correo:', emailError);
      console.log(`[DEBUG] El correo falló. OTP generado para ${user.email} es: ${otp}`);
    }

    return res.json({ requireOtp: true, email: user.email });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ message: 'Error autenticando con Google', error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !user.mfaCode) {
      return res.status(401).json({ message: 'No hay un código pendiente para este usuario' });
    }

    if (new Date() > new Date(user.mfaExpires)) {
      return res.status(401).json({ message: 'El código ha expirado' });
    }

    const isMatch = await bcrypt.compare(otp, user.mfaCode);
    if (!isMatch) {
      return res.status(401).json({ message: 'Código incorrecto' });
    }

    await user.update({ mfaCode: null, mfaExpires: null });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'supersecretjwykey2026',
      { expiresIn: '15m' }
    );

    return res.json({ token, role: user.role, name: user.name });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Error verificando OTP', error: error.message });
  }
};

module.exports = { register, login, googleLogin, verifyOtp };
