#!/usr/bin/env sh
set -e

if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
    DB_PATH="${DB_DATABASE:-database/database.sqlite}"

    case "$DB_PATH" in
        /*) SQLITE_FILE="$DB_PATH" ;;
        :memory:) SQLITE_FILE="" ;;
        *) SQLITE_FILE="/app/$DB_PATH" ;;
    esac

    if [ -n "$SQLITE_FILE" ]; then
        mkdir -p "$(dirname "$SQLITE_FILE")"
        touch "$SQLITE_FILE"
    fi
fi

php artisan config:clear --no-interaction
php artisan migrate --force --no-interaction
php artisan db:seed --force --no-interaction

php artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
