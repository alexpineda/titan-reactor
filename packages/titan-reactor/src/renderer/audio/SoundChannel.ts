import Audio from "./Audio";

/**
 * A representation of a sound channel, one of 8
 */
export default class SoundChannel {
  audio?: Audio;
  id = -1;
  unitTypeId: number | null = -1;
  priority = 0;
  flags = 0;
  isPlaying = false;

  queue(audio: Audio) {
    this.audio = audio;
    this.id = audio.sound.id;
    this.unitTypeId = audio.sound.unitTypeId;
    this.priority = audio.sound.priority;
    this.flags = audio.sound.flags;
    // can probably be refactored to a getter for audio.isPlaying
    this.isPlaying = true;
  }
}
