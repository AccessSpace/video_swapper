var pigpio = require('pigpio')
var Gpio = pigpio.Gpio;
try{
	pigpio.initialize();
} catch {
	pigpio.terminate();
	process.exit();
}
process.on('SIGINT', function () {
	layers[0].stop();
	layers[1].stop();
	pigpio.terminate(); // pigpio C library terminated here

});

var LogicalDebounceTimeMS = 2000;

var  button = new Gpio(4, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    edge: Gpio.RISING_EDGE,
    alert:true
  }),
  button2 = new Gpio(22, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    edge: Gpio.RISING_EDGE,
    alert:true
  });
  
button.glitchFilter(10000);
button2.glitchFilter(10000);


var lastStateChange = 0;


if(button.digitalRead() ==1 && button2.digitalRead() ==1 ){
	process.exit();
}

const omx = require('omx-layers');


let layers = [];
const numLayers = 2;

for (var i=0; i<numLayers; i++) {
    layers.push(
        new omx({
            audioOutput: 'local',
            blackBackground: false,
            disableKeys: true,
            loop: true,
            disableOnScreenDisplay: true,
            layer: i
        })
    );
}


button.on('alert', function (value, tick) {
	console.log("button", value);
		toggleVideo(); 
});

button2.on('alert', function (value,tick) {
	console.log("button2", value);
		toggleVideo(); 
});




layers[0].open('/home/pi/video_swapper/Alternative Architecture 02_2 version.mp4');

layers[1].open('/home/pi/video_swapper/white_noise.mp4.mp4');

function toggleVideo(){
	var newTime = Date.now();
	console.log(newTime , lastStateChange,newTime - lastStateChange);
	if ((newTime - lastStateChange) < LogicalDebounceTimeMS){
		return;
	}
	lastStateChange = newTime;
	layers[1].getPlayStatus().then( status => {
		console.log("status", status);
		if(status == "playing"){
			console.log("Pausing layer 1")
			layers[1].pause();
			layers[1].setVisibility(false);
			layers[0].resume();
		} else {
			console.log("Playing layer 1")
			layers[0].pause();
			layers[1].setVisibility(true);
			layers[1].resume();
		}
	});
};
