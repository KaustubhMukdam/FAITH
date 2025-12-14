import pool from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { User, UserCreateInput, ErrorCodes } from '@faith/shared';
import { UserRow, UserPreferencesRow, toUser } from '../models/User';

export class UserService {
  // Create new user
  static async createUser(data: UserCreateInput): Promise<User> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if email already exists
      const emailCheck = await client.query('SELECT id FROM users WHERE email = $1', [
        data.email,
      ]);

      if (emailCheck.rows.length > 0) {
        throw {
          code: ErrorCodes.USER_ALREADY_EXISTS,
          message: 'Email already registered',
          statusCode: 409,
        };
      }

      // Check if phone already exists
      const phoneCheck = await client.query('SELECT id FROM users WHERE phone = $1', [
        data.phone,
      ]);

      if (phoneCheck.rows.length > 0) {
        throw {
          code: ErrorCodes.USER_ALREADY_EXISTS,
          message: 'Phone number already registered',
          statusCode: 409,
        };
      }

      // Hash password
      const passwordHash = await hashPassword(data.password);

      // Insert user
      const userResult = await client.query<UserRow>(
        `INSERT INTO users (email, phone, name, password_hash, kyc_status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [data.email, data.phone, data.name, passwordHash, 'PENDING']
      );

      const user = userResult.rows[0];

      // Create default preferences
      const preferencesResult = await client.query<UserPreferencesRow>(
        `INSERT INTO user_preferences (user_id)
         VALUES ($1)
         RETURNING *`,
        [user.id]
      );

      await client.query('COMMIT');

      return toUser(user, preferencesResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Find user by email
  static async findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const result = await pool.query<UserRow>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];

    // Get preferences
    const preferencesResult = await pool.query<UserPreferencesRow>(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [user.id]
    );

    const userObj = toUser(user, preferencesResult.rows[0]);

    return {
      ...userObj,
      passwordHash: user.password_hash,
    };
  }

  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    const result = await pool.query<UserRow>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];

    // Get preferences
    const preferencesResult = await pool.query<UserPreferencesRow>(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [user.id]
    );

    return toUser(user, preferencesResult.rows[0]);
  }

  // Verify password
  static async verifyPassword(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = await this.findByEmail(email);

    if (!user) {
      return null;
    }

    const isValid = await comparePassword(password, user.passwordHash);

    if (!isValid) {
      return null;
    }

    // Remove passwordHash before returning
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Update last login
  static async updateLastLogin(userId: string): Promise<void> {
    await pool.query(
      'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );
  }
}
