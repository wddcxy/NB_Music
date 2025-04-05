class EffectManager {
    /**
     * 音效控制组件 @782
     * @param {import("./AudioPlayer.js")} audioPlayer
     * @param {import("./SettingManager.js")} settingManager
     */
    constructor(audioPlayer, settingManager) {
        this.audioPlayer = audioPlayer;
        this.settingManager = settingManager;
        this.audioContext = new AudioContext();
        this.mediaSource = this.audioContext.createMediaElementSource(audioPlayer.audio);
        this.frequencies = [100, 200, 400, 600, 1000, 3000, 6000, 12000, 14000, 16000];
        this.frequencyFilters = new Object();
        this.initializeAnalyzer();
        this.initializeEqualizer();
        this.initializeElements();
        this.connectDestination();
    }

    initializeElements() {
        /**
         * @type {HTMLButtonElement}
         */
        const effectbtn = document.querySelector(".play-container .effect-btn");
        const effectdialog = document.querySelector("#audioEffectDialog");
        const effectdialogcontent = effectdialog.querySelector(".dialog");
        effectbtn.addEventListener("click", () => {
            effectdialog.classList.remove("hide");
        });
        document.addEventListener("keydown", (e) => {
            if (e.key == "Escape" && !effectdialog.classList.contains("hide")) {
                effectdialog.classList.add("hide");
            }
        });
        effectdialogcontent.querySelectorAll(".equalizer-item>.slider").forEach((element) => {
            element.addEventListener("input", (e) => {
                this.adjustFrequency(e.target.dataset.adjust, e.target.value);
            });
        });
        effectdialog.querySelector(".close-btn").addEventListener("click", () => {
            effectdialog.classList.add("hide");
        });
    }
    initializeAnalyzer() {
        const analyserNode = this.audioContext.createAnalyser();
        this.analyserNode = analyserNode;
        analyserNode.fftSize = 128;
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const settings = this.settingManager.settings;

        const canvas = document.querySelector("#frequency");
        const canvasCtx = canvas.getContext("2d");

        function draw() {
            analyserNode.getByteFrequencyData(dataArray);
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            const gradient = canvasCtx.createLinearGradient(
                0,
                canvas.height - 255,
                canvas.width,
                canvas.height
            );
            gradient.addColorStop(0, settings.primaryColor);
            gradient.addColorStop(1, settings.secondaryColor);
            canvasCtx.fillStyle = gradient;
            const sliceWidth = (canvas.width * 1.0) / bufferLength / 2;
            let x = canvas.width / 2;
            for (var i = 0; i < bufferLength; i++) {
                var v = dataArray[i] - 128.0;
                canvasCtx.fillRect(x, canvas.height - v, sliceWidth - 3, v);
                canvasCtx.fillRect(x - i * 2 * sliceWidth, canvas.height - v, sliceWidth - 3, v);
                x += sliceWidth;
            }
            window.requestAnimationFrame(draw);
        }

        draw();
    }

    initializeEqualizer() {
        this.frequencies.forEach((frequency, index) => {
            const filter = this.audioContext.createBiquadFilter();
            filter.type = "peaking";
            filter.frequency.value = frequency;
            filter.Q.value = 1;
            filter.gain.value = 0;
            this.frequencyFilters[frequency] = filter;
            if (index != 0) {
                this.frequencyFilters[this.frequencies[index - 1]].connect(
                    this.frequencyFilters[frequency]
                );
            }
        });
    }

    adjustFrequency(frequency, value) {
        this.frequencyFilters[frequency].gain.value = value;
    }

    connectDestination() {
        this.mediaSource.connect(this.frequencyFilters[this.frequencies[0]]);
        this.frequencyFilters[this.frequencies[this.frequencies.length - 1]].connect(
            this.analyserNode
        );
        this.analyserNode.connect(this.audioContext.destination);
    }
}

module.exports = EffectManager;
