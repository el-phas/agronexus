export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const isDev = process.env.NODE_ENV === 'development';
  console.error(err);
  const message = status < 500 ? err.message : 'Internal server error';
  res.status(status).json({ error: message, ...(isDev ? { stack: err.stack } : {}) });
};

export default errorHandler;
