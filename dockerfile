FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    libzip-dev \
    libsqlite3-dev \
    zip \
    nodejs \
    npm

RUN docker-php-ext-install zip pdo pdo_mysql pdo_sqlite

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN npm install
RUN npm run build

RUN chmod +x /app/docker-start.sh

EXPOSE 10000

CMD ["/app/docker-start.sh"]
