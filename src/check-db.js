const mongoose = require("mongoose");
const { User, Todo } = require("./models");

// Koneksi ke database
mongoose.connect("mongodb://localhost:27017/todoapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
});

const checkDB = async () => {
    try {
        console.log("Checking database contents...");

        // Periksa users
        const users = await User.find({});
        console.log("Users in database:", users.length);
        console.log(JSON.stringify(users, null, 2));

        // Periksa todos
        const todos = await Todo.find({});
        console.log("Todos in database:", todos.length);
        console.log(JSON.stringify(todos, null, 2));
    } catch (error) {
        console.error("Error checking database:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed.");
    }
};

checkDB();
