# Render Deployment

Use these environment variables for the Docker service:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://gym-manager-junb.onrender.com
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

Keep `APP_URL` as `https://...`. If it is set to `http://...`, browsers will
block the generated Vite JavaScript/CSS assets as mixed content and the app can
load as a blank white page.

The Docker startup script creates `database/database.sqlite`, runs migrations,
seeds the default admin/member/plan data, and then starts Laravel.

If you use a Render persistent disk, mount it and set `DB_DATABASE` to the
absolute SQLite path on that disk, for example:

```env
DB_DATABASE=/var/data/database.sqlite
```
