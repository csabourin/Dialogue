<template>
  <div style="font-family: sans-serif">
    <div style="width: 100%; display: flex; justify-content: center">
      <div class="speech-bubble" ref="imageContainer" style="">
        <img
          ref="image"
          :key="currentImage"
          :src="currentImage"
          :alt="
            segments.length > 0
              ? `Image illustrating the current audio segment: ${segments[currentSegmentIndex].alt}`
              : ``
          "
          class="image"
          :style="imageStyle"
        />
        <div v-if="ccEnabled" class="captions-container">
          <span class="caption" :style="{ color: currentCaptionColor }">{{
            displayedCaption
          }}</span>
        </div>
      </div>
    </div>
    <div v-if="audioSrc" class="audioPlayer no-select">
      <div
        ref="progressBar"
        role="slider"
        tabindex="0"
        aria-valuemin="0"
        aria-label="Play progress bar"
        title="Play progress bar"
        :aria-valuemax="Math.round(duration)"
        :aria-valuenow="playing ? `` : Math.round(currentTime)"
        :aria-valuetext="playing ? `` : `Current time: ${formattedCurrentTime}`"
        style="width: 100%; height: 15px; cursor: pointer"
        @click="seek"
        @mousedown="startSeek"
        @mousemove="updateSeek"
        @mouseup="stopSeek"
        @keydown.space.prevent="playPause"
        @keydown.left.prevent="seekByKeyboard(-5)"
        @keydown.right.prevent="seekByKeyboard(5)"
      >
        <div
          :style="{
            width: progress + '%',
            height: '100%',
            backgroundColor: '#889',
          }"
        ></div>
      </div>
      <div
        class="time-wrapper"
        aria-live="off"
        style="display: flex; justify-content: space-between"
      >
        <span>{{ formattedCurrentTime }} / {{ formattedDuration }}</span>
      </div>
      <audio ref="audio" @timeupdate="updateImage" @ended="reset">
        <source :src="audioSrc" type="audio/mpeg" />
      </audio>
      <div class="control-buttons">
        <div style="flex-grow: 0.5"></div>

        <div class="buttons-wrapper">
          <button
            @click="rewind"
            :title="$t('rewind')"
            class="control-button rewind"
            :aria-label="$t('rewind')"
          >
            <img :src="'./Buttons.svg#Rewind'" width="38" :alt="$t('rewind')" />
          </button>
          <button
            ref="playPauseBtn"
            @click="playPause"
            @keydown.space.prevent="playPause"
            tabindex="0"
            :title="playing ? $t('pause') : $t('play')"
            :aria-label="playing ? $t('pause') : $t('play')"
            class="control-button play-pause"
          >
            <img
              :src="playing ? './Buttons.svg#Pause' : './Buttons.svg#Play'"
              :alt="playing ? $t('pause') : $t('play')"
              width="38"
            />
          </button>

          <button
            @click="forward"
            :title="$t('forward')"
            :aria-label="$t('forward')"
            class="control-button forward"
          >
            <img :src="'./Buttons.svg#Forward'" width="38" :alt="$t('forward')" />
          </button>
        </div>
        <button
          @click="toggleCC"
          :title="ccEnabled ? this.$t('turnCCOff') : this.$t('turnCCOn')"
          :aria-label="
            ccEnabled
              ? this.$t('turnClosedCaptionsOff')
              : this.$t('turnClosedCaptionsOn')
          "
          :class="[
            'control-button',
            'cc-toggle',
            { 'cc-toggle--active': ccEnabled },
          ]"
        >
          CC
        </button>
        <div class="volume-wrapper">
          <label class="volumeButton" for="volume"><img :src="'./Buttons.svg#Speaker'" width="22" :alt="$t('volumeControl')" /></label
          ><input
            class="volume-slider"
            :aria-label="$t('volumeControl')"
            type="range"
            min="0"
            max="100"
            v-model="volume"
            @change="changeVolume"
            @mousedown="startVolumeChange"
            @mousemove="updateVolume"
            @mouseout="stopVolumeChange"
            @mouseup="stopVolumeChange"
            tabindex="0"
          />
        </div>
      </div>
    </div>
    <details class="transcript">
      <summary>Transcript</summary>
      <div
        v-for="(subtitle, index) in subtitles"
        :key="index"
        class="transcript-entry"
        :class="{ active: currentSubtitleIndex === index }"
      >
        <span class="transcript-text" v-html="subtitle.text"></span>
      </div>
    </details>
  </div>
