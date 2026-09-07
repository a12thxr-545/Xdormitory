import { getDb } from '@/server/db';
import { User } from '@/types';

export class AuthService {
  static getUserById(id: string): User | null {
    const db = getDb();
    const user = db.prepare('SELECT id, username, name, email, phone, idCard, role, authProvider, avatarUrl, createdAt FROM users WHERE id = ?').get(id) as User | undefined;
    return user || null;
  }

  static getUserByRole(role: 'user' | 'admin'): User | null {
    const db = getDb();
    const user = db.prepare('SELECT id, username, name, email, phone, idCard, role, authProvider, avatarUrl, createdAt FROM users WHERE role = ? LIMIT 1').get(role) as User | undefined;
    return user || null;
  }

  static login(identifier: string, password: string): User {
    const db = getDb();
    const cleanId = (identifier || '').trim().toLowerCase();

    if (!cleanId || !password) {
      throw new Error('กรุณากรอกชื่อผู้ใช้/อีเมล และรหัสผ่าน');
    }

    const user = db.prepare(`
      SELECT * FROM users 
      WHERE LOWER(email) = ? OR LOWER(username) = ? OR LOWER(name) = ?
    `).get(cleanId, cleanId, cleanId) as any;

    if (!user || user.password !== password) {
      throw new Error('ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง');
    }

    const { password: _, ...safeUser } = user;
    return safeUser as User;
  }

  static socialLogin(data: {
    provider: 'google' | 'line';
    email?: string;
    name: string;
    avatarUrl?: string;
    socialId?: string;
  }): User {
    const db = getDb();
    const { provider, email, name, avatarUrl = '', socialId = '' } = data;

    const normalizedEmail = (email || `${provider}_${socialId || Date.now()}@xdormitory.com`).toLowerCase().trim();
    
    // Check if user already exists
    let user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(normalizedEmail) as any;

    if (user) {
      if (avatarUrl && !user.avatarUrl) {
        db.prepare('UPDATE users SET avatarUrl = ? WHERE id = ?').run(avatarUrl, user.id);
        user.avatarUrl = avatarUrl;
      }
      const { password: _, ...safeUser } = user;
      return safeUser as User;
    }

    // New user via Google / LINE
    const id = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const createdAt = new Date().toISOString();
    const baseUsername = (email ? email.split('@')[0] : `${provider}_user`).toLowerCase().replace(/[^a-z0-9_]/g, '');
    const username = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;
    const phone = '080-000-0000';
    const randomPassword = 'social_pwd_' + Math.random().toString(36);

    db.prepare(`
      INSERT INTO users (id, username, name, email, password, phone, role, authProvider, avatarUrl, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, 'user', ?, ?, ?)
    `).run(id, username, name || `${provider.toUpperCase()} User`, normalizedEmail, randomPassword, phone, provider, avatarUrl, createdAt);

    return {
      id,
      username,
      name: name || `${provider.toUpperCase()} User`,
      email: normalizedEmail,
      phone,
      role: 'user',
      authProvider: provider,
      avatarUrl,
      createdAt,
    };
  }

  static register(data: {
    name: string;
    username?: string;
    email: string;
    password: string;
    phone: string;
    idCard?: string;
    role?: 'user' | 'admin';
  }): User {
    const db = getDb();
    const { name, username: rawUsername, email, password, phone, idCard = '' } = data;
    // Public registration always assigns 'user' role. Admin role must be granted from backoffice only!
    const role = 'user';

    if (!name || !email || !password || !phone) {
      throw new Error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(normalizedEmail);
    if (existing) {
      throw new Error('อีเมลนี้ถูกใช้งานแล้วในระบบ');
    }

    const username = (rawUsername || email.split('@')[0]).trim().toLowerCase();
    const existingUsername = db.prepare('SELECT id FROM users WHERE LOWER(username) = ?').get(username);
    if (existingUsername) {
      throw new Error('ชื่อผู้ใช้นี้ (Username) ถูกใช้งานแล้ว');
    }

    const id = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const createdAt = new Date().toISOString();
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;

    db.prepare(`
      INSERT INTO users (id, username, name, email, password, phone, idCard, role, authProvider, avatarUrl, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'local', ?, ?)
    `).run(id, username, name, normalizedEmail, password, phone, idCard, role, avatarUrl, createdAt);

    return { id, username, name, email: normalizedEmail, phone, idCard, role, authProvider: 'local', avatarUrl, createdAt };
  }

  static updateProfile(id: string, name: string, phone: string, idCard?: string): User {
    const db = getDb();
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!user) {
      throw new Error('ไม่พบบัญชีผู้ใช้');
    }

    db.prepare(`
      UPDATE users
      SET name = ?, phone = ?, idCard = ?
      WHERE id = ?
    `).run(name, phone, idCard || '', id);

    return this.getUserById(id)!;
  }
}
