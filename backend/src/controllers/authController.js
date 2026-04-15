const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const { User, Client, PasswordResetToken } = require('../models');

const normalizePhone = (phone) => String(phone || '').replace(/\D/g, '');
const normalizeRecoveryPhone = (phone) => {
  const digits = normalizePhone(phone);
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return digits.slice(2);
  }
  return digits;
};
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RECOVERY_CHANNELS = ['email', 'sms'];

const RECOVERY_CODE_EXPIRY_MINUTES = Number(process.env.RECOVERY_CODE_EXPIRY_MINUTES || 10);
const RECOVERY_MAX_VERIFY_ATTEMPTS = Number(process.env.RECOVERY_MAX_VERIFY_ATTEMPTS || 5);
const RECOVERY_MAX_REQUESTS_PER_HOUR = Number(process.env.RECOVERY_MAX_REQUESTS_PER_HOUR || 5);
const RECOVERY_MIN_REQUEST_INTERVAL_SECONDS = Number(process.env.RECOVERY_MIN_REQUEST_INTERVAL_SECONDS || 60);

const recoveryRequestState = new Map();

const findUserByPhone = async (phone) => {
  const normalizedPhone = normalizePhone(phone);

  // Tentativa direta para registros novos (salvos sem máscara)
  let user = await User.findOne({ where: { phone: normalizedPhone } });
  if (user) return user;

  // Compatibilidade com registros antigos (salvos com máscara)
  const users = await User.findAll({ attributes: ['id', 'name', 'phone', 'email', 'password', 'role', 'isActive', 'profileImage', 'lastLogin'] });
  user = users.find((u) => normalizePhone(u.phone) === normalizedPhone) || null;

  return user;
};

// Geração de tokens
const generateTokens = (userId, role, email) => {
  const payload = { userId, role, email };
  
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  });

  return { accessToken, refreshToken };
};

const isValidPin = (pin) => /^\d{4,6}$/.test(String(pin || ''));
const isValidEmail = (email) => EMAIL_REGEX.test(normalizeEmail(email));
const isValidPhone = (phone) => {
  const normalized = normalizeRecoveryPhone(phone);
  return normalized.length >= 10 && normalized.length <= 11;
};
const normalizeRecoveryChannel = (channel) => (RECOVERY_CHANNELS.includes(channel) ? channel : 'email');

const isPlaceholderValue = (value, markers = []) => {
  const normalized = String(value || '').trim().toLowerCase();
  return !normalized || markers.some((marker) => normalized.includes(marker));
};

const getClientIp = (req) => {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.socket?.remoteAddress || 'unknown';
};

const generateRecoveryCode = () => String(crypto.randomInt(0, 1000000)).padStart(6, '0');

const hashRecoveryCode = (code) => {
  const pepper = process.env.JWT_SECRET || 'fallback-secret';
  return crypto.createHash('sha256').update(`${String(code)}.${pepper}`).digest('hex');
};

const checkRecoveryRateLimit = (identifier, ip) => {
  const now = Date.now();
  const key = `${identifier}:${ip}`;
  const existing = recoveryRequestState.get(key);
  const baseState = existing || {
    windowStartedAt: now,
    count: 0,
    lastRequestAt: 0
  };

  if (now - baseState.windowStartedAt > 60 * 60 * 1000) {
    baseState.windowStartedAt = now;
    baseState.count = 0;
  }

  const elapsedSinceLast = now - baseState.lastRequestAt;
  const minIntervalMs = RECOVERY_MIN_REQUEST_INTERVAL_SECONDS * 1000;
  if (elapsedSinceLast < minIntervalMs) {
    const retryAfterSeconds = Math.max(1, Math.ceil((minIntervalMs - elapsedSinceLast) / 1000));
    return {
      allowed: false,
      retryAfterSeconds
    };
  }

  if (baseState.count >= RECOVERY_MAX_REQUESTS_PER_HOUR) {
    const retryAfterSeconds = Math.max(1, Math.ceil((60 * 60 * 1000 - (now - baseState.windowStartedAt)) / 1000));
    return {
      allowed: false,
      retryAfterSeconds
    };
  }

  baseState.count += 1;
  baseState.lastRequestAt = now;
  recoveryRequestState.set(key, baseState);

  return { allowed: true };
};

