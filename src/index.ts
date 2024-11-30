import { Simulation } from "./simulation";
import { Fade } from "./fade";
import { Renderer } from "./renderer";
import { getGradient } from "./color";
import { AudioAnalyzer } from "./audioAnalyzer"; // Import AudioAnalyzer

document.addEventListener("DOMContentLoaded", () => {
  const main = async () => {
      const renderer = new Renderer();
      const simulation = new Simulation({
          numberOfParticles: 10000, // smaller number of particles leads to less lag
          sphereRadius: 50,
          backgroundColor: 0x000,
          particleSize: 0.02, // bigger number for bigger particles
          gradient: getGradient("fire"), // try spectral, ice etc. for other options
      });
      const fade = new Fade({ alpha: 0.05 });

      // This part will be moved inside a user interaction callback to ensure browser compatibility
      const playButton = document.getElementById("play-button") as HTMLButtonElement;

      // Ensure the button is found
      if (!playButton) {
          console.error("Play button not found!");
          return;
      }

      playButton.addEventListener("click", async () => {
          // Create and initialize AudioContext only after user interaction
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

          // Create and configure AudioAnalyzer with AudioContext
          const audioAnalyzer = new AudioAnalyzer(audioContext); // Pass audioContext to AudioAnalyzer

          // Get user media (microphone input)
          try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              console.log("Microphone stream:", stream);  // Log stream to ensure it's not null

              // Create MediaStreamAudioSourceNode from the microphone stream
              const source = audioContext.createMediaStreamSource(stream);

              // Connect the source to the analyzer node
              source.connect(audioAnalyzer.getAnalyserNode());

              // Do NOT connect the source to the destination to avoid audio feedback
              // source.connect(audioContext.destination);  // This is the speakers

              console.log("Microphone access granted");
          } catch (err) {
              console.error("Error accessing microphone: ", err);
          }

          // Initialize renderer and simulation after microphone access
          renderer.init();
          simulation.init();
          simulation.addToRenderer(renderer);
          fade.addToRenderer(renderer);

          let step = 0;
          function animate() {
              requestAnimationFrame(animate);

              // Update frequency data
              audioAnalyzer.updateFrequencyData();

              // Get frequency data from audio analyzer
              const frequencyData = audioAnalyzer.getFrequencyData();

              // Log frequency data to check if it's updating
              console.log("Frequency data:", frequencyData);

              // Pass frequency data to simulation update
              simulation.update({ deltaTime: 1, step, frequencyData });

              renderer.render();
              step += 1;
          }
          requestAnimationFrame(animate);
      });
  };

  main(); // Call the main function when DOM is loaded
});
