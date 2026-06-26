const { query } = require('../config/database');

const Setting = {
  async get(key) {
    const rows = await query('SELECT value FROM settings WHERE key = ?', [key]);
    return rows[0] ? rows[0].value : null;
  },

  async set(key, value) {
    const existing = await this.get(key);
    if (existing !== null) {
      await query('UPDATE settings SET value = ? WHERE key = ?', [value, key]);
    } else {
      await query('INSERT INTO settings (key, value) VALUES (?, ?)', [key, value]);
    }
  },

  async getAll() {
    const rows = await query('SELECT * FROM settings');
    const result = {};
    rows.forEach(r => {
      result[r.key] = r.value;
    });
    return result;
  },

  async ensureDefaultSettings() {
    const defaults = {
      offer_enabled: 'true',
      offer_text_ar: 'شحن مجاني للطلبات فوق 500 جنيه | منتجات أصلية 100%',
      offer_text_en: 'Free shipping on orders over 500 EGP | 100% Original Products',
      offer_type: 'banner'
    };

    for (const [key, val] of Object.entries(defaults)) {
      const current = await this.get(key);
      if (current === null) {
        await this.set(key, val);
      }
    }
  }
};

module.exports = Setting;
