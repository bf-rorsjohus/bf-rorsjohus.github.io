// Runs the Drive sync on a developer machine with credentials scoped to this repository only.
//
//   npm run drive:login   one-time Google sign-in, stored in ./.gcloud (gitignored)
//   npm run drive:sync    fetch a token from ./.gcloud and run scripts/sync-drive.ts
//
// Settings come from ./.env.local (gitignored): DRIVE_HEMSIDA_FOLDER_ID=<id>
// The token is minted by impersonating the deploy service account (read-only on Hemsida), so your
// own account needs roles/iam.serviceAccountTokenCreator on it but no Drive scopes of its own.
// gcloud is pointed at ./.gcloud via CLOUDSDK_CONFIG, so your global gcloud login, other
// projects and GOOGLE_APPLICATION_CREDENTIALS are never read or modified.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENV_FILE = join(ROOT, '.env.local');
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
const DEFAULT_SERVICE_ACCOUNT = 'webbplats-lasare@bf-rorsjohus-webb.iam.gserviceaccount.com';

if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

const gcloudEnv = {
  ...process.env,
  CLOUDSDK_CONFIG: join(ROOT, '.gcloud'),
  GOOGLE_APPLICATION_CREDENTIALS: '',
};

function gcloud(args: string[], stdio: 'inherit' | 'pipe'): string {
  try {
    // stdout is captured (it carries the token); stderr always reaches the terminal.
    const out = execFileSync('gcloud', args, {
      env: gcloudEnv,
      stdio: stdio === 'pipe' ? ['inherit', 'pipe', 'inherit'] : 'inherit',
      encoding: 'utf8',
    });
    return out ?? '';
  } catch {
    throw new Error(
      stdio === 'pipe'
        ? 'Could not get a token. Run npm run drive:login, and check you have Service Account Token Creator on the service account.'
        : 'gcloud failed. Is it installed? (brew install --cask google-cloud-sdk)',
    );
  }
}

const command = process.argv[2];
if (command === 'login') {
  gcloud(['auth', 'login'], 'inherit');
} else if (command === 'sync') {
  const folderId = process.env.DRIVE_HEMSIDA_FOLDER_ID;
  if (!folderId) throw new Error(`Set DRIVE_HEMSIDA_FOLDER_ID=<folder id> in ${ENV_FILE}`);
  const serviceAccount = process.env.DRIVE_IMPERSONATE_SA ?? DEFAULT_SERVICE_ACCOUNT;
  const token = gcloud(
    [
      'auth',
      'print-access-token',
      `--impersonate-service-account=${serviceAccount}`,
      `--scopes=${DRIVE_SCOPE}`,
    ],
    'pipe',
  ).trim();
  execFileSync('node', ['scripts/sync-drive.ts'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, GOOGLE_ACCESS_TOKEN: token, DRIVE_HEMSIDA_FOLDER_ID: folderId },
  });
} else {
  throw new Error('Usage: node scripts/sync-local.ts login|sync');
}
