Wolf.Sound = (function () {
    var currentMusic,
        music,
        audioContext,
        fxVolume = 80, // volumes in %, 0 to 100
        musicVolume = 60;

    const sounds = { // rather than check if a saved sound has a panner, keep them separate 
        withPanner: [],
        noPan: [],
    };


    function createAudioElement(addPanner, file) {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } else if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        var audio = new Audio();

        // Check if the audio element is already connected to a MediaElementSourceNode
        if (!audio.mediaElementSource) {
            audio.mediaElementSource = audioContext.createMediaElementSource(audio);

            if (addPanner) {
                audio.panner = audioContext.createStereoPanner();
                audio.mediaElementSource.connect(audio.panner).connect(audioContext.destination);
            } else {
                audio.mediaElementSource.connect(audioContext.destination);
            }
        }

        audio.src = file;
        return audio;
    }



    function startSound(file, player, posSound) {
        var panner = (typeof player == "object");
        let audioDataList = panner ? sounds.withPanner : sounds.noPan;
        if (!audioDataList[file]) {
            audioDataList[file] = [];
        }

        let audioData = audioDataList[file].find(ad => ad.ended || ad.paused) || createAudioElement(panner, file);

        if (!audioDataList[file].includes(audioData)) {
            audioDataList[file].push(audioData);
        }


        if (panner) {
            const dx = (posSound.x - player.position.x) / Wolf.TILEGLOBAL;
            const dy = (posSound.y - player.position.y) / Wolf.TILEGLOBAL;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angleDifference = Wolf.FINE2RAD(player.angle) - Math.atan2(dy, dx);
            
            audioData.panner.pan.value = Math.sin(angleDifference);
            audioData.volume = fxVolume / (100 + dist * 2);
        } else {
            audioData.volume = fxVolume / 100;
        }

        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        audioData.play();
    }

    function startMusic(file) {
        if (musicVolume > 0) {
            if (!music) {
                music = new Audio();
                music.loop = true;
                music.volume = musicVolume / 100;  // Set initial volume
            }
            if (currentMusic !== file) {
                music.src = file;
                currentMusic = file;
            }
            pauseMusic(musicVolume == 0);
        }
    }
    function stopAllSounds() {
        sounds.withPanner.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        sounds.noPan.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
    }

    function getFxVolume() {
        return fxVolume;
    }

    function getMusicVolume() {
        return musicVolume;
    }

    function setFxVolume(volume) {
        fxVolume = volume;
    }

    function setMusicVolume(volume) {
        musicVolume = volume;
        if (music) {
            music.volume = parseInt(volume, 10) / 100; // .volume from 0 to 1
        }
        pauseMusic(musicVolume == 0);
    }

    function pauseMusic(pause) {
        if (music) {
            if (pause) {
                music.pause();
            } else if (music.paused) {
                music.play();
            }
        }
    }

    if (Modernizr.audio) {
        return {
            startSound : startSound,
            startMusic : startMusic,
            stopAllSounds : stopAllSounds,
            getFxVolume : getFxVolume,
            getMusicVolume : getMusicVolume,
            setFxVolume : setFxVolume,
            setMusicVolume : setMusicVolume,
            pauseMusic : pauseMusic
        };
    } else {
        return {
            startSound : Wolf.noop,
            startMusic : Wolf.noop,
            stopAllSounds : Wolf.noop,
            getFxVolume : Wolf.noop,
            getMusicVolume : Wolf.noop,
            setFxVolume : Wolf.noop,
            setMusicVolume : Wolf.noop,
            pauseMusic : Wolf.noop
        };
    }
})();
