// Vercel serverless entry point — imports the compiled Express app from dist/
// dist/ is built by `npm run build` (tsc + tsc-alias) before Vercel deploys this file
const app = require('../dist/index').default;
module.exports = app;
