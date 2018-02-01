var SerialPort = require('serialport');
var io = require('socket.io-client');
var exec = require('child_process');


SerialPort.list(function(data){ console.log(arguments); });

var port = new SerialPort('COM7', {
  baudRate: 9600
});
var socket = io('http://wnm-app.local:5000/');


var lastKeepAlive = new Date();
setInterval(function(){
	if(new Date() - lastKeepAlive > 20000){
		//reboot
		console.log('Rebooting');
		exec('shutdown /r', function(err, stdout, stderr){
			console.log('stdout', stdout);
			console.log('stderr', stderr);
		});
	}
}, 2000);

port.on('data', function(data){
  var str = new String(data);
console.log('data: ', str);
  for (var i = 0; i < str.length; i++) {
    switch(str.charAt(i)){
      case 'U':
        socket.emit('controlroom:unbroken');
        break;
      case 'B':
        socket.emit('controlroom:broken');
        break;
      case 'P':
        lastKeepAlive = new Date();
        break;
    }
  }
});

socket.on('controlroom:startAlarm', function(){
  console.log('start alarm!');
  port.write('1');
});
socket.on('controlroom:stopAlarm', function(){
  console.log('false alarm...');
  port.write('0');
});
