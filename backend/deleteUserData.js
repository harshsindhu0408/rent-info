import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Car from "./src/models/Car.js";
import RentalEntry from "./src/models/RentalEntry.js";

dotenv.config();

const deleteData = async () => {
  try {
    const email = "harshsindhupvt@gmail.com";
    
    console.log(`Connecting to database...`);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully.");

    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User with email ${email} not found.`);
      process.exit(0);
    }

    console.log(`Found user: ${user.name} (${user.email}) with ID: ${user._id}`);

    // Delete all RentalEntries for this user
    const rentalDeleteResult = await RentalEntry.deleteMany({ user: user._id });
    console.log(`Deleted ${rentalDeleteResult.deletedCount} rental entries.`);

    // Delete all Cars for this user
    const carDeleteResult = await Car.deleteMany({ user: user._id });
    console.log(`Deleted ${carDeleteResult.deletedCount} cars.`);

    console.log("Data deletion complete. User account was preserved.");
    process.exit(0);
  } catch (error) {
    console.error("Error deleting data:", error);
    process.exit(1);
  }
};

deleteData();
