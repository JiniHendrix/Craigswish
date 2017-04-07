var twilioClient = require('./twilioClient.js');
var admins = require('./administrators.json');

// function formatMessage(errorToReport) {
//   return '[This is a test] ALERT! It appears the server is' +
//     'having issues. Exception: ' + errorToReport +
//     '. Go to: http://newrelic.com ' +
//     'for more details.';
// };

exports.notifyOnError = function(request, response, next) {
    console.log('TEXTING');
  admins.forEach(function(admin) {
    console.log(request.body);
    var messageToSend =  request.body.item + ' FOUND';
    twilioClient.sendSms(admin.phoneNumber, messageToSend);
  });
  response.send('text sent');
};