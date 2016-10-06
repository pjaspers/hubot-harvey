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

module.exports.rangeForNow = rangeForNow;
module.exports.rangeForDate = rangeForDate;
module.exports.startDateFromRange = startDateFromRange;
module.exports.endDateFromRange = endDateFromRange;
