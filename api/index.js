// Register module-alias before any other require so ~/... paths resolve
// even if tsc-alias didn't rewrite them during the Vercel build step.
require('module-alias/register');

// Vercel serverless entry point — imports the compiled Express app from dist/
// dist/ is built by `npm run build` (tsc + tsc-alias) before Vercel deploys this file
const app = require('../dist/index').default;
module.exports = app;
