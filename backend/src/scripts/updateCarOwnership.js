import User from "../models/User.js";
import Car from "../models/Car.js";
import connectDB from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const updateCarOwnership = async () => {
  try {
    await connectDB();

    // 1. Get the primary user (the one who should own all orphan cars)
    const ownerEmail = "harshsindhupvt@gmail.com";
    const owner = await User.findOne({ email: ownerEmail });

    if (!owner) {
      console.error(
        `Owner with email ${ownerEmail} not found. Cannot proceed.`
      );
      process.exit(1);
    }

    console.log(`Found owner: ${owner.name} (${owner._id})`);

    // 2. Find cars without a user field
    const orphanCars = await Car.find({ user: { $exists: false } });

    if (orphanCars.length === 0) {
      console.log("No cars found needing ownership assignment.");
      process.exit(0);
    }

    console.log(`Found ${orphanCars.length} cars to update.`);

    // 3. Update each car
    for (const car of orphanCars) {
      car.user = owner._id;
      await car.save();
      console.log(`Updated ownership for car: ${car.brand} ${car.model}`);
    }

    console.log("All cars updated successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration Error:", error);
    process.exit(1);
  }
};

updateCarOwnership();