</template>

<script>
export default {
  inject: ["datasource"], // inject datasource from main.js
  data() {
    return {
      volume: 50,
      firstImageHeight: 0,
      animating: false,
      seeking: false,
      changingVolume: false,
      currentSegmentIndex: 0,
      isImage1OnTop: true,
      playing: false,
      currentImage: "",
      previousImage: "",
      audioSrc: "",
      segments: [],
      progress: 0,
      duration: 0,
      currentTime: 0,
      currentCaption: "",
      subtitles: [],
      currentSubtitleIndex: 0,
      ccEnabled: false,
    };
  },
  async mounted() {
    await this.loadData(); // fetch JSON data
    // preload images
    this.segments.forEach((segment, index) => {
      const img = new Image();
      img.src = segment.image;
      if (index === 0) {
        img.onload = () => {
          this.firstImageHeight = img.height;

          // Add this part to check the image dimensions
          const aspectRatio = img.width / img.height;
          const windowWidth = window.innerWidth;

          if (img.width < windowWidth) {
            this.$refs.imageContainer.style.width = img.width + "px";
            this.$refs.imageContainer.style.height =
              img.width / aspectRatio + "px";
          } else {
            this.$refs.imageContainer.style.width = windowWidth + "px";
            this.$refs.imageContainer.style.height =
              windowWidth / aspectRatio + "px";
          }
        };
      }
    });
    this.currentImage = this.segments[0].image;
    // add event listener to set duration when metadata is loaded
    this.$refs.audio.addEventListener("loadedmetadata", this.audioLoaded);
  },

  methods: {
    async loadData() {
      try {
        const response = await fetch(this.datasource); // fetch JSON file from datasource (injected in main.js)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        this.audioSrc = data.audioSrc;
        this.segments = data.segments;

        const vttResponse = await fetch(data.subtitleSrc);
        if (!vttResponse.ok) {
          throw new Error(`HTTP error! status: ${vttResponse.status}`);
        }
        const vttData = await vttResponse.text();
        this.subtitles = this.parseVTT(vttData);
      } catch (error) {
        console.error("Error fetching JSON data:", error);
      }
    },

    rewind() {
      if (this.$refs.audio.currentTime < 5) {
        this.$refs.audio.currentTime = 0;
        this.progress = 0;
      } else {
        this.$refs.audio.currentTime -= 5;
      }
      this.updateProgress();
    },
    forward() {
      if (this.$refs.audio.currentTime + 5 > this.$refs.audio.duration) {
        this.$refs.audio.currentTime = this.$refs.audio.duration;
      } else {
        this.$refs.audio.currentTime += 5;
      }
    },
    changeVolume() {
      this.$refs.audio.volume = this.volume / 100;
    },
    toggleCC() {
      this.ccEnabled = !this.ccEnabled;
    },

    debounce(func, wait) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    },
    playPause() {
      if (this.playing) {
        this.$refs.audio.pause();
      } else {
        this.$refs.audio.play();
      }
      this.playing = !this.playing;
    },
    updateImage() {
      const currentTime = this.$refs.audio.currentTime;
      const currentSegmentIndex = this.segments.findIndex(
        (segment) => currentTime >= segment.start && currentTime < segment.end
      );

      if (currentSegmentIndex !== this.currentSegmentIndex) {
        this.currentSegmentIndex = currentSegmentIndex;
        this.previousImage = this.currentImage;
        this.currentImage = this.segments[currentSegmentIndex].image;
      }

      this.updateProgress();

      const currentSubtitleIndex = this.subtitles.findIndex(
        (subtitle) =>
          currentTime >= subtitle.startTime && currentTime < subtitle.endTime
      );

      if (currentSubtitleIndex !== this.currentSubtitleIndex) {
        this.currentSubtitleIndex = currentSubtitleIndex;
        this.currentCaption = this.subtitles[currentSubtitleIndex];
      }
    },

    reset() {
      this.playing = false;
      this.progress = 100;
      this.$refs.audio.currentTime = 0;
    },
    updateProgress() {
      const currentTime = this.$refs.audio.currentTime;
      const duration = this.$refs.audio.duration;
      if (duration && currentTime) {
        this.progress = (currentTime / duration) * 100;
      }
    },

    seek(event) {
      const progressBar = this.$refs.progressBar;
      const rect = progressBar.getBoundingClientRect();
      const x = event.clientX - rect.left;
      let percentage = (x / progressBar.offsetWidth) * 100;

      // Clamp percentage value between 0 and 100
      percentage = Math.max(0, Math.min(100, percentage));

      this.progress = percentage;
      const duration = this.$refs.audio.duration;
      if (duration) {
        const newTime = (percentage / 100) * duration;

        // Clamp newTime value between 0 and duration
        this.$refs.audio.currentTime = Math.max(0, Math.min(newTime, duration));
      }
    },
    seekByKeyboard(offset) {
      const duration = this.$refs.audio.duration;
      if (duration) {
        let newTime = this.$refs.audio.currentTime + offset;
        newTime = Math.max(0, Math.min(newTime, duration));
        this.$refs.audio.currentTime = newTime;
      }
    },
    formatTime(time) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    },
    audioLoaded() {
      this.duration = this.$refs.audio.duration;
    },
    startSeek(event) {
      this.seeking = true;
      this.seek(event);
      window.addEventListener("mousemove", this.updateSeek);
      window.addEventListener("mouseup", this.stopSeek);
    },
    updateSeek(event) {
      if (this.seeking) {
        this.seek(event);
      }
    },
    stopSeek() {
      if (this.seeking) {
        this.seeking = false;
        window.removeEventListener("mousemove", this.updateSeek);
        window.removeEventListener("mouseup", this.stopSeek);
      }
    },

    startVolumeChange() {
      this.changingVolume = true;
    },
    updateVolume(event) {
      if (this.changingVolume) {
        this.volume = event.target.value;
        this.changeVolume();
      }
    },
    stopVolumeChange() {
      this.changingVolume = false;
    },
    parseVTT(vtt) {
      const regex =
        /(\d{2}:\d{2}:\d{2}[,.]\d{3}) --> (\d{2}:\d{2}:\d{2}[,.]\d{3})\s*(.*)/g;
      const subtitles = [];
      let match;

      while ((match = regex.exec(vtt)) !== null) {
        const startTime = this.timeStringToSeconds(match[1]);
        const endTime = this.timeStringToSeconds(match[2]);
        const text = match[3].replace(/<[^>]+>/g, ""); // Remove VTT tags from the text
        subtitles.push({ startTime, endTime, text });
      }

      return subtitles;
    },

    timeStringToSeconds(timeString) {
      const [hours, minutes, seconds] = timeString.split(":");
      const [secondsPart, milliseconds] = seconds.split(/[,.]/);
      return (
        parseInt(hours) * 3600 +
        parseInt(minutes) * 60 +
        parseInt(secondsPart) +
        parseInt(milliseconds) / 1000
      );
    },
  },
  computed: {
    imageStyle() {
      if (this.firstImageHeight === 0) {
        return "";
      }
      //   return `height: ${this.firstImageHeight}px; object-fit: contain;`;
      return `height: 100%; object-fit: contain;`;
    },
    formattedCurrentTime() {
      return this.formatTime(this.currentTime);
    },
    formattedDuration() {
      return this.formatTime(this.duration);
    },
    nextImage() {
      if (this.currentSegmentIndex < this.segments.length - 1) {
        return this.segments[this.currentSegmentIndex + 1].image;
      } else {
        return this.segments[0].image;
      }
    },
    displayedCaption() {
      return this.currentCaption ? this.currentCaption.text : "";
    },
    currentCaptionColor() {
      const currentSegment = this.segments[this.currentSegmentIndex];
      return currentSegment ? currentSegment.captionColor : "white";
    },
  },
  watch: {
    playing() {
      if (this.playing) {
        this.$refs.audio.ontimeupdate = () => {
          this.currentTime = this.$refs.audio.currentTime;
        };
      } else {
        this.$refs.audio.ontimeupdate = null;
      }
    },
    progress(newProgress) {
      const duration = this.$refs.audio.duration;
      if (duration) {
        this.currentTime = (newProgress / 100) * duration;
      }
    },
  },
};
</script>

