const mongoose = require("mongoose");
const { User, Todo } = require("./models");

// Koneksi ke database
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/todoapp", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected successfully");
        return true;
    } catch (err) {
        console.error("MongoDB connection error:", err);
        return false;
    }
};

// Data contoh untuk users
const users = [
    { username: "user1", password: "password1" },
    { username: "user2", password: "password2" },
];

// Data contoh untuk todos
const todoTemplates = [
    { title: "Belajar React Native", completed: false },
    { title: "Membuat aplikasi to-do list", completed: false },
    { title: "Menghubungkan frontend ke backend", completed: true },
];

// Fungsi untuk menghapus semua koleksi (seperti migrate:fresh di Laravel)
const resetCollections = async () => {
    try {
        console.log("Dropping all collections...");

        // Hapus semua koleksi yang ada
        await User.collection.drop().catch((err) => {
            // Ignore error jika koleksi belum ada
            if (err.code !== 26) {
                console.error("Error dropping User collection:", err);
            } else {
                console.log("User collection doesn't exist yet");
            }
        });

        await Todo.collection.drop().catch((err) => {
            // Ignore error jika koleksi belum ada
            if (err.code !== 26) {
                console.error("Error dropping Todo collection:", err);
            } else {
                console.log("Todo collection doesn't exist yet");
            }
        });

        console.log("All collections dropped successfully");
        return true;
    } catch (error) {
        console.error("Error resetting collections:", error);
        return false;
    }
};

// Fungsi untuk mengisi data users (seeding)
const seedUsers = async () => {
    try {
        console.log("Seeding users...");

        // Periksa apakah users sudah ada berdasarkan username
        const existingUsers = [];
        const newUsers = [];

        for (const user of users) {
            const existingUser = await User.findOne({
                username: user.username,
            });
            if (existingUser) {
                console.log(
                    `User ${user.username} sudah ada, tidak perlu ditambahkan lagi`
                );
                existingUsers.push(existingUser);
            } else {
                newUsers.push(user);
            }
        }

        // Tambahkan hanya user yang belum ada
        let result = [];
        if (newUsers.length > 0) {
            result = await User.insertMany(newUsers);
            console.log(`${result.length} users baru ditambahkan`);
        } else {
            console.log("Tidak ada users baru yang perlu ditambahkan");
        }

        // Gabungkan user yang sudah ada dan user baru
        return [...existingUsers, ...result];
    } catch (error) {
        console.error("Error seeding users:", error);
        throw error;
    }
};

// Fungsi untuk mengisi data todos (seeding)
const seedTodos = async (users) => {
    try {
        console.log("Seeding todos...");

        // Buat todos untuk setiap user
        const allTodos = [];

        for (const user of users) {
            // Periksa todos yang sudah ada untuk user ini
            const existingTodoTitles = await Todo.find({
                userId: user._id,
            }).distinct("title");

            // Filter hanya todo yang belum ada
            const newTodos = todoTemplates
                .filter(
                    (template) => !existingTodoTitles.includes(template.title)
                )
                .map((todo) => ({
                    title: todo.title,
                    completed: todo.completed,
                    userId: user._id,
                }));

            if (newTodos.length > 0) {
                allTodos.push(...newTodos);
            } else {
                console.log(`Tidak ada todos baru untuk user ${user.username}`);
            }
        }

        let result = [];
        if (allTodos.length > 0) {
            result = await Todo.insertMany(allTodos);
            console.log(`${result.length} todos baru ditambahkan`);
        } else {
            console.log("Tidak ada todos baru yang perlu ditambahkan");
        }

        return result;
    } catch (error) {
        console.error("Error seeding todos:", error);
        throw error;
    }
};

