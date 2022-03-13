import Audio from "./audio";

/**
 * A representation of a sound channel, one of 8
 */
export class SoundChannel {
  audio?: Audio;
  id = -1;
  unitTypeId: number | null = -1;
  isPlaying = false;

  queue(audio: Audio) {
    this.audio = audio;
    this.id = audio.sound.typeId;
    this.unitTypeId = audio.sound.unitTypeId;
    this.isPlaying = true;
  }
}
export default SoundChannel;