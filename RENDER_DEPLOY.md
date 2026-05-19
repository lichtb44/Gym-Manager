# Render Deployment

Use these environment variables for the Docker service when you want a quick
SQLite deployment:

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

Important: SQLite lives inside Render's service filesystem unless you mount a
persistent disk. If you create a user on the deployed website, it will not show
up in HeidiSQL unless HeidiSQL is connected to the exact same database used by
Render. In most setups, HeidiSQL is connected to MySQL or MariaDB, while the
settings above make Render use SQLite.

## Use the same database as HeidiSQL

If you want new users from the deployed website to appear in HeidiSQL, create or
use an external MySQL/MariaDB database and set these Render environment
variables instead of the SQLite values:

```env
DB_CONNECTION=mysql
DB_HOST=your-database-host
DB_PORT=3306
DB_DATABASE=your-database-name
DB_USERNAME=your-database-user
DB_PASSWORD=your-database-password
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

Then connect HeidiSQL to the same host, port, database, username, and password.
After changing Render's environment variables, redeploy the service so
`docker-start.sh` runs the migrations on that database.

If you use a Render persistent disk, mount it and set `DB_DATABASE` to the
absolute SQLite path on that disk, for example:

```env
DB_DATABASE=/var/data/database.sqlite
```
