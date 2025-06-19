# NPX Debug Fixes for cucumberstudio-mcp

## Issues Identified

1. **Missing executable permissions**: The `build/index.js` file wasn't marked as executable
2. **Missing files in npm package**: No `files` field in package.json to specify what gets published
3. **Missing scripts directory**: The `scripts/generate-version.js` wasn't included in the published package
4. **Hard environment validation failure**: Server would crash immediately if environment variables were missing
5. **No graceful error handling**: No user-friendly messages when configuration was missing

## Fixes Applied

### 1. Package Configuration (package.json)
- Added `files` field to include necessary files in npm package:
  ```json
  "files": [
    "build/**/*",
    "scripts/**/*",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ]
  ```
- Updated `prepare` script to run build automatically: `"prepare": "npm run build"`
- Added `prepublishOnly` script for additional validation
- Modified build script to make index.js executable: `"build": "tsc -p tsconfig.build.json && tsc-alias -p tsconfig.build.json && node scripts/prepare-package.js"`

### 2. Build Scripts
- Created `scripts/prepare-package.js` to ensure `build/index.js` is executable (chmod 755)
- Created `scripts/prepublish.js` to validate the build before publishing
- Created `scripts/postinstall.js` for development environment setup
- Made all script files executable

### 3. Environment Validation
- Modified `src/utils/validation.ts` to provide detailed error messages about missing environment variables
- Updated `src/mcp-server.ts` to handle validation failures gracefully:
  - Wrapped initialization in try-catch
  - Register placeholder tool when environment is not configured
  - Show helpful configuration instructions

### 4. Placeholder Tool
- Added `cucumberstudio_configure` tool that provides configuration instructions when environment variables are missing
- This allows the server to start successfully even without configuration
- Users get clear guidance on what needs to be configured

## Testing

The server now:
1. Starts successfully via `npx cucumberstudio-mcp`
2. Shows clear error messages about missing configuration
3. Continues running with a placeholder tool instead of crashing
4. Provides helpful instructions for setting up environment variables

## Usage

When running via npx without configuration:
```bash
npx cucumberstudio-mcp
```

The server will start and show:
```
🎯 Starting Cucumber Studio MCP Server with stdio transport...
❌ Missing required environment variables:
   - CUCUMBERSTUDIO_ACCESS_TOKEN
   - CUCUMBERSTUDIO_CLIENT_ID
   - CUCUMBERSTUDIO_UID

📝 Please set these environment variables either:
   1. In a .env file in your project directory
   2. As environment variables in your shell
```

The server remains running and Claude Code can connect to it, with access to the `cucumberstudio_configure` tool that provides setup instructions.