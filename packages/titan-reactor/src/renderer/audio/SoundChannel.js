/**
 * A representation of a sound channel, one of 8
 */
export default class SoundChannel {
  queue(audio) {
    this.audio = audio;
    this.id = audio.sound.id;
    this.unitTypeId = audio.sound.unitTypeId;
    this.priority = audio.sound.priority;
    this.flags = audio.sound.flags;
    // can probably be refactored to a getter for audio.isPlaying
    this.isPlaying = true;
  }
}