<style>
.audioPlayer {
  color: white;
  min-width: 300px;
  max-width: 500px;
  margin: 1rem auto;
  padding: 10px;
  border-radius: 3px;
  background-color: #272727;
  border: 1px solid #1a242d;
  box-shadow: 0px 3px 6px #999;
}

.no-select {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.image {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
}
.time-wrapper {
  margin-top: 0.5rem;
}
.control-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.volumeButton {
  position: relative;
  top:3px;
}
.volume-wrapper {
  display: flex;
  align-items: center;
}

.buttons-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}
.control-button {
  display: flex;
  margin-right: 10px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  color: white;
  margin-bottom: .5rem;
}

.control-button:hover {
  box-shadow: (255,255,255,0.5);
}

.control-button:last-child {
  margin-right: 0;
}
[role="slider"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 5px;
  background-color: rgb(255, 255, 255);
  box-shadow: inset 1px 1px 2px 0 rgba(0, 0, 0, 0.5);
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.volume-wrapper label{
  margin-bottom:1rem;
}

.volume-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100px;
  height: 5px;
  background-color: lightgray;
  box-shadow: inset 1px 1px 2px 0 rgba(0, 0, 0, 0.5);
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;
  margin-bottom: 1rem;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  background-color: #ffffff;
  cursor: pointer;
  border-radius: 50%;
}

