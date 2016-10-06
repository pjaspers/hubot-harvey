var _ = require("lodash"),
    HarvestClient = require("./harvest_client");

// Harvest + Survey => Harvey
//
// Big whoop, wanna fight about it?
module.exports = Harvey;

function Harvey(username, password, subdomain, userIds) {
  this.client = HarvestClient(username, password, subdomain);
  this._users = [];
  this.userIds = userIds;
}

// Fetches all users from Harvest, once fetched the users are cached to speed up
// the other operations
Harvey.prototype.users = function(callback) {
  if(this._users.length > 0) {
    return callback(null, this._users);
  }
  var that = this;
  this.client.users(function(e, u) {
    that._users = u;
    callback(e, u);
  });
}

// Returns a list of users and the minutes spent per date in the given range.
Harvey.prototype.minutesPerUserInRange = function(startDate, endDate, callback) {
  var that = this;
  this.allEntriesInRange(startDate, endDate, function(e, entries) {
    var dates = _.chain(entries).map('day_entry').pluck('spent_at').uniq().value().sort();
    var groupedByDate = groupByDate(entries);
    that.users(function(err, users) {
      var data = _.reduce(dates, function(result, date) {
                   var entriesForDate = groupedByDate[date];
                   result[date] = sumPerUser(that.userIds, users, entriesForDate);
                   return result;
                 }, {});
      return callback(null, data);
    });
  });
}

// Returns all entries across all users for the given range
Harvey.prototype.allEntriesInRange = function(startDate, endDate, callback) {
  var that = this;
  var data;
  var promises = [];
  that.users(function(err, users) {
    if (err) { return callback(err, {}); }
    for (let userId of that.userIds) {
      var promise = new Promise(function(resolve, reject) {
                                  var user;
                                  user = getUser(userId, users);
                                  that.client.entriesPerUserForRange(userId, startDate, endDate, function(e, entries) {
                                    resolve(entries);
                                  })
                                });
      promises.push(promise);
    }
    return Promise.all(promises).then(function(data) {
      return callback(null, _.flatten(data));
    });
  });
}

function sumPerUser(userIds, users, entries) {
  var groupedByUser = groupByUserId(entries);
  return _.map(userIds, function(id) {
    var userEntries = groupedByUser[id.toString()] || {};
    var user = getUser(id, users);
    return {id: id,
            name: user.first_name,
            last_name: user.last_name,
            minutes: sumMinutes(userEntries)};
         });
}

function sumMinutes(entries) {
  var minutes = _.reduce(entries, function(sum, e) {
                  sum += +e.day_entry.hours*60;
                  return sum;
                }, 0);
  if (minutes == null) {
    minutes = 0;
  }
  return minutes;
}

function groupByDate(entries) {
  return _.chain(entries).groupBy(function(entry) {
           return entry.day_entry.spent_at;
         }).value();
}

function groupByUserId(entries) {
  return _.chain(entries).groupBy(function(entry) {
           return entry.day_entry.user_id;
         }).value();
}

function getUser(userId, users) {
  return _.chain(users)
         .filter({user: {id: +userId}})
         .pluck("user")
         .first()
         .value();
}
