<template>
	<div style="font-family: sans-serif">
		<div style="width: 100%; display: flex; justify-content: center">
			<div class="speech-bubble" ref="imageContainer" style="">
				<img
					:key="currentImage"
					:src="currentImage"
					:alt="segments.length>0?`Image illustrating the current audio segment: ${segments[currentSegmentIndex].alt}`:``"
					class="image"
				/>
			</div>
		</div>
		<div v-if="audioSrc" class="audioPlayer">
			<audio ref="audio" @timeupdate="updateImage" @ended="reset">
				<source :src="audioSrc" type="audio/mpeg" />
			</audio>
			<div class="control-buttons">
				<button
					@click="rewind"
					title="Rewind 5s"
					class="control-button rewind"
					aria-label="Rewind 5 seconds"
				>
					&#10226;
				</button>
				<button
					ref="playPauseBtn"
					@click="playPause"
					@keydown.space.prevent="playPause"
					tabindex="0"
					:title="playing ? 'Pause' : 'Play'"
					:aria-label="playing ? 'Pause' : 'Play'"
					class="control-button play-pause"
					v-html="playing ? '&#10073;&#10073;' : '&#9654;'"
				></button>
				<button @click="stop" title="Stop" aria-label="Stop button" class="control-button stop">
					&#9724;
				</button>
				<button
					@click="forward"
					title="Forward 5s"
					aria-label="Forward 5 seconds"
					class="control-button forward"
				>
					&#10227;
				</button>
			</div>
			<div style="margin-top: 10px">
				<label for="volume">Volume</label>
				<input
					id="volume"
					aria-label="Volume control"
					type="range"
					min="0"
					max="100"
					v-model="volume"
					@change="changeVolume"
					tabindex="0"
				/>
			</div>
			<div
				ref="progressBar"
				role="slider"
				tabindex="0"
				aria-valuemin="0"
				:aria-valuemax="Math.round(duration)"
				:aria-valuetext="playing?``:`Current time: ${formattedCurrentTime}`"
				style="
					width: 100%;
					height: 20px;
					background-color: lightgray;
					cursor: pointer;
				"
				@click="seek"
				@keydown.space.prevent="playPause"
				@keydown.left.prevent="seekByKeyboard(-5)"
				@keydown.right.prevent="seekByKeyboard(5)"
			> 
			<!-- progress bar: removed  -->
				<div
					:style="{
						width: progress + '%',
						height: '100%',
						backgroundColor: '#1a242d',
					}"
				></div>
			</div>
			<div aria-live="off" style="display: flex; justify-content: space-between">
				<span aria-hidden="true">{{ formattedCurrentTime }}</span>
				<span>{{ formattedDuration }}</span>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	inject: ["datasource"], // inject datasource from main.js
	data() {
		return {
			volume: 50,
			animating: false,
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
		};
	},
	async mounted() {
		await this.loadData(); // fetch JSON data
		// preload images
		this.segments.forEach((segment) => {
			const img = new Image();
			img.src = segment.image;
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
			} catch (error) {
				console.error("Error fetching JSON data:", error);
			}
		},

		stop() {
			this.$refs.audio.pause();
			this.playing = false;
			this.$refs.audio.currentTime = 0;
			this.progress = 0;
			this.currentTime = 0;
		},
		rewind() {
			this.$refs.audio.currentTime = Math.max(
				0,
				this.$refs.audio.currentTime - 5
			);
		},
		forward() {
			this.$refs.audio.currentTime = Math.min(
				this.$refs.audio.duration,
				this.$refs.audio.currentTime + 5
			);
		},
		changeVolume() {
			this.$refs.audio.volume = this.volume / 100;
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
		},

		reset() {
			this.playing = false;
			this.progress = 0;
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
			const percentage = (x / progressBar.offsetWidth) * 100;
			this.progress = percentage;
			const duration = this.$refs.audio.duration;
			if (duration) {
				this.$refs.audio.currentTime = (percentage / 100) * duration;
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
	},
	computed: {
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
	max-width: 60%;
	margin: 1rem auto;
	padding: 10px;
	border-radius: 10px;
	background-color: #324455;
	border: 1px solid #1a242d;
	box-shadow: 0px 3px 6px #999;
}
.image {
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	margin: auto;
	min-width: 500px;
	max-width: 100%;
	height: auto;
}
.control-buttons {
	display: flex;
	justify-content: center;
	align-items: center;
}
.control-button {
	font-size: 24px;
	margin-right: 10px;
	border: none;
	background-color: transparent;
	cursor: pointer;
	color: white;
}

.speech-bubble {
	position: relative;
	display: inline-block;
	overflow: hidden;
	border-radius: 10px;
	box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
}
</style>

