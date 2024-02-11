import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/paytm");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50,
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
});

const User = mongoose.model("User", userSchema);

export default User;
