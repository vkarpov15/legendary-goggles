const moment = require('moment');

class Timestamp extends moment {
  constructor(v) {
    if (v != null) {
      super(new Date(v.valueOf()));
    } else {
      super();
    }
    if (!this.isValid()) {
      throw new Error(`Could not cast "${v}" to date`);
    }
    this.inspect = () => `[timestamp:${this.toString()}]`;
    this.toBSON = () => this.toDate();
    this.toJSON = () => this.toDate().toJSON();
  }
}

module.exports = Timestamp;
