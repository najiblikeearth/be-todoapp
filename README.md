# Todo App Backend

Backend untuk aplikasi Todo App menggunakan Express.js dan MongoDB.

## Instalasi

```bash
# Install dependencies
npm install

# Buat file .env
cp .env.example .env
```

## Menjalankan Aplikasi

```bash
# Menjalankan dalam mode development
npm run dev

# Menjalankan dalam mode production
npm start
```

## Perintah Database

Aplikasi ini menyediakan beberapa perintah untuk mengelola database, mirip dengan perintah di Laravel:

```bash
# Menghapus semua koleksi (seperti migrate:fresh di Laravel)
npm run db:fresh

# Mengisi data tanpa menghapus data yang ada (seperti db:seed di Laravel)
npm run db:seed

# Menghapus semua koleksi dan mengisi data baru (seperti migrate:fresh --seed di Laravel)
npm run db:fresh:seed

# Menampilkan status database
npm run db:status
```

## Fitur

-   Autentikasi dengan JWT
-   CRUD untuk Todo
-   Relasi antara User dan Todo
-   Sistem migrasi dan seeding database

## Struktur Database

### Users

-   `_id`: ObjectId
-   `username`: String (unique)
-   `password`: String

### Todos

-   `_id`: ObjectId
-   `userId`: ObjectId (referensi ke User)
-   `title`: String
-   `completed`: Boolean

## API Endpoints

### Auth

-   `POST /api/auth/register` - Mendaftar user baru
-   `POST /api/auth/login` - Login user

### Todos

-   `GET /api/todos` - Mendapatkan semua todos milik user
-   `POST /api/todos` - Membuat todo baru
-   `PUT /api/todos/:id` - Mengupdate todo
-   `DELETE /api/todos/:id` - Menghapus todo
