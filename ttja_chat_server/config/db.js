require("dotenv").config();

console.log(process.env.DB_HOST)

const config = {
  database:{
    HOST: process.env.DB_HOST,
    PORT: process.env.DB_PORT,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    DATABASE: process.env.DB_DATABASE
  }
}

module.exports = config;