const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/judgements',
    createProxyMiddleware({
      target: 'https://9001a55425e2.ngrok-free.app',
      changeOrigin: true,
      secure: false,
      onProxyReq: function(proxyReq, req, res) {
        // Add custom headers to bypass ngrok warning
        proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        proxyReq.setHeader('Accept', 'application/json');
        console.log('Proxying request to:', proxyReq.path);
      },
      onProxyRes: function(proxyRes, req, res) {
        console.log('Received response with status:', proxyRes.statusCode);
      },
      onError: function(err, req, res) {
        console.error('Proxy error:', err);
      },
      logLevel: 'debug'
    })
  );
};

