# Server Deployment Guide

This project has been migrated from Firebase Hosting to self-hosted server (Hostinger/GoDaddy or similar).

## Configuration

### Environment Variables
- **Development**: `.env.development` - Uses `http://localhost/ahlaad/backend`
- **Production**: `.env.production` - Uses `https://pandiitacademy.org/backend`

Update `.env.production` with your actual server domain if different.

## Building the Project

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

The build output will be in the `dist/` folder.

## Deployment Steps

### 1. Build the Frontend
```bash
npm run build
```

### 2. Upload to Server

#### Using FTP/SFTP:
- Connect to your hosting via FTP/SFTP
- Upload the contents of the `dist/` folder to your `public_html/` directory (or your website root)
- Ensure backend PHP files are in a `backend/` folder (either at the same level or within your public_html)

#### Recommended Structure:
```
public_html/
├── index.html
├── assets/
├── css/
├── js/
├── img/
└── backend/
    ├── db_config.php
    ├── login.php
    ├── signup.php
    ├── register_event.php
    └── ... (other PHP files)
```

### 3. Configure Server for SPA Routing

For the React Router to work properly, configure your server to redirect all requests to `index.html` (except for actual files/folders).

#### For Apache (via .htaccess)
Create a `.htaccess` file in your `public_html/` directory:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Don't rewrite actual files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Rewrite everything else to index.html
  RewriteRule ^ index.html [QSA,L]
</IfModule>
```

#### For Nginx
Add this to your server block configuration:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 4. Configure Backend

Ensure your backend PHP files are properly set up:

1. **Database Setup**:
   - Update `backend/db_config.php` with your database credentials
   - Run the setup: Access `backend/setup_db.php` from your browser to initialize the database

2. **CORS Headers**:
   - Backend files already have CORS headers configured
   - Verify they match your domain in production

3. **Test Backend Connectivity**:
   - Frontend will call APIs at: `https://pandiitacademy.org/backend/` (as configured in `.env.production`)
   - Ensure this path is accessible from your browser

## Troubleshooting

### Issue: API calls returning 404
- Verify `VITE_API_BASE_URL` in `.env.production` is correct
- Check backend folder path matches the API_BASE_URL configuration
- Ensure CORS headers are enabled in backend PHP files

### Issue: Routing not working (404 on page refresh)
- Implement `.htaccess` for Apache or Nginx configuration mentioned above
- Contact your hosting provider to enable URL rewriting if needed

### Issue: Static assets not loading
- Check that relative paths are correct (uses `./` base in vite.config.ts)
- Verify all assets are uploaded to the correct directories in `dist/`

## Environment Setup for Local Development

```bash
# Install Firebase CLI is no longer needed
# Remove if previously installed:
npm uninstall -g firebase-tools

# Standard development setup
npm install
npm run dev
```

## API Configuration

The app uses environment variables for backend URLs. All API endpoints are defined in `src/config.ts`:

- `API_BASE_URL`: Main backend URL
- `API_ENDPOINTS`: Organized endpoint object for all backend routes

To change the backend URL for a deployment:
1. Update `.env.production` with your server URL
2. Rebuild: `npm run build`
3. Redeploy the new `dist/` folder

---

**Note**: Firebase configuration is no longer needed. You can delete `firebase.json` if you don't plan to use Firebase services in the future.
