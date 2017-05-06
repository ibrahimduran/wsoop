import 'mocha';
import { assert } from 'chai';

import * as SocketIOClient from 'socket.io-client';
import { Server, Action } from '../../build';

describe('server/server', function () {
	var server: Server;

	it('should create new Server', function () {
		server = new Server();
	});

	it('should add main action', function () {
		var action = new Action('msg', (socket, data) => {
			socket.emit('msg', data);
		});
		server.add((new Action).add(action));
	});

	it('should listen for connections', function () {
		server.listen(5005);
	});

	it('should handle connections', function (done) {
		var socket = SocketIOClient.connect('ws://127.0.0.1:5005', {
			transports: ['websocket']
		});

		socket.on('msg', (data) => {
			assert.equal(data, 'hello');
			done();
		});
		socket.emit('msg', 'hello');
	});
});