// Fungsi untuk menampilkan status database
const showStatus = async () => {
    try {
        const userCount = await User.countDocuments();
        const todoCount = await Todo.countDocuments();

        console.log("\n=== DATABASE STATUS ===");
        console.log(`- Users: ${userCount}`);
        console.log(`- Todos: ${todoCount}`);

        // Tampilkan beberapa contoh data
        if (userCount > 0) {
            console.log("\n=== SAMPLE USERS ===");
            const sampleUsers = await User.find().limit(2);
            sampleUsers.forEach((user, index) => {
                console.log(`\nUser ${index + 1}:`);
                console.log(`- ID: ${user._id}`);
                console.log(`- Username: ${user.username}`);
                console.log(`- Password: ${user.password}`);
            });
        }

        if (todoCount > 0) {
            console.log("\n=== SAMPLE TODOS ===");
            const sampleTodos = await Todo.find().limit(3);
            sampleTodos.forEach((todo, index) => {
                console.log(`\nTodo ${index + 1}:`);
                console.log(`- ID: ${todo._id}`);
                console.log(`- Title: ${todo.title}`);
                console.log(`- Completed: ${todo.completed}`);
                console.log(`- User ID: ${todo.userId}`);
            });

            // Tampilkan jumlah todos per user
            console.log("\n=== TODOS PER USER ===");
            const users = await User.find();
            for (const user of users) {
                const count = await Todo.countDocuments({ userId: user._id });
                console.log(`- User ${user.username}: ${count} todos`);
            }
        }
    } catch (error) {
        console.error("Error showing status:", error);
    }
};

// Perintah: migrate:fresh (menghapus semua koleksi)
const migrateFresh = async () => {
    if (await connectDB()) {
        try {
            await resetCollections();
            console.log("migrate:fresh completed successfully");
        } catch (error) {
            console.error("Error in migrate:fresh:", error);
        } finally {
            await mongoose.connection.close();
            console.log("Database connection closed");
        }
    }
};

// Perintah: db:seed (mengisi data tanpa menghapus data yang ada)
const dbSeed = async () => {
    if (await connectDB()) {
        try {
            console.log("\n=== MENJALANKAN DB:SEED ===");
            console.log(
                "Menambahkan data baru tanpa menghapus data yang ada...\n"
            );

            const seededUsers = await seedUsers();
            await seedTodos(seededUsers);

            console.log("\ndb:seed completed successfully");
            await showStatus();
        } catch (error) {
            console.error("Error in db:seed:", error);
        } finally {
            await mongoose.connection.close();
            console.log("Database connection closed");
        }
    }
};

// Perintah: migrate:fresh:seed (menghapus semua koleksi dan mengisi data baru)
const migrateFreshSeed = async () => {
    if (await connectDB()) {
        try {
            console.log("\n=== MENJALANKAN MIGRATE:FRESH:SEED ===");
            console.log(
                "Menghapus semua data dan mengisi dengan data baru...\n"
            );

            await resetCollections();

            console.log("\n--- MULAI SEEDING DATA ---");
            const seededUsers = await seedUsers();
            await seedTodos(seededUsers);

            console.log("\nmigrate:fresh:seed completed successfully");
            await showStatus();
        } catch (error) {
            console.error("Error in migrate:fresh:seed:", error);
        } finally {
            await mongoose.connection.close();
            console.log("Database connection closed");
        }
    }
};

// Perintah: db:status (menampilkan status database)
const dbStatus = async () => {
    if (await connectDB()) {
        try {
            await showStatus();
        } catch (error) {
            console.error("Error in db:status:", error);
        } finally {
            await mongoose.connection.close();
            console.log("Database connection closed");
        }
    }
};

// Menentukan perintah yang akan dijalankan berdasarkan argumen command line
const command = process.argv[2] || "help";

switch (command) {
    case "migrate:fresh":
        migrateFresh();
        break;
    case "db:seed":
        dbSeed();
        break;
    case "migrate:fresh:seed":
        migrateFreshSeed();
        break;
    case "db:status":
        dbStatus();
        break;
    case "help":
    default:
        console.log(`
MongoDB Database Commands (mirip Laravel):

node src/db-commands.js migrate:fresh       - Menghapus semua koleksi (seperti migrate:fresh)
node src/db-commands.js db:seed             - Mengisi data tanpa menghapus data yang ada (seperti db:seed)
node src/db-commands.js migrate:fresh:seed  - Menghapus semua koleksi dan mengisi data baru (seperti migrate:fresh --seed)
node src/db-commands.js db:status           - Menampilkan status database
node src/db-commands.js help                - Menampilkan bantuan ini
        `);
        process.exit(0);
}
