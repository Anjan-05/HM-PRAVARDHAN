/**
 * HM Pravardhan Backend - Authentication & Role Authorization Middleware
 * Enforces role isolation and access boundaries across:
 * - VISITOR (Public Read-Only)
 * - HEADMASTER (Institutional Evaluation & Student Management)
 * - MEO (Mandal Level Inspection & Review)
 * - DEO (District Level Administration & Final Verification)
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../../shared/types/index.ts';

export interface AuthenticatedRequest extends Request {
  userRole?: UserRole;
  userId?: string;
  userDistrict?: string;
  userMandal?: string;
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const roleHeader = (req.headers['x-user-role'] as UserRole) || 'VISITOR';
    if (!allowedRoles.includes(roleHeader)) {
      return res.status(403).json({
        error: 'Access denied: insufficient institutional role permissions',
        requiredRoles: allowedRoles,
        providedRole: roleHeader,
      });
    }
    req.userRole = roleHeader;
    next();
  };
}

export function requireHeadmaster(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return requireRole(['HEADMASTER'])(req, res, next);
}

export function requireEducationOfficer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return requireRole(['MEO', 'DEO'])(req, res, next);
}
