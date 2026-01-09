import { drizzle } from "drizzle-orm/mysql2";
import { blogCategories } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const categories = [
  {
    namePt: "Tecnologia",
    nameEn: "Technology",
    slug: "technology"
  },
  {
    namePt: "Inovação",
    nameEn: "Innovation",
    slug: "innovation"
  },
  {
    namePt: "Mercado Financeiro",
    nameEn: "Financial Market",
    slug: "financial-market"
  },
  {
    namePt: "Educação",
    nameEn: "Education",
    slug: "education"
  },
  {
    namePt: "Eventos",
    nameEn: "Events",
    slug: "events"
  }
];

async function seed() {
  console.log("Seeding blog categories...");
  
  for (const category of categories) {
    try {
      await db.insert(blogCategories).values(category);
      console.log(`✓ ${category.namePt}`);
    } catch (error) {
      console.log(`Already exists: ${category.namePt}`);
    }
  }
  
  console.log("Done!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding:", error);
  process.exit(1);
});
