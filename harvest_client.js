var https = require("https")

// A very minimal Harvest client
//
// It's minimal because it only exposes the two functions I needed to get users and
// to get entries for a period of time.
//
// That said, it would probably be rather trivial to add in all the other calls, but
// I'm not needing them so #yolo4life.
//
//      HarvestClient = require("./harvest_client")
//      client = HarvestClient("picture@this.com", "I am a bag of", "dicks")
//      client.users(function(error, users) { console.log(users); }
//      client.entriesPerUserForRange("123abc", new Date(), new Date(), function(e, entries) { console.log(entries) });
//
module.exports = function HarvestClient(email, password, subdomain) {
  // An object to hold all our settings
  this.config = {
    host: "harvestapp.com",
    port: 443,
    appName: "Harvey"
  }
  this.config.subdomain = subdomain;
  this.config.email = email;
  this.config.password = password;
  this.config.debug = false;

  // Returns all users available in Harvest
  //
  //      callback - (error, users)
  //
  // Example users result:
  //
  // [{ user:
  // // { id: "abc123", email: 'dj@shadow.com', created_at: '2016-01-13T10:53:02Z',
  //    is_admin: true, first_name: 'Shadow', last_name: 'DJ', timezone: 'Brussels',
  //    is_contractor: false, telephone: '', is_active: true, has_access_to_all_future_projects: true,
  //    default_hourly_rate: 0, department: '', wants_newsletter: false, updated_at: '2016-10-04T08:10:52Z',
  //    cost_rate: 1234, weekly_capacity: 126000, signup_redirection_cookie: null } }
  //
  this.users = function(callback) {
    this.request("/people", "GET", callback);
  }

  // Returns all available entries for a user
  //
  //       userId - The Harvest User ID
  //       startDate - The from date
  //       endDate - The upto date (is still included)
  //       callback - (error, entries)
  //
  // Example entries result:
  //       [{ day_entry:
  //          { id: 520349015, notes: 'Turns out, *DING*', spent_at: '2016-10-04',
  //            hours: 1.5, user_id: 1180540, project_id: 11226150, task_id: 5294232,
  //            created_at: '2016-10-04T10:31:50Z', updated_at: '2016-10-04T10:31:50Z',
  //            adjustment_record: false, timer_started_at: null, is_closed: false,
  //            is_billed: false } }]
  //
  this.entriesPerUserForRange = function (userId, startDate, endDate, callback) {
    var path = "/people/" + userId + "/entries?from=" + this.harvestDateFormat(startDate) + "&to=" + this.harvestDateFormat(endDate);
    this.request(path,"GET", callback);
  }

  // Harvest does Basic auth by using 'email:password'
  this.authorizationString = function() {
    return "Basic " + new Buffer(this.config.email + ":" + this.config.password).toString("base64");
  };

  this.harvestDateFormat = function (date) {
    function pad(n){ return n < 10 ? '0'+n : n }
    return [date.getFullYear(), pad(date.getMonth() +1), pad(date.getDate())].join("");
  }

  // Use this to make network calls, it's a very thin wrapper on top of `https`
  // exposing just enought to be able to make the calls that we need.
  this.request = function(path, method, callback) {
    var options = {
      host: this.config.subdomain + "." + "harvestapp.com",
      port: this.config.port,
      path: path,
      method: method,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": this.authorizationString()
      }
    };
    if (this.config.debug) {
      console.log("%s%s", options.host, options.path);
    }
    var request = https.request(options, function(response) {
                    var returnValue = "";
                    response.on("data", function(chunk) {
                      returnValue += chunk;
                    });
                    response.on("end", function() {
                      if(response.statusCode === 401 || response.statusCode === 422) {
                        callback(response);
                      }
                      callback( 0, returnValue.length > 1 ? JSON.parse(returnValue) : '' );
                    });
                  }).on('error', function(e) {
                    callback( e.message );
                  });
    request.end();
  }

  return this;
}