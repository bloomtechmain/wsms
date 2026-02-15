import app from './app';
import { autoMigrate } from './utils/autoMigrate';

const PORT = process.env.PORT || 3000;

/**
 * Initialize database and start server
 * Auto-migration runs on first deployment to create tables and seed initial data
 */
async function startServer() {
  try {
    // Run auto-migration before starting server
    console.log('🚀 Starting WSMS Server...');
    await autoMigrate();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log('✅ Server is running on port', PORT);
      console.log('📡 Health check available at /health');
      console.log('🔒 API endpoints available at /api/*');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

