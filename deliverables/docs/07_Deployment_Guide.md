# Deployment Guide

## 1. Prerequisites
- Target DHIS2 environment running a compatible, supported version (e.g., >= 2.39).
- Admin access to DHIS2.
- Backup of the target DHIS2 database completed.

## 2. Metadata Import
1. Navigate to the **Import/Export** app in DHIS2.
2. Select **Metadata Import**.
3. Upload `dhis2_metadata_package.json`.
4. Run validation (Dry Run) first. Ensure no critical conflicts exist.
5. Commit the import.

## 3. Web App Deployment
1. Go to the `webapp` directory.
2. Install dependencies: `npm install`
3. Create a production build: `npm run build`
4. Deploy the build via the DHIS2 App Management app (as a bundled zip) or host via Nginx if deployed as a standalone proxy app.
5. Ensure environment variables (DHIS2 URL, credentials) are securely configured.

## 4. Rollout Strategy
1. **Pilot Phase**: Deploy to 2 initial facilities. Provide on-site hypercare support.
2. **Phase 1 Expansion**: Deploy to the remaining 29 high-burden sites.
3. **National Expansion**: Scale to medium/low burden sites under GC8 funding.

## 5. Rollback Plan
- If the metadata import corrupts existing instances, restore the DHIS2 PostgreSQL database from the pre-deployment backup.
- If the custom web app fails, revert to the previous version in the App Management console.
