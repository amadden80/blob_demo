// Andrew Madden


var ajm = ajm || {}

  ajm.TWO_PI = Math.PI * 2.0

  ajm.range = function(start, count){
    var vector = [];
    for (var i = 0; i < count; i++) {
        vector.push(start + i);
    }
    return vector;
  }  

  ajm.linspace = function(lowNum, highNum, numSamples){
    var aToB = ajm.range(0, numSamples);
    var dif = highNum - lowNum;
    for (var i = 0; i < numSamples; i++) {
        aToB[i] = ((aToB[i]/(numSamples-1)) * dif) + lowNum;
    }
    return aToB;
  }


  ajm.cumsum = function(vect){
    var cumSum = 0;
    var cumSumVect = new Array(vect.length);
    for (var i = 0; i < vect.length; i++) {
        cumSum += vect[i];
        cumSumVect[i] = cumSum;
    }
    return cumSumVect;
  }

  ajm.normalize = function(array, newMax){
    newMax = newMax || 0.9999;
    var maxVal = 0.0;
    for (var i = 0; i < array.length; i++) {
      maxVal = Math.max(Math.abs(array[i]), maxVal);
    }
    for (i = 0; i < array.length; i++) {
      array[i] = newMax * (array[i] / maxVal);
    }
    return array;
  }

  ajm.applyFadeIn = function(array, sampsIn){
    var ramp = ajm.linspace(0.0, 1.0, sampsIn);
    for (i = 0; i < ramp.length; i++) {
      array[i] = (array[i] * ramp[i]);
    }
    return array;
  }

  ajm.applyFadeOut = function(array, sampsIn){
    var ramp = ajm.linspace(0.0, 1.0, sampsIn);
    var arrayLength = array.length;
    for (i = 0; i < ramp.length; i++) {
      array[arrayLength-i-1] = (array[arrayLength-i-1] * ramp[i]);
    }
    return array;
  }

  ajm.applyFades = function(array, numSamples){
    array = ajm.applyFadeIn(array, numSamples);
    array = ajm.applyFadeOut(array, numSamples);
    return array;
  }

  ajm.time_gen = function(seconds, fs){
    return ajm.linspace(0, seconds, seconds*fs-1);
  }

  ajm.make_tone = function(freq, seconds, fs, amplitude){
    var tone = ajm.time_gen(seconds, fs);
    var phase_progress = ajm.TWO_PI * freq;
    for (var i=0;  i<tone.length; i++){
      tone[i] = amplitude * Math.sin(tone[i] * phase_progress);
    }
    return tone;
  }

  ajm.make_slide_tone = function(startFreq, endFreq, seconds, fs, amplitude){
    var tone = ajm.linspace(startFreq, endFreq, (fs * seconds));
    var phase_progress = (1/fs) * ajm.TWO_PI;
    var loc_cumsum = 0;
    for (var i=0;  i<tone.length; i++){
      loc_cumsum += tone[i] * phase_progress
      tone[i] =  amplitude * Math.sin(loc_cumsum)
    }
    return tone;
  }

  ajm.s_to_h = function(str) {
    var out_hex = '';
    for(var i=0; i<str.length; i++) {
      out_hex += str.charCodeAt(i).toString(16) + '';
    }    
    return parseInt(out_hex, 16);
  }

  ajm.make_audio_blob = function(buffer, fs, channels){
    var wav_buffer = ajm.wave(buffer, fs, channels)
    var blob = new Blob(wav_buffer, {type:'audio/wav'});
    window.URL = window.URL || window.webkitURL;
    var url = window.URL.createObjectURL(blob);
    return url;
  }

  // Convert to 16-bit interger
  ajm.to_16 = function(sample){
    if (sample >= 1) {
      return (1 << 15) - 1;
    }
    else if (sample <= -1) {
      return -(1 << 15);
    }
    else {  
      return Math.round(sample * (1 << 15));
    }
  }

  ajm.wave = function(buffer, fs){
   
    var fs = fs || 44100;
    var channels = 1
    var buffer_position = 0;
    var wav_buffer = new Int16Array(buffer.length + 23);

    wav_buffer[0] = ajm.s_to_h("IR")
    wav_buffer[1] = ajm.s_to_h("FF")
    wav_buffer[2] = (2*buffer.length + 15) & 0x0000ffff; // RIFF size
    wav_buffer[3] = ((2*buffer.length + 15) & 0xffff0000) >> 16; // RIFF size
    wav_buffer[4] = ajm.s_to_h("AW")
    wav_buffer[5] = ajm.s_to_h("EV")
    wav_buffer[6] = ajm.s_to_h("mf")
    wav_buffer[7] = ajm.s_to_h(" t")
    wav_buffer[8] = 18; //chunksize
    wav_buffer[9] = 0;
    wav_buffer[10] = 1; // format
    wav_buffer[11] = 1; // channels
    wav_buffer[12] = fs & 0x0000ffff; // sample per sec
    wav_buffer[13] = (fs & 0xffff0000) >> 16; 
    wav_buffer[14] = (2*channels*fs) & 0x0000ffff; // byte per sec
    wav_buffer[15] = ((2*channels*fs) & 0xffff0000) >> 16; 
    wav_buffer[16] = 4; // block align
    wav_buffer[17] = 16; // bit per sample
    wav_buffer[18] = 0; // cb size
    wav_buffer[19] = ajm.s_to_h("ad")
    wav_buffer[20] = ajm.s_to_h("at")
    wav_buffer[21] = (2*buffer.length) & 0x0000ffff; // data size[byte]
    wav_buffer[22] = ((2*buffer.length) & 0xffff0000) >> 16;

    for (var i = 0; i < buffer.length; i++) {
      wav_buffer[i+23] = ajm.to_16(buffer[i]);
    }

    var mini_buffer_len = 1024
    var buffer_progress = mini_buffer_len
    var mini_buffer = [];
    var wav_array = [];

    for (var i = 0; i < wav_buffer.length; i+=buffer_progress){

      if( i + mini_buffer_len >= wav_buffer.length ){
       mini_buffer_len = wav_buffer.length - i;
      }

      mini_buffer = new Int16Array(mini_buffer_len)
    
      for(var n=0; n<mini_buffer.length; n++){
        mini_buffer[n] = wav_buffer[i+n];
      }

      wav_array.push(mini_buffer.buffer)
    }
    return wav_array;
  };


// A collection of generators using ajm
ajm.gen = ajm.gen || {};

  ajm.gen.tone_blob =  function(freq, seconds, fs, amplitude){
    var buffer = ajm.make_tone(freq, seconds, fs, amplitude);
    buffer = ajm.applyFades(buffer, 100);
    var url = ajm.make_audio_blob(buffer, fs);
    return url;
  }

  ajm.gen.slide_blob = function(startFreq, endFreq, seconds, fs, amplitude){
    var buffer = ajm.make_slide_tone(startFreq, endFreq, seconds, fs, amplitude);
    buffer = ajm.applyFades(buffer, 100);
    var url = ajm.make_audio_blob(buffer, fs);
    return url;
  }

