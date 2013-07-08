
// Creates an audio tag using a blob wavefile
// The node is placed into the DOM and then removed shortly after
  beep = function(seconds,  frequency, fs, amplitude){
    var url = ajm.gen.tone_blob(frequency, seconds, fs, amplitude) 
    node = $('<audio autoplay=true>').append($('<source>').attr('src', url))
    setTimeout(function(){
      window.URL.revokeObjectURL(url)
      $(node).remove();
    }, seconds*3)
  }


// Creates an audio tag using a blob wavefile
// The node is placed into the DOM and then removed shortly after
  sweep = function(startFreq, endFreq, seconds, fs, amplitude){
    var url = ajm.gen.slide_blob(startFreq, endFreq, seconds, fs, amplitude) 
    node = $('<audio autoplay=true>').append($('<source>').attr('src', url))
    setTimeout(function(){
      window.URL.revokeObjectURL(url)
      $(node).remove();
    }, seconds*3)
  }



$(function(){

  // Set key parameters of a sine wave
  var seconds = 5;
  var frequency = 440;
  var startFreq = 20;
  var endFreq = 20000;
  var fs = 44100;
  var amplitude = 0.3;
  var count = 0;



  $('#single-beep').on('click', function(){
    seconds = Math.random()*2+0.1;
    frequency = Math.random()*1000+30;
    amplitude =  Math.random()*0.5;
    beep(seconds,  frequency, fs, amplitude)
  })


  $('#single-sweep').on('click', function(){
    startFreq = Math.random()*5000+30;
    endFreq = Math.random()*5000+30;
    seconds = Math.random()*2+0.1;
    amplitude =  Math.random()*0.3;
    sweep(startFreq, endFreq, seconds, fs, amplitude)
  });


  var count = 0;
  var beep_ready = true
  $('#many-beeps').on('click', function(){
    $('#many-beeps').hide()

      timer = setInterval(function(){
        seconds = Math.random()*1+0.1;
        frequency = Math.random()*1000+30;
        amplitude =  Math.random()*0.1;
        // Create the wavefile, place on page, play the audio
        beep(seconds,  frequency, fs, amplitude)
        // Increase the counter
        $('#count').text(count++);
      }, 125)

      setTimeout(function(){clearInterval(timer);}, 5000)

  });


})
