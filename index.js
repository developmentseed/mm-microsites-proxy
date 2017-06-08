var Hapi = require('hapi');
// var url = require('url');
var Wreck = require('wreck');

var server = new Hapi.Server();

server.connection({
  port: process.env.PORT || 3000
});

var getGoogleCalendar = function (calendar, next) {
  const icalUrl = 'https://calendar.google.com/calendar/ical/' + calendar + '/public/basic.ics';
  console.log(icalUrl);
  Wreck.get(icalUrl, null, (err, res, calEvents) => {
    if (err) {
      return next(err);
    }
    if (res.statusCode !== 200) {
      return next(res.statusCode);
    }
    next(null, calEvents.toString());
  });
};

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
      return rep(result);
    });
  },
  config: {
    cors: true
  }
});

server.start(function () {
  console.log('Starting server at: ' + server.info.uri);
});
