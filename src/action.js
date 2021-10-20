export default class WoopraAction {
  constructor(woopra, id, event) {
    this.woopra = woopra;
    this.id = id;
    this.event = event;
  }

  update(options = {}, lastArg) {
    if (options.event && options.event !== this.event) {
      this.event = options.event;
    }

    this.woopra.update(this.id, { ...options, $action: this.event }, lastArg);
  }

  cancel() {
    this.woopra.cancelAction(this.id);
  }
}
