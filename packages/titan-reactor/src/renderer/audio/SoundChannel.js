/**
 * A representation of a sound channel
 */
export default class SoundChannel {
  queue(audio) {
    this.audio = audio;
    this.id = audio.sound.id;
    this.unitTypeId = audio.sound.unitTypeId;
    this.priority = audio.sound.priority;
    this.flags = audio.sound.flags;
    this.isPlaying = true;
  }
}
