var Harvey = require("./harvey");

// On Heroku these will be set in the config, locally start you node with
//
//      node -r dotenv/config
//
// which will load the `.env` file, you've surely created. (The one that looks remarkably
// similar to this:
//
//      HARVEST_EMAIL="harvest@email.com"
//      HARVEST_PASSWORD="homecoming admired ulster accidental center"
//      HARVEST_SUBDOMAIN="yoursubodmain"
//      ACTIVE_USER_IDS="123,345,567"
//
var user_ids = process.env.ACTIVE_USER_IDS.split(",");
var email = process.env.HARVEST_EMAIL;
var password = process.env.HARVEST_PASSWORD;
var subdomain = process.env.HARVEST_SUBDOMAIN;

// Set up the client
var HarvestClient = require("./harvest_client");
var client = HarvestClient(email, password, subdomain);

module.exports.client = client;