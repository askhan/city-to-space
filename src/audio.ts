/** Small, self-contained arcade sounds; no downloads or audio assets required. */
export class GameAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private engine?: GainNode;
  private filter?: BiquadFilterNode;
  private motor?: OscillatorNode;
  private overtone?: OscillatorNode;
  private noise?: AudioBuffer;
  private playing = false;
  private muted = false;

  // Called directly from a click/tap so mobile browsers can unlock audio.
  unlock() {
    try {
      if (!this.context) this.initialize();
      const context = this.context;
      if (context && context.state !== 'running') {
        void context.resume().then(() => this.applyVolume()).catch(() => {});
      }
    } catch {
      // Audio is optional: unsupported or blocked audio must never stop play.
    }
  }

  private initialize() {
    const context = new AudioContext();
    this.context = context;
    const master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
    this.master = master;

    const engine = context.createGain();
    engine.gain.value = .12;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 450;
    filter.Q.value = .65;
    engine.connect(filter).connect(master);
    this.engine = engine;
    this.filter = filter;

    // Two softly filtered harmonics give the motor a low, slightly rough purr.
    this.motor = context.createOscillator();
    this.motor.type = 'sawtooth';
    this.motor.frequency.value = 65;
    this.motor.connect(engine);
    this.overtone = context.createOscillator();
    this.overtone.type = 'triangle';
    this.overtone.frequency.value = 130;
    const harmonicGain = context.createGain();
    harmonicGain.gain.value = .35;
    this.overtone.connect(harmonicGain).connect(engine);
    this.motor.start();
    this.overtone.start();

    const noise = context.createBuffer(1, Math.ceil(context.sampleRate * .24), context.sampleRate);
    const samples = noise.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    this.noise = noise;
  }

  setPlaying(playing: boolean) {
    this.playing = playing;
    this.applyVolume();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.applyVolume();
  }

  private applyVolume() {
    if (!this.context || !this.master) return;
    const gain = this.master.gain;
    const now = this.context.currentTime;
    gain.cancelScheduledValues(now);
    gain.setTargetAtTime(this.playing && !this.muted ? .55 : 0, now, .018);
  }

  setSpeed(speed: number) {
    if (!this.context || !this.motor || !this.overtone || !this.engine || !this.filter) return;
    const amount = Math.max(0, Math.min(1, (speed - 100) / 280));
    const now = this.context.currentTime;
    // Smooth ramps let the engine rev up and coast down instead of jumping pitch.
    this.motor.frequency.setTargetAtTime(40 + amount * 90, now, .14);
    this.overtone.frequency.setTargetAtTime(80 + amount * 180, now, .14);
    this.filter.frequency.setTargetAtTime(280 + amount * 650, now, .14);
    this.engine.gain.setTargetAtTime(.10 + amount * .055, now, .14);
  }

  collision(personHit = false) {
    const context = this.context;
    if (!context || !this.master || !this.noise || !this.playing || this.muted || context.state !== 'running') return;
    const now = context.currentTime;
    const noise = context.createBufferSource();
    noise.buffer = this.noise;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1500;
    const crunch = context.createGain();
    crunch.gain.setValueAtTime(.36, now);
    crunch.gain.exponentialRampToValueAtTime(.001, now + .22);
    noise.connect(filter).connect(crunch).connect(this.master);
    noise.start(now);
    noise.stop(now + .24);
    noise.onended = () => { noise.disconnect(); filter.disconnect(); crunch.disconnect(); };

    const thump = context.createOscillator();
    const impact = context.createGain();
    thump.frequency.setValueAtTime(125, now);
    thump.frequency.exponentialRampToValueAtTime(38, now + .16);
    impact.gain.setValueAtTime(.48, now);
    impact.gain.exponentialRampToValueAtTime(.001, now + .2);
    thump.connect(impact).connect(this.master);
    thump.start(now);
    thump.stop(now + .22);
    thump.onended = () => { thump.disconnect(); impact.disconnect(); };
    if (personHit) this.scream();
  }

  private scream() {
    const context = this.context;
    if (!context || !this.master) return;
    const now = context.currentTime;
    // A brief cartoon "aaah!": vowel resonances with a rising, wobbling pitch.
    // It stays on the master bus, so mute and pause silence it immediately.
    const voice = context.createOscillator();
    voice.type = 'sawtooth';
    voice.frequency.setValueAtTime(340, now);
    voice.frequency.exponentialRampToValueAtTime(610, now + .10);
    voice.frequency.exponentialRampToValueAtTime(400, now + .56);
    const wobble = context.createOscillator();
    wobble.frequency.value = 23;
    const wobbleDepth = context.createGain();
    wobbleDepth.gain.value = 18;
    wobble.connect(wobbleDepth).connect(voice.frequency);
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(.22, now + .025);
    envelope.gain.setValueAtTime(.18, now + .30);
    envelope.gain.exponentialRampToValueAtTime(.001, now + .60);
    envelope.connect(this.master);
    const formants = [850, 1250, 2700].map(frequency => {
      const filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = frequency;
      filter.Q.value = 5;
      voice.connect(filter).connect(envelope);
      return filter;
    });
    voice.start(now);wobble.start(now);
    voice.stop(now + .62);wobble.stop(now + .62);
    voice.onended = () => {
      voice.disconnect();wobble.disconnect();wobbleDepth.disconnect();
      formants.forEach(filter => filter.disconnect());envelope.disconnect();
    };
  }

  dispose() {
    if (this.context) void this.context.close().catch(() => {});
  }
}
