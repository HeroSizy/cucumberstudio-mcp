import { build } from 'esbuild';
import { readFileSync, chmodSync } from 'fs';

// Simple ESBuild config for MCPB bundle
const config = {
  entryPoints: ['src/index.mcpb.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: 'bundle.js',
  minify: true,  // Enable minify for smaller bundle size
  sourcemap: false,
  treeShaking: true,
  
  // External Node.js built-ins and packages not needed in MCPB
  external: ['fs', 'path', 'os', 'crypto', 'util', 'events', 'dotenv'],
  
  // Simple banner
  banner: {
    js: '#!/usr/bin/env node\n',
  },
};

// Build function
async function buildMCPB() {
  try {
    console.log('🚀 Building MCPB bundle with ESBuild...');

    const result = await build(config);

    console.log('✅ MCPB bundle built successfully!');
    console.log(`📦 Output: bundle.js`);
    
    // Make bundle executable
    chmodSync('bundle.js', 0o755);
    console.log('🔧 Bundle made executable');
    
    // Show bundle analysis if available
    if (result.metafile) {
      console.log('📊 Bundle analysis available');
    }
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Export config for programmatic use
export { config };

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildMCPB();
}