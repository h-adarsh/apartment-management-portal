import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { generateToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../middleware/auth';
import { Role } from '@prisma/client';

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { flat: true }
    });

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      approvalStatus: user.approvalStatus,
      flatId: user.flat?.id || null,
      unitNumber: user.flat?.unitNumber || null
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        occupancyType: user.occupancyType,
        approvalStatus: user.approvalStatus,
        flat: user.flat ? {
          id: user.flat.id,
          unitNumber: user.flat.unitNumber,
          floorNumber: user.flat.floorNumber,
          superBuiltUpSqFt: user.flat.superBuiltUpSqFt,
          occupancyType: user.flat.occupancyType,
          occupantCount: user.flat.occupantCount
        } : null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const {
      fullName,
      email,
      phone,
      unitNumber,
      superBuiltUpSqFt,
      occupancyType,
      occupantCount,
      password,
      passwordConfirmation
    } = req.body;

    // 1. Mandatory field validations
    if (!fullName?.trim()) {
      res.status(400).json({ success: false, message: 'Full name is required.' });
      return;
    }
    if (!email?.trim()) {
      res.status(400).json({ success: false, message: 'Email address is required.' });
      return;
    }
    if (!phone?.trim()) {
      res.status(400).json({ success: false, message: 'Mobile number is required for urgent communications.' });
      return;
    }
    if (!unitNumber) {
      res.status(400).json({ success: false, message: 'Flat number must be selected.' });
      return;
    }
    if (!password) {
      res.status(400).json({ success: false, message: 'Password is required.' });
      return;
    }
    if (passwordConfirmation && password !== passwordConfirmation) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
      return;
    }

    // 3. Find the selected flat
    const flat = await prisma.flat.findUnique({
      where: { unitNumber: String(unitNumber).trim() }
    });

    if (!flat) {
      res.status(404).json({ success: false, message: `Unit ${unitNumber} was not found in the building registry.` });
      return;
    }

    // 4. Security Enforcement: NEVER allow self-assignment of privileged roles.
    // Role is strictly fixed to RESIDENT.
    const userRole = Role.RESIDENT;

    // 5. Verification status: Set to PENDING by default to prevent unauthorized access
    const validOccupancy = occupancyType === 'TENANT' ? 'TENANT' : 'OWNER';
    const parsedOccupantCount = Math.max(1, parseInt(occupantCount, 10) || 1);
    const parsedArea = superBuiltUpSqFt && Number(superBuiltUpSqFt) > 0 ? Number(superBuiltUpSqFt) : flat.superBuiltUpSqFt;

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        fullName: fullName.trim(),
        phone: phone.trim(),
        passwordHash,
        role: userRole,
        occupancyType: validOccupancy,
        approvalStatus: 'PENDING',
        flatId: flat.id
      }
    });

    // Separate occupancy count and manual flat area on Flat from user accounts
    await prisma.flat.update({
      where: { id: flat.id },
      data: {
        superBuiltUpSqFt: parsedArea,
        carpetSqFt: Math.round(parsedArea * 0.8),
        occupantCount: parsedOccupantCount,
        occupancyType: validOccupancy,
        // If the flat has no primary resident linked yet, assign this user
        ...(flat.residentId ? {} : { residentId: newUser.id })
      }
    });

    // Issue JWT cookie so session starts in PENDING mode
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      approvalStatus: newUser.approvalStatus,
      flatId: flat.id,
      unitNumber: flat.unitNumber
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully. Awaiting administrator verification.',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        phone: newUser.phone,
        role: newUser.role,
        occupancyType: newUser.occupancyType,
        approvalStatus: newUser.approvalStatus,
        flat: {
          id: flat.id,
          unitNumber: flat.unitNumber,
          floorNumber: flat.floorNumber,
          superBuiltUpSqFt: parsedArea,
          occupancyType: validOccupancy,
          occupantCount: parsedOccupantCount
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed due to server error.' });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('token');
  res.json({ success: true, message: 'Signed out successfully' });
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { flat: true }
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        occupancyType: user.occupancyType,
        approvalStatus: user.approvalStatus,
        flat: user.flat ? {
          id: user.flat.id,
          unitNumber: user.flat.unitNumber,
          floorNumber: user.flat.floorNumber,
          superBuiltUpSqFt: user.flat.superBuiltUpSqFt,
          occupancyType: user.flat.occupancyType,
          occupantCount: user.flat.occupantCount
        } : null
      }
    });
  } catch (error) {
    console.error('GetCurrentUser error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// Public endpoint for registration dropdowns (Floor then Flat cascading)
export async function getBuildingUnits(_req: Request, res: Response): Promise<void> {
  try {
    const flats = await prisma.flat.findMany({
      select: {
        id: true,
        unitNumber: true,
        floorNumber: true,
        superBuiltUpSqFt: true
      },
      orderBy: { unitNumber: 'asc' }
    });

    const floors = [1, 2, 3, 4].map(floor => ({
      floor,
      units: flats.filter(f => f.floorNumber === floor).map(f => f.unitNumber)
    }));

    res.json({ success: true, floors });
  } catch (error) {
    console.error('GetBuildingUnits error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve building units.' });
  }
}

// ADMIN ONLY: View pending resident registrations
export async function getPendingRegistrations(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
      return;
    }

    const pending = await prisma.user.findMany({
      where: { approvalStatus: 'PENDING' },
      include: { flat: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, registrations: pending });
  } catch (error) {
    console.error('GetPendingRegistrations error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve pending registrations.' });
  }
}

// ADMIN ONLY: Approve or Reject resident registration
export async function reviewRegistration(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
      return;
    }

    const { userId } = req.params;
    const { action } = req.body; // 'APPROVE' or 'REJECT'

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { flat: true }
    });

    if (!targetUser) {
      res.status(404).json({ success: false, message: 'Registration not found.' });
      return;
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        approvalStatus: newStatus
      }
    });

    // If approved and flat has no residentId, link it
    if (action === 'APPROVE' && targetUser.flatId) {
      const flat = await prisma.flat.findUnique({ where: { id: targetUser.flatId } });
      if (flat && !flat.residentId) {
        await prisma.flat.update({
          where: { id: flat.id },
          data: { residentId: targetUser.id }
        });
      }
    }

    res.json({
      success: true,
      message: `Registration for ${targetUser.fullName} (Flat ${targetUser.flat?.unitNumber}) ${newStatus.toLowerCase()} successfully.`,
      user: updated
    });
  } catch (error) {
    console.error('ReviewRegistration error:', error);
    res.status(500).json({ success: false, message: 'Failed to review registration.' });
  }
}

// Quick demo / helper account list for easy evaluation
export async function getDemoAccounts(_req: Request, res: Response): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      where: { approvalStatus: 'APPROVED' },
      include: { flat: true },
      orderBy: [{ role: 'asc' }, { email: 'asc' }]
    });

    const accounts = users.map(u => ({
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      unitNumber: u.flat?.unitNumber || null,
      defaultPassword: u.role === 'ADMIN' ? 'admin123' : u.role === 'STAFF' ? 'staff123' : 'resident123'
    }));

    res.json({ success: true, accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch demo accounts' });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { fullName, phone } = req.body;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: fullName?.trim() || undefined,
        phone: phone?.trim() || undefined
      },
      include: { flat: true }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        phone: updated.phone,
        role: updated.role,
        occupancyType: updated.occupancyType,
        approvalStatus: updated.approvalStatus,
        flat: updated.flat
      }
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
}

export async function changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current password and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Incorrect current password' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash }
    });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('ChangePassword error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
}

