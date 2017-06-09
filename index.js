var Hapi = require('hapi');
var Wreck = require('wreck');
var ical = require('ical');
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
// deal with the time zone
  // do we want to make an assumption about what the correct time zone?
  // or do we just say, from what ever timezone the person is adding in calendar
  // date info, we set the e time zome for that.
// format the non repeating examples
  // we want:
    // name
    // location
    // link to sign up
// dig into the lovely world of rrule
function parseJcal (Jcal) {
  return Object.keys(Jcal).map((key, val) => {
    if (key.match(/google/)) {
      if (Jcal[key].rrule) {
        console.log('it repeats!');
      } else {
        console.log('does not repeat');
        return {
          'name': Jcal[key].summary,
          'time': [Jcal[key].start, Jcal[key].end],
          'location': Jcal[key].location,
          'description': Jcal[key].description,
          'link': 'surfing'
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
      const Jcal = parseJcal(result);
      return rep(Jcal);
    });
  },
  config: {
    cors: true
  }
});

server.start(function () {
  console.log('Starting server at: ' + server.info.uri);
});
