export default class WoopraAction {
  constructor(woopra, id, params, meta) {
    this.woopra = woopra;
    this.id = id;
    this.params = params;
    this.meta = meta;
  }

  update(options = {}, lastArg) {
    if (options.event && options.event !== this.params.event) {
      this.params.event = options.event;
    }

    this.woopra.update(
      this.id,
      { ...options, $action: this.params.event },
      lastArg
    );
  }

  cancel() {
    this.woopra.cancelAction(this.id);
  }
}
