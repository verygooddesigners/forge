# BACKUP

When I execute this command, you will:

## UPDATE VERSION NUMBER

1. **Update the version number** using Semantic Versioning format `vMAJOR.MINOR.PATCH` (e.g., `v1.00.00`)
   - Format: `vX.XX.XX` (without brackets)
   - Alpha mode: `v0.XX.XX` (e.g., `v0.10.00`)
   - Beta mode: `v1.00.00-beta` or `v1.00.00-beta.1`
   - Production: `v1.00.00`, `v1.01.00`, `v2.00.00`
   - Version numbers are only updated when the Backup command is given

2. **Update version in the following files:**
   - `package.json` - Update the "version" field
   - `PROJECT_STATUS.md` - Update version in header
   - `README.md` - Update version reference at bottom

3. **Create a Git tag** for the version:
   - `git tag vX.XX.XX`
   - `git push origin vX.XX.XX`

## Version Number Guidelines

- **MAJOR (X.XX.XX)**: Increment for breaking changes (API changes, major architectural changes, removing features)
- **MINOR (XX.X.XX)**: Increment for new features that are backward compatible (new features, new API endpoints, enhancements)
- **PATCH (XX.XX.X)**: Increment for bug fixes (bug fixes, security patches, small improvements)

## When to Update Versions

- Before deploying to production
- After completing a feature milestone
- After fixing critical bugs
- Before creating a release tag

Do NOT update for development commits, work-in-progress features, or internal refactoring (unless breaking).

## UPDATE STATUS

After updating the version number, you will update the project status file

## PUSH TO GITHUB REPO

Lastly, you'll push any changed files to the github repo, ensuring that the codebase on github matches the local development codebase perfectly.

You will NOT push a deployment to the live Vercel server. 