const getMailTransporter = async () => {
  const transportMode = String(
    process.env.SMTP_TRANSPORT || (process.env.NODE_ENV === 'production' ? 'smtp' : 'auto')
  ).toLowerCase();
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;
  const hasPlaceholderConfig =
    isPlaceholderValue(host, ['smtp.gmail.com']) ||
    isPlaceholderValue(user, ['seu_email@gmail.com', 'example.com']) ||
    isPlaceholderValue(pass, ['sua_senha_app', 'password']) ||
    isPlaceholderValue(from, ['noreply@carolinanaildesign.com']);

  if (transportMode === 'stream') {
    return {
      mode: 'stream',
      transporter: nodemailer.createTransport({
        streamTransport: true,
        buffer: true,
        newline: 'unix'
      })
    };
  }

  if (transportMode === 'ethereal') {
    const testAccount = await nodemailer.createTestAccount();

    return {
      mode: 'ethereal',
      transporter: nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      })
    };
  }

  if (transportMode === 'auto' && process.env.NODE_ENV !== 'production') {
    const testAccount = await nodemailer.createTestAccount();

    return {
      mode: 'ethereal',
      transporter: nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      })
    };
  }

  if (!host || !user || !pass || hasPlaceholderConfig) {
    return {
      mode: 'dev-missing-smtp',
      transporter: null
    };
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });
};

const sendRecoveryCodeEmail = async ({ email, name, code }) => {
  const mailConfig = await getMailTransporter();
  const transporter = mailConfig?.transporter;
  const expiresIn = RECOVERY_CODE_EXPIRY_MINUTES;

  if (!transporter) {
    console.log(`[RECOVERY][DEV] Codigo para ${email}: ${code}`);
    return {
      sent: false,
      mode: mailConfig?.mode || 'dev-missing-smtp'
    };
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Recuperacao de PIN - Carolina Nail Design',
    text: `Olá, ${name || 'usuário'}!\n\nSeu código de recuperação é: ${code}\n\nEste código expira em ${expiresIn} minutos.\nSe você não solicitou, ignore este email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2>Recuperação de PIN</h2>
        <p>Olá, ${name || 'usuário'}.</p>
        <p>Use o código abaixo para recuperar seu PIN:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p>Este código expira em ${expiresIn} minutos.</p>
        <p>Se você não solicitou, ignore este email.</p>
      </div>
    `
  });

  return {
    sent: true,
    mode: mailConfig?.mode || 'smtp',
    messageId: info?.messageId || null,
    previewUrl: typeof nodemailer.getTestMessageUrl === 'function' ? nodemailer.getTestMessageUrl(info) : null
  };
};

