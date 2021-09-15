export default class WoopraAction {
  constructor(woopra, id, event) {
    this.woopra = woopra;
    this.id = id;
    this.event = event;
  }

  update(options = {}) {
    if (options.event && options.event !== this.event) {
      this.event = options.event;
    }

    this.woopra.update(this.id, { ...options, $action: this.event });
  }

  cancel() {
    this.woopra.cancelAction(this.id);
  }
}
