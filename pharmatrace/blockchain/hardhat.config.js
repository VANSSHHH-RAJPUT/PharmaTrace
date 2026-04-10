const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("@nomicfoundation/hardhat-toolbox");

const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

console.log("Key length check:", PRIVATE_KEY?.length); // remove after fix

module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: ALCHEMY_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  }
};