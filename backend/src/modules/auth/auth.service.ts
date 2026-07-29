import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRepository, authRepository } from './auth.repository.js';
import { RegisterDTO, LoginDTO } from './dto/auth.dto.js';
import { AuthResponse, AuthUserResponse } from './interfaces/auth.interface.js';
import { IUser } from '../../shared/models/User.js';
import { generateSequenceId } from '../../shared/helpers/sequence.helper.js';

export class AuthService {
  constructor(private repository: AuthRepository = authRepository) {}

  private mapUserToResponse(user: IUser): AuthUserResponse {
    return {
      id: user._id.toString(),
      userId: user.userId,
      farmerId: user.farmerId,
      processorId: user.processorId,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      verificationStatus: user.verificationStatus,
      averageRating: user.averageRating || 0,
      reviewCount: user.reviewCount || 0,
      profilePhoto: user.profilePhoto,
      createdAt: user.createdAt,
    };
  }

  private generateJWT(user: IUser): string {
    const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
    return jwt.sign(
      {
        id: user._id.toString(),
        userId: user.userId || user.farmerId || user.processorId,
        role: user.role,
        email: user.email,
        phone: user.phone,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );
  }

  async register(dto: RegisterDTO): Promise<AuthResponse> {
    const role = dto.role || 'FARMER';

    // 1. Check duplicate Phone in MongoDB Atlas
    const existingPhone = await this.repository.findUserByPhone(dto.phone);
    if (existingPhone) {
      throw new Error(`User with phone number '${dto.phone}' already registered.`);
    }

    // 2. Check duplicate Email in MongoDB Atlas (if provided)
    if (dto.email && dto.email.trim() !== '') {
      const existingEmail = await this.repository.findUserByEmail(dto.email);
      if (existingEmail) {
        throw new Error(`User with email '${dto.email}' already registered.`);
      }
    }

    // 3. Hash Password
    const plainPassword = dto.password || 'Seed2Shelf@123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 4. Generate Role-based Sequence User ID
    let farmerId: string | undefined;
    let processorId: string | undefined;
    let userId: string | undefined;

    if (role === 'FARMER') {
      farmerId = await generateSequenceId('FRM');
      userId = farmerId;
    } else if (role === 'PROCESSOR') {
      processorId = await generateSequenceId('PRC');
      userId = processorId;
    } else if (role === 'DISTRIBUTOR') {
      userId = await generateSequenceId('DST');
    } else if (role === 'RETAILER') {
      userId = await generateSequenceId('RTL');
    } else if (role === 'CUSTOMER') {
      userId = await generateSequenceId('CST');
    } else if (role === 'ADMIN') {
      userId = await generateSequenceId('ADM');
    }

    // 5. Save Document in MongoDB Atlas
    const newUser = await this.repository.createUser({
      userId,
      farmerId,
      processorId,
      fullName: dto.fullName.trim(),
      email: dto.email ? dto.email.toLowerCase().trim() : undefined,
      phone: dto.phone.trim(),
      password: hashedPassword,
      role,
      gender: dto.gender,
    });

    const token = this.generateJWT(newUser);

    return {
      user: this.mapUserToResponse(newUser),
      token,
      expiresIn: '7d',
    };
  }

  async login(dto: LoginDTO): Promise<AuthResponse> {
    const identifier = dto.identifier.trim();
    const user = await this.repository.findUserByIdentifier(identifier);

    if (!user) {
      throw new Error(`Invalid credentials. Account '${identifier}' not found on Seed2Shelf.`);
    }

    // Compare Password if password provided & user has password set
    if (dto.password && user.password) {
      const isMatch = await bcrypt.compare(dto.password, user.password);
      if (!isMatch) {
        throw new Error('Invalid credentials. Password verification failed.');
      }
    }

    const token = this.generateJWT(user);

    return {
      user: this.mapUserToResponse(user),
      token,
      expiresIn: '7d',
    };
  }

  async getCurrentUser(id: string): Promise<AuthUserResponse> {
    const user = await this.repository.findUserById(id);
    if (!user) {
      throw new Error(`User with ID '${id}' not found in MongoDB Atlas.`);
    }
    return this.mapUserToResponse(user);
  }
}

export const authService = new AuthService();
