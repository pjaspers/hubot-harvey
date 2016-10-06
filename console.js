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

// Set up Harvey
var harvey = new Harvey(email, password, subdomain, user_ids);
module.exports.harvey = harvey;

var yesterday = function() {
  var date;
  date = new Date();
  date.setDate(date.getDate() - 1);
  if (date.getDay() === 6) {
    date.setDate(date.getDate() - 1);
  }
  if (date.getDay() === 0) {
    date.setDate(date.getDate() - 2);
  }
  return date;
};

var nextDay = function(date) {
  var nextDay = new Date(date.getTime());
  nextDay.setDate(date.getDate() + 1);

  return nextDay;
}

var today = function() {
  return new Date();
}

function display(data) {
 for(var date in data) {
   console.log("On %s", date);
   for(let user of data[date]) {
     console.log("%s => %d minutes", user.name, user.minutes);
   }
 }
}

var rangeForNow = function () {
  var hour = new Date().getHours()
  if (hour < 11) return [yesterday()];
  if (11 < hour && hour < 18) return [yesterday(), today()];

  return [today()];
}

var rangeForDate = function(ddmmYYYY) {
  var _ref, day, month, year;
  var dateRegex = /(\d{2})\/(\d{2})\/(\d{2,4})/;
  if (dateRegex.test(ddmmYYYY)) {
    _ref = ddmmYYYY.match(dateRegex).slice(1, 4), day = _ref[0], month = _ref[1], year = _ref[2];
    return [new Date(Date.parse("" + month + "/" + day + "/" + year))];
 } else {
   return []
 }
}

var startDateFromRange = function(r) { return r[0] };
var endDateFromRange = function(r) { return r[r.length-1] }

var displayForRange = function(range) {
  var fromDate = startDateFromRange(range);
  var toDate = endDateFromRange(range);
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
  displayForRange(rangeForNow());
}

module.exports.showDate = function(ddmmYYYY) {
  displayForRange(rangeForDate(ddmmYYYY));
}