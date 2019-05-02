var amqp = require('amqplib/callback_api');
var os = require('os');
var channel;
var q = 'events';
amqp.connect('amqp://admin:admin@sumeet.life:5672/', function(err, conn) {
  conn.createChannel(function(err, ch) {
    channel = ch;
    ch.assertQueue(q, {durable: false});
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.sendToQueue(q, Buffer.from('CONN'));
    ch.consume(q, function(msg) {
      console.log(" [x] Received %s", msg.content.toString());
    }, {noAck: true});
  });
});

var eventHandler = (code) => {
    console.log(`About to exit with code: ${code}`);
    var eveObject = {};
    eveObject.scode = code;
    eveObject.cCode = 'EXIT';
    eveObject.host = os.hostname();
    eveObject.type = 'LinuxBox';
    channel.sendToQueue(q, Buffer.from(JSON.stringify(eveObject)));
    console.log(" [x] Sent %s", JSON.stringify(eveObject));
}

//Exit Events
process.on('SIGINT', eventHandler('SIGINT'));
process.on('SIGTERM', eventHandler('SIGTERM'));
process.on('SIGBREAK', eventHandler('SIGBREAK'));
process.on('EVE007', eventHandler('EVE007'));
process.on('exit', eventHandler('exit'));
/*process.on('SIGKILL', eventHandler);
process.on('SIGSTOP', eventHandler);*/