const sendRecoveryCodeSms = async ({ phone, code }) => {
  const sender = process.env.SMS_SENDER || 'CarolinaNails';
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_FROM_PHONE;

  if (!accountSid || !authToken || !fromPhone) {
    console.log(`[RECOVERY][DEV][SMS] Codigo para ${phone}: ${code}`);
    return false;
  }

  const encoded = new URLSearchParams({
    To: `+55${phone}`,
    From: fromPhone,
    Body: `${sender}: seu codigo para recuperar o PIN e ${code}. Expira em ${RECOVERY_CODE_EXPIRY_MINUTES} minutos.`
  });

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: encoded.toString()
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Falha ao enviar SMS: ${text}`);
  }

  return true;
};

const findUserByPin = async (pin) => {
  const users = await User.findAll({
    where: { isActive: true },
    attributes: ['id', 'name', 'phone', 'email', 'password', 'role', 'isActive', 'profileImage', 'lastLogin'],
    order: [['createdAt', 'ASC']]
  });

  for (const user of users) {
    const isPinValid = await user.comparePassword(pin);
    if (isPinValid) {
      return user;
    }
  }

  // Compatibilidade: em modo de dono único, permite primeiro login com os 6 últimos dígitos do telefone.
  if (process.env.SINGLE_OWNER_MODE !== 'false' && users.length === 1) {
    const owner = users[0];
    const fallbackPin = normalizePhone(owner.phone).slice(-6);

    if (fallbackPin && pin === fallbackPin) {
      await owner.update({ password: pin });
      return owner;
    }
  }

  return null;
};

// Registro de novo usuário/cliente
const register = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    const sanitizedPhone = normalizePhone(phone);
    const role = 'admin';

    if (process.env.SINGLE_OWNER_MODE !== 'false') {
      const ownerCount = await User.count({ where: { role: 'admin' } });
      if (ownerCount > 0) {
        return res.status(409).json({
          error: 'Cadastro inicial ja foi realizado para esta base de dados. Para novo cadastro, use outro banco.'
        });
      }
    }

    // Validações
    if (!name || !sanitizedPhone || !password) {
      return res.status(400).json({ error: 'Nome, telefone e senha são obrigatórios' });
    }

    if (sanitizedPhone.length < 10 || sanitizedPhone.length > 11) {
      return res.status(400).json({ error: 'Telefone deve ter 10 ou 11 dígitos' });
    }

    if (!isValidPin(password)) {
      return res.status(400).json({ error: 'PIN deve ser numérico e ter de 4 a 6 dígitos' });
    }

    // Verificar se usuário já existe
    const existingUser = await findUserByPhone(sanitizedPhone);
    if (existingUser) {
      return res.status(409).json({ error: 'Telefone já registrado' });
    }

    // Criar usuário
    const user = await User.create({
      name,
      phone: sanitizedPhone,
      email,
      password,
      role
    });

    // Se for cliente, criar registro de cliente
    if (role === 'client') {
      await Client.create({
        userId: user.id
      });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.email);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const sanitizedPhone = normalizePhone(phone);

    if (!sanitizedPhone || !password) {
      return res.status(400).json({ error: 'Telefone e senha são obrigatórios' });
    }

    const user = await findUserByPhone(sanitizedPhone);
    
    if (!user) {
      return res.status(401).json({ error: 'Telefone ou senha inválidos' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Telefone ou senha inválidos' });
    }

    // Atualizar último login
    await user.update({ lastLogin: new Date() });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.email);

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

// Login com PIN (ate 6 digitos)
const loginWithPin = async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({ error: 'PIN é obrigatório' });
    }

    if (!isValidPin(pin)) {
      return res.status(400).json({ error: 'PIN deve ser numérico e ter de 4 a 6 dígitos' });
    }

    const user = await findUserByPin(String(pin));

    if (!user) {
      return res.status(401).json({ error: 'PIN inválido' });
    }

    await user.update({ lastLogin: new Date() });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.email);

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Erro no login por PIN:', error);
    res.status(500).json({ error: 'Erro ao fazer login por PIN' });
  }
};

// Alteração de PIN autenticada
const changePin = async (req, res) => {
  try {
    const { currentPin, newPin, confirmPin } = req.body;

    if (!currentPin || !newPin || !confirmPin) {
      return res.status(400).json({ error: 'PIN atual, novo PIN e confirmação são obrigatórios' });
    }

    if (!isValidPin(currentPin) || !isValidPin(newPin) || !isValidPin(confirmPin)) {
      return res.status(400).json({ error: 'PIN deve ser numérico e ter de 4 a 6 dígitos' });
    }

    if (newPin !== confirmPin) {
      return res.status(400).json({ error: 'Confirmação do novo PIN não confere' });
    }

    if (currentPin === newPin) {
      return res.status(400).json({ error: 'Novo PIN deve ser diferente do PIN atual' });
    }

    const user = await User.findByPk(req.user?.userId);

    if (!user || !user.isActive) {
      return res.status(404).json({ error: 'Usuário não encontrado ou inativo' });
    }

    const isCurrentPinValid = await user.comparePassword(String(currentPin));
    if (!isCurrentPinValid) {
      return res.status(401).json({ error: 'PIN atual inválido' });
    }

    await user.update({ password: String(newPin) });

    res.status(200).json({
      success: true,
      message: 'PIN alterado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar PIN:', error);
    res.status(500).json({ error: 'Erro ao alterar PIN' });
  }
};

// Refresh token
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token não fornecido' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.id,
      user.role,
      user.email
    );

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar token:', error);
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

// Login com biometria
const biometricLogin = async (req, res) => {
  try {
    const { phone, biometricToken } = req.body;
    const sanitizedPhone = normalizePhone(phone);

    if (!sanitizedPhone) {
      return res.status(400).json({ error: 'Telefone é obrigatório' });
    }

    const user = await findUserByPhone(sanitizedPhone);

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Aqui você pode adicionar lógica adicional de verificação de biometria
    // Para agora, apenas retornar token se o usuário existir
    
    await user.update({ lastLogin: new Date() });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.email);

    res.status(200).json({
      success: true,
      message: 'Login biométrico realizado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Erro no login biométrico:', error);
    res.status(500).json({ error: 'Erro ao fazer login biométrico' });
  }
};

const requestPinRecovery = async (req, res) => {
  const genericMessage = 'Se existir uma conta com os dados informados, enviaremos um código de recuperação.';

  try {
    const channel = normalizeRecoveryChannel(req.body?.channel);
    const email = normalizeEmail(req.body?.email);
    const phone = normalizeRecoveryPhone(req.body?.phone);
    const identifier = channel === 'sms' ? phone : email;

    if ((channel === 'email' && !isValidEmail(email)) || (channel === 'sms' && !isValidPhone(phone))) {
      return res.status(200).json({ success: true, message: genericMessage });
    }

    const ip = getClientIp(req);
    const rateLimit = checkRecoveryRateLimit(`${channel}:${identifier}`, ip);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: true,
        message: genericMessage,
        retryAfterSeconds: rateLimit.retryAfterSeconds
      });
    }

    const user = await User.findOne({
      where: {
        ...(channel === 'sms' ? { phone } : { email }),
        isActive: true
      },
      attributes: ['id', 'name', 'email', 'phone']
    });

    if (!user) {
      return res.status(200).json({ success: true, message: genericMessage });
    }

    const oneHourAgo = new Date(Date.now() - (60 * 60 * 1000));
    const requestCount = await PasswordResetToken.count({
      where: {
        userId: user.id,
        createdAt: { [Op.gte]: oneHourAgo }
      }
    });

    if (requestCount >= RECOVERY_MAX_REQUESTS_PER_HOUR) {
      return res.status(200).json({ success: true, message: genericMessage });
    }

    await PasswordResetToken.update(
      { usedAt: new Date() },
      {
        where: {
          userId: user.id,
          usedAt: null,
          expiresAt: { [Op.gt]: new Date() }
        }
      }
    );

    const code = generateRecoveryCode();
    const codeHash = hashRecoveryCode(code);
    const expiresAt = new Date(Date.now() + RECOVERY_CODE_EXPIRY_MINUTES * 60 * 1000);

    await PasswordResetToken.create({
      userId: user.id,
      channel,
      codeHash,
      attemptCount: 0,
      maxAttempts: RECOVERY_MAX_VERIFY_ATTEMPTS,
      expiresAt,
      requestedIp: ip
    });

    let deliveryResult = { sent: false, mode: 'dev-missing-smtp' };
    let deliveryMethod = channel;
    if (channel === 'sms') {
      deliveryResult = {
        sent: await sendRecoveryCodeSms({
        phone: user.phone,
        code
        }),
        mode: 'sms'
      };
    } else {
      deliveryResult = await sendRecoveryCodeEmail({
        email: user.email,
        name: user.name,
        code
      });
      deliveryMethod = 'email';
    }

    const response = {
      success: true,
      message: genericMessage
    };

    if (process.env.NODE_ENV !== 'production' && process.env.EXPOSE_RECOVERY_CODE === 'true') {
      response.debug = {
        recoveryCode: code,
        channel,
        deliveryMethod,
        deliverySent: deliveryResult.sent,
        deliveryMode: deliveryResult.mode,
        previewUrl: deliveryResult.previewUrl || null
      };
    } else if (process.env.NODE_ENV !== 'production' && !deliveryResult.sent) {
      response.warning = `Recuperacao em modo dev sem ${channel === 'sms' ? 'Twilio' : 'SMTP'} configurado. O codigo foi apenas registrado no log do backend.`;
    }

    if (deliveryResult.previewUrl) {
      response.previewUrl = deliveryResult.previewUrl;
    }

    if (channel === 'email' && (!deliveryResult.sent || deliveryResult.mode !== 'smtp')) {
      response.warning = `Email não enviado porque o SMTP não está configurado no backend. Configure SMTP_HOST, SMTP_USER e SMTP_PASSWORD no arquivo .env.`;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('Erro ao solicitar recuperacao de PIN:', error);
    return res.status(200).json({ success: true, message: genericMessage });
  }
};

const verifyPinRecoveryCode = async (req, res) => {
  try {
    const channel = normalizeRecoveryChannel(req.body?.channel);
    const email = normalizeEmail(req.body?.email);
    const phone = normalizeRecoveryPhone(req.body?.phone);
    const code = String(req.body?.code || '').replace(/\D/g, '').slice(0, 6);
    const identifier = channel === 'sms' ? phone : email;

    if (
      code.length !== 6 ||
      (channel === 'email' && !isValidEmail(email)) ||
      (channel === 'sms' && !isValidPhone(phone))
    ) {
      return res.status(400).json({ error: 'Identificador ou código inválido' });
    }

    const user = await User.findOne({
      where: {
        ...(channel === 'sms' ? { phone } : { email }),
        isActive: true
      },
      attributes: ['id', 'email', 'phone']
    });

    if (!user) {
      return res.status(400).json({ error: 'Código inválido ou expirado' });
    }

    const recovery = await PasswordResetToken.findOne({
      where: {
        userId: user.id,
        usedAt: null,
        channel
      },
      order: [['createdAt', 'DESC']]
    });

    if (!recovery) {
      return res.status(400).json({ error: 'Código inválido ou expirado' });
    }

    if (new Date(recovery.expiresAt).getTime() < Date.now()) {
      await recovery.update({ usedAt: new Date() });
      return res.status(400).json({ error: 'Código inválido ou expirado' });
    }

    if (recovery.attemptCount >= recovery.maxAttempts) {
      return res.status(429).json({ error: 'Limite de tentativas excedido. Solicite novo código.' });
    }

    const hashedCode = hashRecoveryCode(code);
    if (hashedCode !== recovery.codeHash) {
      await recovery.increment('attemptCount');
      const remainingAttempts = Math.max(0, recovery.maxAttempts - (recovery.attemptCount + 1));
      return res.status(400).json({
        error: remainingAttempts > 0
          ? `Código inválido. Tentativas restantes: ${remainingAttempts}`
          : 'Limite de tentativas excedido. Solicite novo código.'
      });
    }

    await recovery.update({ usedAt: new Date() });

    const resetToken = jwt.sign(
      {
        userId: user.id,
        purpose: 'pin-recovery',
        channel,
        identifier
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.PIN_RESET_TOKEN_EXPIRE || '10m'
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Código validado com sucesso',
      data: {
        resetToken
      }
    });
  } catch (error) {
    console.error('Erro ao validar codigo de recuperacao:', error);
    return res.status(500).json({ error: 'Erro ao validar código de recuperação' });
  }
};

const resetPinWithRecoveryToken = async (req, res) => {
  try {
    const { resetToken, newPin, confirmPin } = req.body;

    if (!resetToken || !newPin || !confirmPin) {
      return res.status(400).json({ error: 'Token de recuperação, novo PIN e confirmação são obrigatórios' });
    }

    if (!isValidPin(newPin) || !isValidPin(confirmPin)) {
      return res.status(400).json({ error: 'PIN deve ser numérico e ter de 4 a 6 dígitos' });
    }

    if (newPin !== confirmPin) {
      return res.status(400).json({ error: 'Confirmação do novo PIN não confere' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (tokenError) {
      return res.status(401).json({ error: 'Token de recuperação inválido ou expirado' });
    }

    if (decoded?.purpose !== 'pin-recovery' || !decoded?.userId) {
      return res.status(401).json({ error: 'Token de recuperação inválido' });
    }

    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(404).json({ error: 'Usuário não encontrado ou inativo' });
    }

    await user.update({ password: String(newPin) });
    await PasswordResetToken.update(
      { usedAt: new Date() },
      {
        where: {
          userId: user.id,
          usedAt: null
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: 'PIN redefinido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao redefinir PIN:', error);
    return res.status(500).json({ error: 'Erro ao redefinir PIN' });
  }
};

module.exports = {
  register,
  login,
  loginWithPin,
  changePin,
  refreshAccessToken,
  biometricLogin,
  requestPinRecovery,
  verifyPinRecoveryCode,
  resetPinWithRecoveryToken,
  generateTokens
};
