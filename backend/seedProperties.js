
require("dotenv").config();
const mongoose = require("mongoose");
const Property = require("./models/Property");

const demoProperties = [
  {
    title: "Palm Breeze Beach Villa",
    description:
      "A beautiful tropical villa near the beach, with a private garden and relaxing outdoor space.",
    location: "Goa",
    price: 4500,
    category: "Villa",
    bedrooms: 3,
    guests: 6,
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Sunset Cove Apartment",
    description:
      "A cozy modern apartment with a peaceful atmosphere, perfect for a relaxing coastal holiday.",
    location: "Goa",
    price: 2800,
    category: "Apartment",
    bedrooms: 2,
    guests: 4,
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Misty Woods Retreat",
    description:
      "A peaceful forest retreat surrounded by greenery, fresh air, and beautiful coffee plantations.",
    location: "Coorg",
    price: 3200,
    category: "Cabin",
    bedrooms: 2,
    guests: 4,
    image:
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Coorg Coffee Estate Home",
    description:
      "A warm countryside home with scenic views and a quiet setting for a memorable getaway.",
    location: "Coorg",
    price: 3800,
    category: "House",
    bedrooms: 3,
    guests: 5,
    image:
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Himalayan Snow View Cabin",
    description:
      "A cozy mountain cabin with breathtaking views and a peaceful atmosphere.",
    location: "Manali",
    price: 5200,
    category: "Cabin",
    bedrooms: 2,
    guests: 4,
    image:
      "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Mountain Nest Villa",
    description:
      "A spacious villa surrounded by mountain scenery, ideal for families and friends.",
    location: "Manali",
    price: 6000,
    category: "Villa",
    bedrooms: 3,
    guests: 6,
    image:
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Udupi Seaside Stay",
    description:
      "A relaxing coastal home close to the sea, perfect for a peaceful beach holiday.",
    location: "Udupi",
    price: 2500,
    category: "House",
    bedrooms: 2,
    guests: 4,
    image:
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Blue Tide Coastal Villa",
    description:
      "A bright and comfortable villa with a breezy coastal feel and room for the whole family.",
    location: "Udupi",
    price: 4200,
    category: "Villa",
    bedrooms: 3,
    guests: 6,
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=85",
  },
];

async function seedProperties() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Find an existing registered user to own the demo properties.
    const user = await mongoose.connection
      .collection("users")
      .findOne({});

    if (!user) {
      console.log("No registered user found.");
      console.log("Register an account in StayNest first, then run this script again.");
      return;
    }

    let added = 0;

    for (const property of demoProperties) {
      const alreadyExists = await Property.findOne({
        title: property.title,
        owner: user._id,
      });

      if (alreadyExists) {
        console.log(`Already exists: ${property.title}`);
        continue;
      }

      await Property.create({
        ...property,
        owner: user._id,
      });

      added++;
      console.log(`Added: ${property.title}`);
    }

    console.log(`Finished! Added ${added} demo properties.`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedProperties();
