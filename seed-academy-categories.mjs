import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fintech_builders',
});

const categories = [
  { namePt: 'Tecnologia', nameEn: 'Technology', slug: 'tecnologia' },
  { namePt: 'Produto', nameEn: 'Product', slug: 'produto' },
  { namePt: 'Regulatório', nameEn: 'Regulatory', slug: 'regulatorio' },
  { namePt: 'Casos de Uso', nameEn: 'Use Cases', slug: 'casos-de-uso' },
];

try {
  for (const cat of categories) {
    await connection.execute(
      'INSERT IGNORE INTO academyCategories (namePt, nameEn, slug) VALUES (?, ?, ?)',
      [cat.namePt, cat.nameEn, cat.slug]
    );
    console.log(`✓ Inserted category: ${cat.namePt}`);
  }
  console.log('✓ All Academy categories seeded successfully!');
} catch (error) {
  console.error('Error seeding categories:', error);
} finally {
  await connection.end();
}
