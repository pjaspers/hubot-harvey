var Harvey = require("./harvey"),
    HarvestClient = require("./harvest_client"),
    DateUtils = require("./date_utils");

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
var client = HarvestClient(email, password, subdomain);
module.exports.client = client;

// Set up Harvey
var harvey = new Harvey(email, password, subdomain, user_ids);
module.exports.harvey = harvey;

function display(data) {
 for(var date in data) {
   console.log("On %s", date);
   for(let user of data[date]) {
     console.log("%s => %d minutes", user.name, user.minutes);
   }
 }
}

var displayForRange = function(range) {
  var fromDate = DateUtils.startDateFromRange(range);
  var toDate = DateUtils.endDateFromRange(range);
  console.log("Fetching from %s to %s", fromDate, toDate);
  harvey.minutesPerUserInRange(fromDate, toDate, function(err, data) {
    display(data);
  });
}

module.exports.showUsers = function() {
  harvey.users(function(err, data) {
    console.log("All users %s", JSON.stringify(data, null, 2))
  });
}

module.exports.showNow = function() {
  displayForRange(DateUtils.rangeForNow());
}

module.exports.showDate = function(ddmmYYYY) {
  displayForRange(DateUtils.rangeForDate(ddmmYYYY));
}