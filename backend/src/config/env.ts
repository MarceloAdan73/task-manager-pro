import { z } from 'zod';

// Environment variables validation schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().min(1, "DATABASE_URL is required"),
  
  // JWT
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  
  // Server
  PORT: z.string().default("3005").transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  
  // CORS
  FRONTEND_URL: z.string().url().default("http://localhost:3004"),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().default("900000").transform((val) => parseInt(val, 10)), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().default("100").transform((val) => parseInt(val, 10)),
});

// Types inferred from Zod
export type EnvConfig = z.infer<typeof envSchema>;

// Function to validate and load environment variables
export function loadEnvConfig(): EnvConfig {
  try {
    // Load variables (already in process.env via dotenv)
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
      PORT: process.env.PORT,
      NODE_ENV: process.env.NODE_ENV,
      FRONTEND_URL: process.env.FRONTEND_URL,
      RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
      RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
    };

    // Validate with Zod
    const validatedEnv = envSchema.parse(envVars);

    console.log("[OK] Environment variables validated successfully");
    console.log(`Environment: ${validatedEnv.NODE_ENV}`);
    console.log(`Server port: ${validatedEnv.PORT}`);
    console.log(`Frontend URL: ${validatedEnv.FRONTEND_URL}`);

    return validatedEnv;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("[ERROR] Environment validation failed:");
      error.issues.forEach((issue: any) => {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

// Export validated configuration
export const envConfig = loadEnvConfig();
