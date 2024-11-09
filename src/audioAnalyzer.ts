class AudioAnalyzer {
    private analyser: AnalyserNode;
    private frequencyData: Uint8Array;

    constructor(audioContext: AudioContext) {
        this.analyser = audioContext.createAnalyser();
        this.analyser.fftSize = 2048; // Set FFT size (controls resolution of frequency data)
        const bufferLength = this.analyser.frequencyBinCount;
        this.frequencyData = new Uint8Array(bufferLength);
    }

    getAnalyserNode() {
        return this.analyser; // Expose analyser node for connection
    }

    updateFrequencyData() {
        this.analyser.getByteFrequencyData(this.frequencyData); // Update frequency data
    }

    getFrequencyData() {
        return this.frequencyData;
    }
}

export { AudioAnalyzer };
