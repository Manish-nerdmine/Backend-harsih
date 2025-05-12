require("dotenv").config();
const Airtable = require("airtable");

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_ACCESS_TOKEN, // This can be a PAT too
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

module.exports = base;
