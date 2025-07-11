import { app } from './app';
import { config } from './config';

const start = async () => {
  try {
    await app.ready();
    
    await app.listen({ 
      port: config.PORT, 
      host: config.HOST 
    });
    
    console.log(`Servidor rodando na porta ${config.PORT}`);
  } catch (err) {
    app.log.error(err);
    console.error('Erro ao iniciar servidor:', err);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  process.exit(1);
});

start(); 