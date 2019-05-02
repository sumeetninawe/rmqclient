var amqp = require('amqplib/callback_api');
var os = require('os');
var ipc = require('node-ipc');
var childProcess = require('child_process');
var channel;
var q = 'events';
var instanceId = '';

childProcess.exec('curl http://169.254.169.254/latest/meta-data/instance-id', (err, stdout, stderr) => {
    if(err) {throw err};
    instanceId = stdout;
});


amqp.connect('amqp://admin:admin@sumeet.life:5672/', function(err, conn) {
  conn.createChannel(function(err, ch) {
    channel = ch;
    ch.assertQueue(q, {durable: false});
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.sendToQueue(q, Buffer.from('CONN'));
    for(var i = 0; i < 5; i++){
      eventHandler('CONN');
    }    
    ch.consume(q, function(msg) {
      console.log(" [x] Received %s", msg.content.toString());
    }, {noAck: true});
  });
});

var eventHandler = (code) => {
    console.log(`About to handle with code: ${code}`);
    var eveObject = {};
    eveObject.instanceId = instanceId;
    eveObject.scode = code;
    eveObject.cCode = 'EXIT';
    eveObject.host = os.hostname();
    eveObject.type = 'LinuxBox';
    channel.sendToQueue(q, Buffer.from(JSON.stringify(eveObject)));
    console.log(" [x] Sent %s", JSON.stringify(eveObject));
}

//Exit Events
process.on('SIGINT', eventHandler);
process.on('SIGTERM', eventHandler);
process.on('SIGBREAK', eventHandler);
process.on('EVE007', eventHandler);
process.on('exit', eventHandler);
/*process.on('SIGKILL', eventHandler);
process.on('SIGSTOP', eventHandler);*/


//event simulation logic
ipc.config.id = 'rmq-server';
ipc.config.retry = 1500;
ipc.config.silent = true;
ipc.serve(() => ipc.server.on('eve007', (message) => {
  for(var i = 0; i < 5; i++){
    eventHandler('EVE007');
  } 
}));
ipc.server.start();