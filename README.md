# Dialogue
## Custom Audio Player with Synchronized Images

This is a custom audio player that synchronizes images with specific time segments of the audio file. The images will change as the audio plays, providing a visual representation of the current segment of the audio. The player also provides standard audio controls such as play/pause, rewind, fast-forward, and volume control.

## Features

- Synchronized images with audio segments
- Play/pause button
- Rewind and fast-forward buttons
- Volume control
- Time indicator (current time and duration)
- Clickable progress bar for seeking
- Keyboard controls for seeking and play/pause

## Getting Started

1. Include the Vue.js library in your HTML file.
2. Add the custom audio player component to your HTML file.
3. Import the component in your JavaScript file.
4. Inject the data source in your main.js file.
5. Add the required CSS styles.

## Usage

To use this custom audio player, first import the component in your Vue.js project. Then, pass a JSON file containing the audio source and an array of segments as a prop to the component. Each segment should include a start time, end time, image URL, and alt text.

Example of JSON data:

```json
{
  "audioSrc": "path/to/your/audio/file.mp3",
  "segments": [
    {
      "start": 0,
      "end": 5,
      "image": "path/to/your/image1.jpg",
      "alt": "Description of image1"
    },
    {
      "start": 5,
      "end": 10,
      "image": "path/to/your/image2.jpg",
      "alt": "Description of image2"
    }
  ]
}
```

## Customization

You can easily customize the appearance of the audio player by modifying the CSS styles in the `<style>` section of the component.

## Accessibility

The audio player includes accessibility features such as ARIA roles, labels, and keyboard controls. The player supports keyboard controls for seeking, play/pause, and volume control.

## Browser Support

This custom audio player should work on modern browsers that support the HTML5 `<audio>` element, including Chrome, Firefox, Safari, and Edge.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
