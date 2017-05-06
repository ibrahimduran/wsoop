import 'mocha';
import { assert } from 'chai';

import * as SocketIO from 'socket.io';
import { Client, Action } from '../../build';

describe('server/client', function () {
	var client: Client;

	var server = SocketIO();
	server.on('connection', (socket) => socket.on('msg', (data) => socket.emit('msg', data)));
	setTimeout(() => {
		server.listen(5005);
	}, 2000);

	it('should create new Client', function () {
		client = new Client({
			initConnection: true,
			endpoint: 'ws://127.0.0.1:5005',
			connectOpts: { transports: ['websocket'], reconnectionDelay: 500, reconnectionAttempts: 5 }
		});
	});

	it('should connect to the server', function (done) {
		this.timeout(5000);
		var fired = false;
		client.add((new Action()).add(new Action('connect', () => {
			if (!fired) {
				done();
				fired = true;
			}
		})));
		client.connect('ws://127.0.0.1:5005');
		assert.equal('io' in client.sock, true);
	});

	it('should disconnect from the server', function (done) {
		this.timeout(5000);
		var fired = false;
		server.close();
		client.sock.on('reconnect_error', () => {
			if (!fired) {
				setTimeout(done, 1000);
				fired = true;
			}
		});
	});
});
