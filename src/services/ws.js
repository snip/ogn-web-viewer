import Vue from 'vue';
import Sockette from 'sockette';

class WebsocketService extends Vue {
  constructor() {
    super();

    this._ws = null;
    this._bbox = null;
    this._subscriptions = [];
  }

  start() {
    this._ws = new Sockette('wss://ogn.fva.cloud/api/live', {
      onopen: () => {
        console.log('Connected!');
        this._sendBBox();

        for (let id of this._subscriptions) {
          this._ws.send(`+id|${id}`);
        }
      },
      onmessage: e => this.onMessage(e.data),
      onreconnect: () => console.log('Reconnecting...'),
      onerror: e => console.log('Error:', e),
    });
  }

  stop() {
    this._ws.close();
    this._ws = null;
  }

  onMessage(message) {
    for (let line of message.split('\n')) {
      let record = parseMessage(line);
      this.onRecord(record);
    }
  }

  onRecord(record) {
    this.$emit('record', record);
  }

  subscribeToId(id) {
    this._subscriptions.push(id);
    try {
      this._ws.send(`+id|${id}`);
    } catch (e) {
      // ignore
    }
  }

  unsubscribeFromId(id) {
    this._subscriptions = this._subscriptions.filter(_id => _id !== id);
    try {
      this._ws.send(-`+id|${id}`);
    } catch (e) {
      // ignore
    }
  }

  setBBox(bbox) {
    this._bbox = bbox;
    this._sendBBox();
  }

  _sendBBox() {
    if (!this._ws || !this._bbox) return;

    let command = ['bbox', ...this._bbox].join('|');

    try {
      this._ws.send(command);
    } catch (e) {
      // ignore
    }
  }
}

let service = new WebsocketService();

function parseMessage(message) {
  let fields = message.split('|');

  return {
    id: fields[0],
    timestamp: parseInt(fields[1], 10),
    longitude: parseFloat(fields[2]),
    latitude: parseFloat(fields[3]),
    course: parseInt(fields[4], 10),
    altitude: parseInt(fields[5], 10),
  };
}

export default service;
