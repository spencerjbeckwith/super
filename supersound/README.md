# supersound

supersound is an audio engine for browser games or other sound applications. It is a fast, stable, and simple way to load and play audio files as sound or music tracks.

## Capabilities

- Play multiple sound effects simultaneously, as well as the same sound multiple times at once
- Play looping music tracks that can fade in or out
- Play intro tracks that do something when they're done (such as play another track)

## Usage

In order to use supersound you must also be using a tool such as [rollup](https://rollupjs.org/guide/en/) or [webpack](https://v4.webpack.js.org/) that can pull in code from node dependencies and run it in the browser. See the `examples` directory for example configurations.

> ```npm install supersound```

In order to get started, you need an instance of `AudioEngine`. This is a very simple initialization:

```typescript
import { AudioEngine } from "supersound";

const ae = new AudioEngine();
```

Next you will need to define your audio resources (sound effects, music, or intro tracks). To instantiate them, you will need a reference to the `AudioEngine`'s `AudioContext`. Alternatively, you may provide your own `AudioContext` from the Web Audio API to use with these classes if you want a more advanced graph.

```typescript
import { SoundEffect, MusicTrack, IntroTrack } from "supersound";

const music = new MusicTrack(ae.context, "path/to/file.ogg");
const sound1 = new SoundEffect(ae.context, "path/to/file.wav", 4); // Sound effect needs number of channels
const introTrack = new IntroTrack(ae.context, "path/to/file.mp3");
```

The sources must be registered onto the `AudioEngine`. This is what connects them to the graph and to the actual output of your system. If you forget to call `.register()` on a sound effect, it will not be able to play!

```typescript
ae.register(music);
ae.register(sound1);
ae.register(introTrack);
```

At this point, the audio is ready to be played!

```typescript
music.play();
music.fadeout(5);
sound1.play();
introTrack.play(() => music.play()); // Callback runs when the IntroTrack finishes playing
```

## Troubleshooting

### Autoplay

Most browsers will not allow a page to begin playing media before a user interacts with the page. Therefore, avoid starting any sound effects until after the user has done something: for example, a game may begin with a "click to start" or some other form of acknowledgment before the title screen.

### Running Locally (CORS)

Browsers may complain when attempting to load from the local file system (due to CORS). Therefore in development it is best to always serve your applications with a tool such as [serve](https://www.npmjs.com/package/serve). See the examples folder for an example usage. If you open your application over the `file://` protocol audio may not play and you will probably see CORS errors or warnings in the console.

### Error Handling

supersound can play any audio that is playable by the running browser. It doesn't handle errors when a resource fails to load or play - it will simply not play rather than throw exceptions.

Sounds that fail to load will appear in the network tab of browser dev tools as well as the console.

You may see the following error, or one similar to it, if attempting to play a sound that wasn't able to load:

> Uncaught (in promise) DOMException: The media resource indicated by the src attribute or assigned media provider object was not suitable.