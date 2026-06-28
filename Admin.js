const bcrypt = require('bcryptjs');
const { query } = require('./database');

const Admin = {
  async findByUsername(username) {
    const rows = await query('SELECT * FROM admins WHERE username = ?', [username]);
    return rows[0] || null;
  },

  async create(username, password) {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
      [username, passwordHash]
    );
    return { id: result.insertId, username };
  },

  async verifyPassword(plainPassword, passwordHash) {
    return bcrypt.compare(plainPassword, passwordHash);
  },

  async ensureDefaultAdmin(username, password) {
    const existing = await this.findByUsername(username);
    if (!existing) {
      await this.create(username, password);
      return true;
    }
    return false;
  },
};

module.exports = Admin;