.volume-slider:focus {
  box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.2);
}

.volume-slider::-moz-range-thumb {
  width: 15px;
  height: 15px;
  background-color: #ffffff;
  cursor: pointer;
  border-radius: 50%;
}

.speech-bubble {
  position: relative;
  display: inline-block;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
}
.captions-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.6);
}

.cc-toggle {
  border: 1px solid white;
  border-radius: 5px;
  cursor: pointer;
  font-size: small;
}

.cc-toggle--active {
  background-color: white;
  color: black;
}
.caption {
  font-size: 16px;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  display: inline-block;
  max-width: 100%;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
}

.transcript {
  width: 100%;
  max-width: 500px;
  margin: 1rem auto;
  padding: 10px;
  border: 1px solid #1a242d;
  box-shadow: 0px 3px 6px #999;
}

.transcript-entry {
  display: inline;
  margin-bottom: 1rem;
  line-height: 1.5rem;
}

.transcript-entry.active {
  background-color: rgba(128, 128, 128, 0.2);
  outline: 1px solid rgba(128, 128, 128, 0.2);
}

.transcript-entry:after {
  content: " ";
}
.transcript-entry:first-of-type {
  margin-top: 1rem;
}

.transcript-time {
  font-weight: bold;
  color: #272727;
}

.transcript-text {
  margin: 0;
}
</style>
