var Hapi = require('hapi');
var Wreck = require('wreck');
var ical = require('ical');
var recur = require('./recur-helpers/index.js')
// var timezone = require('timezone-js');

var server = new Hapi.Server();

server.connection({
  port: process.env.PORT || 3000
});

function getGoogleCalendar (calendar, next) {
  const icalUrl = 'https://calendar.google.com/calendar/ical/' + calendar + '/public/basic.ics';
  console.log(icalUrl);
  Wreck.get(icalUrl, null, (err, res, calEvents) => {
    if (err) {
      return next(err);
    }
    if (res.statusCode !== 200) {
      return next(res.statusCode);
    }
    // parse ical string to jcal and return.
    next(null, ical.parseICS(calEvents.toString()));
  });
}
// dig into the lovely world of rrule
function parseJcal (Jcal) {
  return Object.keys(Jcal).map((key, val) => {
    if (key.match(/google/)) {
      if (Jcal[key].rrule) {
        console.log('it repeats!');
        return recur(Jcal[key]);
      } else {
        console.log('does not repeat');
        return {
          'name': Jcal[key].summary,
          'time': [Jcal[key].start, Jcal[key].end],
          'location': Jcal[key].location,
          'description': Jcal[key].description
        };
      }
    } else {
      return {'timezone': Jcal[key].tzid};
    }
  });
}
server.method({
  name: 'getGoogleCalendar',
  method: getGoogleCalendar,
  options: {}
});

server.route({
  method: 'GET',
  path: '/{calendar}/events',
  handler: function (req, rep) {
    return server.methods.getGoogleCalendar(req.params.calendar, function (error, result) {
      if (error) {
        return rep({
          error: error
        }).code(500);
      }
      const parsedJcal = parseJcal(result);
      return rep(parsedJcal);
    });
  },
  config: {
    cors: true
  }
});

server.start(function () {
  console.log('Starting server at: ' + server.info.uri);
});
