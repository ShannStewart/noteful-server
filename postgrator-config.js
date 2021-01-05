require('dotenv').config();

module.exports = {
  "migrationsDirectory": "migrations",
  "driver": "pg",
  "connectionString": process.env.DATABASE_URL || 'postgres://rwdhntkhuroptu:48522106b9f5aaf0890905df7abe67c75710e00aba50b80edcf01a07d5cbe918@ec2-52-203-49-58.compute-1.amazonaws.com:5432/dcgq78oje0lmb6'
}
