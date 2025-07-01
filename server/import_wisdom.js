require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

// Load environment variables (if using dotenv, uncomment the next line)
// require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

async function importWisdom() {
    const data = fs.readFileSync('wisdom.json', 'utf8');
    const wisdoms = JSON.parse(data);

    for (const entry of wisdoms) {
        // Split on the last occurrence of ' - '
        const lastDash = entry.text.lastIndexOf(' - ');
        let quote = entry.text;
        let author = null;

        if (lastDash !== -1) {
            quote = entry.text.substring(0, lastDash).trim();
            author = entry.text.substring(lastDash + 3).trim();
        }

        try {
            await pool.query(
                'INSERT INTO wisdom (text, author) VALUES ($1, $2)',
                [quote, author]
            );
            console.log(`Inserted: "${quote}" by ${author}`);
        } catch (err) {
            console.error('Error inserting wisdom:', err);
        }
    }

    await pool.end();
    console.log('Import complete!');
}

importWisdom();