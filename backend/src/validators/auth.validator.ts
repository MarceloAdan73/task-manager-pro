import { z } from 'zod';

// Schema para login
export const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Please enter a valid email address')
      .min(1, 'Email is required')
      .max(100, 'Email is too long'),
    
    password: z.string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password is too long')
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d)/,
        'Password must contain at least one letter and one number'
      ),
  })
});

export type LoginInput = z.infer<typeof loginSchema>;

// Schema para registro
export const registerSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name is too long'),
    
    email: z.string()
      .email('Please enter a valid email address')
      .min(1, 'Email is required')
      .max(100, 'Email is too long'),
    
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password is too long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
  })
});

export type RegisterInput = z.infer<typeof registerSchema>;
