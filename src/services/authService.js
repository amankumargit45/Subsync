const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/password');
const env = require('../config/env');

class AuthService {
  async register({ name, email, password, role }) {
    const existing = await User.findOne({ email });
    if (existing) {
      const err = new Error('Email already registered.');
      err.statusCode = 409;
      err.code = 'DUPLICATE_EMAIL';
      throw err;
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, passwordHash, role });
    const token = this._generateToken(user);
    return { user, token };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    if (!user.isActive) {
      const err = new Error('Account is deactivated.');
      err.statusCode = 401;
      err.code = 'ACCOUNT_DEACTIVATED';
      throw err;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const token = this._generateToken(user);
    return { user, token };
  }

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return user;
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether user exists
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // Try sending email, fall back to console logging
    try {
      const emailService = require('./emailService');
      await emailService.sendPasswordReset(user.email, user.name, resetUrl);
    } catch (emailErr) {
      if (env.isDev) {
        console.log('========================================');
        console.log('🔑 PASSWORD RESET (DEV MODE)');
        console.log(`   User: ${user.email}`);
        console.log(`   Token: ${resetToken}`);
        console.log(`   URL: ${resetUrl}`);
        console.log('========================================');
      }
    }

    return { message: 'If the email exists, a reset link has been sent.' };
  }

  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      const err = new Error('Invalid or expired reset token.');
      err.statusCode = 400;
      err.code = 'INVALID_TOKEN';
      throw err;
    }

    user.passwordHash = await hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password reset successful.' };
  }

  _generateToken(user) {
    return jwt.sign(
      { userId: user._id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  }
}

module.exports = new AuthService();
