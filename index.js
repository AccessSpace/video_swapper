const omx = require('omx-layers');

var Gpio = require('pigpio').Gpio,
  button = new Gpio(4, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    edge: Gpio.RISING_EDGE
  }),
  button2 = new Gpio(22, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    edge: Gpio.RISING_EDGE
  });
  
button.glitchFilter(100000);
button2.glitchFilter(100000);

if(button.digitalRead() ==1 && button2.digitalRead() ==1 ){
	process.exit();

}

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

layers[0].open('/home/pi/video_swapper/Alternative Architecture 02_2 version.mp4');

layers[1].open('/home/pi/video_swapper/white_noise.mp4.mp4');

function toggleVideo(){
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

button.on('interrupt', function (value) {
	console.log("button", value);
		toggleVideo(); 
});

button2.on('interrupt', function (value) {
	console.log("button", value);
		toggleVideo(); 
});

process.on('SIGINT', function () {
	layers[0].stop();
	layers[1].stop();
	//button.unexport();
});
