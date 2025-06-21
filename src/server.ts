import http from 'http';
import  logger  from './utils/logger.ts';
import app from './app.ts';


// 获取端口并转换为数字类型
const port = Number(process.env.PORT || 8000);

// 创建HTTP服务器
const server = http.createServer(app);


// 启动服务器
server.listen(Number(port), '0.0.0.0', () => {
  const address = server.address();
  const actualPort = typeof address === 'string' ? address : address?.port;
  logger.info(`服务器运行在 ${process.env.NODE_ENV} 模式`);
  logger.info(`服务器启动成功，监听地址: http://0.0.0.0:${actualPort}`);
  logger.info(`本地访问: http://localhost:${actualPort}`);
});

// 处理服务器错误
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      logger.error(`端口 ${port} 需要提升权限`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`端口 ${port} 已被占用`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});