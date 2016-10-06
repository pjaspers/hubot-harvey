Hi there.

I'm Harvey! I'm here to help remind you to fill out your Harvest timesheets.

## Developing

The easiest way to get started is by using the `console.js`, first create a `.env` file in this directory:

```
HARVEST_EMAIL="harvest@email.com"
HARVEST_PASSWORD="homecoming admired ulster accidental center"
HARVEST_SUBDOMAIN="yoursubodmain"
ACTIVE_USER_IDS="123,345,567"
```

(Don't commit this to the repo)

Now you can start a node repl with:

`node -r dotenv/config`

If you now do:

`l = require("./console.js")`

You have the following in `l`:

```
l.client // => HarvestClient
l.harvey // => An instance of me!
l.showUsers // => Prints out all users it can find
l.showNow // => Prints out today's timesheets
l.showDate("24/09/2016") // => Prints out that day's timesheets
```
