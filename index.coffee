# Description:
#   Gives an easy way for a user to get the status of Harvest
#
# Dependencies:
#   lodash
#
# Configuration:
#   None
#
# Commands:
#   harvey - Display yesterday's harvest
#
# Author:
#   pjaspers

Harvey = require './harvey'
DateUtils = require "./date_utils"

attach = (robot, color, date, users) ->
  fields = for user in users
    {short: true, title: user.name, value: user.minutes}
  robot.emit 'slack.attachment',
    text: "*Harvest for #{date}* :scream_cat:"
    content:
      color: color
      fields: fields
    channel: "#dev" # optional, defaults to message.room
    username: "Harvest for #{date}"
    icon_url: "http://pile.pjaspers.com/freckle.png"

emote = (robot, msg, data) ->
  for own date, users of data
    badusers = (user for user in users when +user.minutes < 420)
    goodusers = (user for user in users when +user.minutes >= 420)
    attach robot, "danger", date, badusers
    attach robot, "good", date, goodusers

displaySummary = (msg, data) ->
  for own date, users of data
    users = for user in users
      "#{user.name}: #{user.minutes}"
    msg.send "#{date} => #{users.join("|")}"

dateRangeFromMessage = (msg) ->
  # Let's assume: dd/mm/YYYY
  dateRegex = /(\d{2})\/(\d{2})\/(\d{2,4})/
  if dateRegex.test(msg)
    DateUtils.rangeForDate(msg)
  else
    DateUtils.rangeForNow()

module.exports = (robot) ->
  robot.respond /(status\s)?(harvest|harvey)/i, (msg) ->
    original_message = msg.message.text
    user_ids = process.env.ACTIVE_USER_IDS.split(",")
    email = process.env.HARVEST_EMAIL
    password = process.env.HARVEST_PASSWORD
    subdomain = process.env.HARVEST_SUBDOMAIN
    harvey = new Harvey(email, password, subdomain, user_ids)

    range = dateRangeFromMessage(original_message)
    startDate = DateUtils.startDateFromRange(range)
    endDate = DateUtils.endDateFromRange(range)
    if startDate
      harvey.minutesPerUserInRange startDate, endDate, (err, data) ->
        if /\bme\b/.test(original_message)
          displaySummary(msg, data)
        else
          emote(robot, msg, data)
    else
      msg.send "Don't know what date to fetch"
