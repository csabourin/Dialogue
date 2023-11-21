# README.md for Custom Audio Player with JSON Configuration

## Overview

This Vue.js component is a custom audio player enhanced with features like image synchronization, closed captions (CC), playback controls, and dynamic transcripts. The configuration of the audio player, including audio source, subtitles, and segments, is managed via a JSON file.

## Features

- **Synchronized Images**: Displays images in sync with specific audio segments.
- **Closed Captions**: Offers CC functionality with the ability to toggle on and off.
- **Playback Controls**: Includes play/pause, rewind, forward, and volume control.
- **Dynamic Transcripts**: Displays transcripts with active segment highlighting.
- **Responsive Design**: Adapts to different screen sizes.
- **Accessibility**: Accessible controls with ARIA labels and roles.

## Installation

1. **Clone the Repository**: Clone or download this repository to your local machine.
2. **Install Dependencies**: Run `npm install` to install necessary dependencies.
3. **Integration**: Include this component in your Vue.js project.

## Usage

### Template

Add the provided template into your Vue.js project, maintaining the structure and class names for functionality.

### Script

- Import the component into your Vue.js application.
- Add the script part of the component in your components directory.
- Customize data properties as required for your application.

### Styling

- Apply custom CSS to match your design requirements.
- Ensure CSS selectors match those in the template for consistency.

## Configuration

The component is configured using a JSON file. Here is an example structure:

```json
{
  "audioSrc": "./Audio/DDN237_pov_1_fr.mp3",
  "subtitleSrc": "./Audio/DDN237_pov_1_fr.xml",
  "segments": [
    {
      "start": 0,
      "end": 12.835,
      "image": "./images/Dave.png",
      "alt": "Description of the first image.",
      "captionColor": "#ffbbbb"
    },
    // Additional segments...
  ]
}
```

### Fields

- **audioSrc**: Path to the audio file.
- **subtitleSrc**: Path to the subtitle file.
- **segments**: Array of objects representing each segment with the following fields:
  - **start**: Start time of the segment in seconds.
  - **end**: End time of the segment in seconds.
  - **image**: Path to the image file.
  - **alt**: Alt text for the image.
  - **captionColor**: Color code for the caption text.

### Customization

- Modify the `audioSrc` and `subtitleSrc` paths according to your file structure.
- Update the `segments` array based on your audio and image synchronization needs.

## Limitations

- **Browser Compatibility**: Test across different browsers for full compatibility.
- **Responsive Design**: Additional adjustments might be needed for extreme screen sizes.

## Contributing

Contributions are welcome to enhance this component. Please follow the standard GitHub process - fork, make changes, and submit a pull request for review.
