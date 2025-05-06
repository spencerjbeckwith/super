import { AudioEngine, IntroTrack, MusicTrack, SoundEffect } from "supersound";

// Initialize engine and our audio resources
const ae = new AudioEngine();
const sound1 = new SoundEffect(ae.context, "assets/sound1.wav", 4);
const sound2 = new SoundEffect(ae.context, "assets/sound2.wav", 4);
const music = new MusicTrack(ae.context, "assets/music.mp3");
const intro = new IntroTrack(ae.context, "assets/intro.mp3");

// Don't forget to register every audio resource!
ae.register(sound1);
ae.register(sound2);
ae.register(music);
ae.register(intro);

// In a larger project, you may want to intialize and connect all audio in one file,
// then export those sound effects to be imported where needed.

// Find all our buttons
const button1: HTMLButtonElement = document.querySelector("#sound1");
const button2: HTMLButtonElement = document.querySelector("#sound2");

const musicButton: HTMLButtonElement = document.querySelector("#music");
const introButton: HTMLButtonElement = document.querySelector("#intro");

const fadeInButton: HTMLButtonElement = document.querySelector("#fadein");
const fadeOutButton: HTMLButtonElement = document.querySelector("#fadeout");

const stopButton: HTMLButtonElement = document.querySelector("#stop");

// Add our callbacks to the buttons
button1.addEventListener("click", () => sound1.play());
button2.addEventListener("click", () => sound2.play());

musicButton.addEventListener("click", () => music.play());
introButton.addEventListener("click", () => {
    music.stop();
    intro.play(() => music.play());
});

fadeInButton.addEventListener("click", () => music.fadeIn(8));
fadeOutButton.addEventListener("click", () => music.fadeOut(8));

stopButton.addEventListener("click", () => {
    sound1.stop();
    sound2.stop();
    music.stop();
    intro.stop();
});
