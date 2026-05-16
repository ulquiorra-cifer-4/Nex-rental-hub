/**
 * Seed script — inserts 8 sample cars into MongoDB
 * Run with: npm run seed
 */

const mongoose = require("mongoose");
const dotenv   = require("dotenv");
dotenv.config();

const Car = require("../models/Car");

const sampleCars = [
  {
    name: "Toyota Camry 2024",
    imageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
    carType: "sedan",
    pricePerDay: 55,
    available: true,
    fuelType: "petrol",
    seats: 5,
  },
  {
    name: "Honda CR-V 2024",
    imageUrl: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800",
    carType: "SUV",
    pricePerDay: 75,
    available: true,
    fuelType: "petrol",
    seats: 5,
  },
  {
    name: "Tesla Model S 2024",
    imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
    carType: "luxury",
    pricePerDay: 180,
    available: true,
    fuelType: "electric",
    seats: 5,
  },
  {
    name: "Ford Mustang 2023",
    imageUrl: "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=800",
    carType: "sedan",
    pricePerDay: 95,
    available: true,
    fuelType: "petrol",
    seats: 4,
  },
  {
    name: "Chevrolet Suburban 2024",
    imageUrl: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800",
    carType: "SUV",
    pricePerDay: 110,
    available: true,
    fuelType: "petrol",
    seats: 8,
  },
  {
    name: "Rolls-Royce Ghost 2024",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
    carType: "luxury",
    pricePerDay: 450,
    available: true,
    fuelType: "petrol",
    seats: 5,
  },
  {
    name: "Kia Soul 2023",
    imageUrl: "https://images.unsplash.com/photo-1551830820-330a71b99659?w=800",
    carType: "compact",
    pricePerDay: 40,
    available: true,
    fuelType: "petrol",
    seats: 5,
  },
  {
    name: "Chrysler Pacifica 2024",
    imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800",
    carType: "minivan",
    pricePerDay: 85,
    available: true,
    fuelType: "petrol",
    seats: 7,
  },
];

async function seed() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅  Connected to MongoDB");

    // Clear existing cars
    await Car.deleteMany({});
    console.log("🗑   Cleared existing cars");

    // Insert sample cars
    const inserted = await Car.insertMany(sampleCars);
    console.log(`🚗  Inserted ${inserted.length} cars:`);
    inserted.forEach((car) => console.log(`    - [${car._id}] ${car.name} ($${car.pricePerDay}/day)`));

    console.log("\n✅  Seed complete!");
  } catch (err) {
    console.error("❌  Seed failed:", err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();
