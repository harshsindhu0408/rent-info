import User from "../models/User.js";
import connectDB from "../config/db.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const updatePasswords = async () => {
  try {
    await connectDB();

    // 1. Find all users who DO NOT have a password field (or have empty password)
    // These are likely the legacy Google Auth users
    const usersToUpdate = await User.find({
      $or: [
        { password: { $exists: false } },
        { password: "" },
        { password: null },
      ],
    });

    if (usersToUpdate.length === 0) {
      console.log("No users found needing password updates.");
      process.exit(0);
    }

    console.log(`Found ${usersToUpdate.length} users to update.`);

    // 2. Hash the default password
    const defaultPassword = "asdfghjkl";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // 3. Update each user
    for (const user of usersToUpdate) {
      user.password = hashedPassword;
      // Also ensure googleId is set to sparse/optional if not already?
      // The model change handles the schema definition, but let's just save the password.
      await user.save();
      console.log(`Updated password for user: ${user.email}`);
    }

    console.log("All users updated successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration Error:", error);
    process.exit(1);
  }
};

updatePasswords();
