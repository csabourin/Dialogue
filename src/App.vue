<template>
	<div style="font-family: sans-serif">
		<h1>Audio Player</h1>
		<div style="width: 100%; display: flex; justify-content: center">
			<div
				ref="imageContainer"
				style="
					height: 512px;
					width: 512px;
					overflow: hidden;
					position: relative;
				"
			>
				<img
					:key="currentImage"
					:src="currentImage"
					alt="Current image"
					class="image"
				/>
			</div>
		</div>
		<div class="audioPlayer">
			<audio ref="audio" @timeupdate="updateImage" @ended="reset">
				<source :src="audioSrc" type="audio/mpeg" />
			</audio>
			<div class="control-buttons">
				<button @click="rewind" title="Rewind 5s" class="control-button rewind">
					&#11244;
				</button>
				<button
					ref="playPauseBtn"
					@click="playPause"
					@keydown.space.prevent="playPause"
					tabindex="0"
					:aria-label="playing ? 'Pause' : 'Play'"
					class="control-button play-pause"
					v-html="playing ? '&#10074;&#10074;' : '&#9658;'"
				></button>
				<button @click="stop" title="Stop" class="control-button stop">
					&#9724;
				</button>
				<button
					@click="forward"
					title="Forward 5s"
					class="control-button forward"
				>
					&#11246;
				</button>
			</div>
			<div style="margin-top: 10px">
				<label for="volume">Volume</label>
				<input
					id="volume"
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
				:aria-valuenow="Math.round(currentTime)"
				:aria-valuetext="`Current time: ${formattedCurrentTime}`"
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
				<div
					:style="{
						width: progress + '%',
						height: '100%',
						backgroundColor: '#1a242d',
					}"
				></div>
			</div>
			<div style="display: flex; justify-content: space-between">
				<span>{{ formattedCurrentTime }}</span>
				<span>{{ formattedDuration }}</span>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			volume: 50,
			animating: false,
			currentSegmentIndex: 0,
			isImage1OnTop: true,
			playing: false,
			currentImage: "",
			previousImage: "",
			audioSrc: "your-audio-source.mp3",
			segments: [
				{
					start: 0,
					end: 11,
					image: "Dave.jpg",
				},
				{
					start: 11,
					end: 20,
					image: "Morgan_phone.jpg",
				},
				{
					start: 11,
					end: 31,
					image: "Dave.jpg",
				},
				{
					start: 31,
					end: 50,
					image: "Morgan_phone.jpg",
				},
				{
					start: 50,
					end: 54,
					image: "Dave.jpg",
				},
				{
					start: 54,
					end: 61,
					image: "Claudine.jpg",
				},
				{
					start: 61,
					end: 78,
					image: "Morgan_phone.jpg",
				},
				{
					start: 78,
					end: 86,
					image: "Claudine.jpg",
				},
				{
					start: 86,
					end: 100,
					image: "Morgan_phone.jpg",
				},
				{
					start: 100,
					end: 117,
					image: "Claudine.jpg",
				},
				{
					start: 117,
					end: 134,
					image: "Morgan_phone.jpg",
				},
			],
			progress: 0,
			duration: 0,
			currentTime: 0,
		};
	},
	mounted() {
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
	width: 400px;
	margin: 1rem auto;
	padding: 10px;
	border-radius: 10px;
	background-color: #324455;
	border: 4px double #1a242d;
	box-shadow: 0px 3px 6px #999;
}
.image {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	margin: auto;
	min-width: 500px;
	max-width: 100%;
	width: 100%;
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
</style>

