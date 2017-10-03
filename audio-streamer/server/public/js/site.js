/**
 * Created by noamc on 8/31/14.
 */
var serverIp = "192.168.15.44";
$(document).ready(function(){
	$(".container").hide();
	$("#txtGuestName").keydown(triggerOnEnter);
	$("#txtAge").keydown(triggerOnEnter);
	$(".gender").click(function(){
		$("#hidGender").val($("input[name=gender]:checked").val());
	});
	$("#btnSubmit").click(sendLoginInfo);
	return false;
});
function triggerOnEnter(event){
	if(event.keyCode == 13){
		sendLoginInfo();
		return false;
	}
}
function validateUserId(){
	$("#hidGender").val($("input[name=gender]:checked").val());
    var regex = /^[a-zA-Z0-9]{2,30}$/;
    if (regex.test($("#txtGuestName").val())){
		if($("#txtAge").val()){
			return true;
		}else{
			alert("Please check the age");
			return false;			
		}
    }else{
		alert("Please check the username");
        return false;
    }
}
function sendLoginInfo(){
	if(validateUserId()){
		$(".login-page").hide();
		$(".container").show();		
	}
	/*if(validateUserId()){
		$(".login-page").hide();
		$(".container").show();
		alert($("#hidGender").val());
		$.ajax({
			url			: "http://"+serverIp+":1337/",
			data		: JSON.stringify({
				name	: $("#txtGuestName").val(),
				age		: $("#txtAge").val(),
				gender	: $("#hidGender").val() || "male",
			}),
			method	: "POST",
			crossDomain	: true
		}).done(function(data){
			console.log("Response:",data);
		});
	}*/
	return false;
}

$(function () {

    var client,
        recorder,
        context,
        bStream,
        contextSampleRate = (new AudioContext()).sampleRate;
        resampleRate = 8000,
        worker = new Worker('js/worker/resampler-worker.js');

    worker.postMessage({cmd:"init",from:contextSampleRate,to:resampleRate});

    worker.addEventListener('message', function (e) {
        if (bStream && bStream.writable)
            bStream.write(convertFloat32ToInt16(e.data.buffer));
    }, false);

    $("#start-rec-btn").click(function () {
		var path = $("#txtGuestName").val()+"_"+$("#txtAge").val()+"_"+$("#hidGender").val();
        client = new BinaryClient('ws://'+serverIp+':9001/'+path);
        client.on('open', function () {
            bStream = client.createStream({sampleRate: resampleRate});
        });

        if (context) {
            recorder.connect(context.destination);
            return;
        }

        var session = {
            audio: true,
            video: false
        };


        navigator.getUserMedia(session, function (stream) {
            context = new AudioContext();
            var audioInput = context.createMediaStreamSource(stream);
            var bufferSize = 0; // let implementation decide

            recorder = context.createScriptProcessor(bufferSize, 1, 1);

            recorder.onaudioprocess = onAudio;

            audioInput.connect(recorder);

            recorder.connect(context.destination);

        }, function (e) {

        });
    });

    function onAudio(e) {
        var left = e.inputBuffer.getChannelData(0);

        worker.postMessage({cmd: "resample", buffer: left});

        drawBuffer(left);
    }

    function convertFloat32ToInt16(buffer) {
        var l = buffer.length;
        var buf = new Int16Array(l);
        while (l--) {
            buf[l] = Math.min(1, buffer[l]) * 0x7FFF;
        }
        return buf.buffer;
    }

    //https://github.com/cwilso/Audio-Buffer-Draw/blob/master/js/audiodisplay.js
    function drawBuffer(data) {
        var canvas = document.getElementById("canvas"),
            width = canvas.width,
            height = canvas.height,
            context = canvas.getContext('2d');

        context.clearRect (0, 0, width, height);
        var step = Math.ceil(data.length / width);
        var amp = height / 2;
        for (var i = 0; i < width; i++) {
            var min = 1.0;
            var max = -1.0;
            for (var j = 0; j < step; j++) {
                var datum = data[(i * step) + j];
                if (datum < min)
                    min = datum;
                if (datum > max)
                    max = datum;
            }
            context.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
        }
    }

    $("#stop-rec-btn").click(function () {
        recorder.disconnect();
        client.close();
    });
});

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;