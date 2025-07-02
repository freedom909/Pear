import { envExample } from '../config/env';

export const createEnvExampleFile = async () => {
  if (process.env.NODE_ENV === 'development') {
    const fs = await import('fs');
    const path = await import('path');
    try {
      const envExamplePath = path.join(process.cwd(), '.env.example');
      if (!fs.existsSync(envExamplePath)) {
        fs.writeFileSync(envExamplePath, envExample.trim());
      }
    } catch (err) {
      console.error('Error creating .env.example:', err);
    }
  }
};
