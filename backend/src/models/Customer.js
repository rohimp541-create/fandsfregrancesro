const { query } = require('../config/database');

function formatCustomer(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    address: row.address,
    created_at: row.created_at,
  };
}

const Customer = {
  async findAll() {
    const rows = await query('SELECT * FROM customers ORDER BY created_at DESC');
    return rows.map(formatCustomer);
  },

  async findById(id) {
    const rows = await query('SELECT * FROM customers WHERE id = ?', [id]);
    return formatCustomer(rows[0]);
  },

  async findByPhone(phone) {
    const rows = await query('SELECT * FROM customers WHERE phone = ? LIMIT 1', [phone]);
    return formatCustomer(rows[0]);
  },

  async create(data) {
    const result = await query(
      'INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)',
      [data.name, data.phone, data.address]
    );
    return this.findById(result.insertId);
  },

  async findOrCreate(data) {
    const existing = await this.findByPhone(data.phone);
    if (existing) {
      await query(
        'UPDATE customers SET name = ?, address = ? WHERE id = ?',
        [data.name, data.address, existing.id]
      );
      return this.findById(existing.id);
    }
    return this.create(data);
  },
};

module.exports = Customer;
