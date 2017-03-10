import 'mocha';
import { assert } from 'chai';
import { Server, Action } from '../build';

declare function require(moduleName: string): any;

describe('Server', () => {
	var app;

	it('should create applicaton', () => {
		app = new Server();
		assert.equal(app.constructor, Server);
	});

	it('should load actions', () => {
		class FooAction {}

		app.add(FooAction).add(new Action('foo', (socket, data) => {
			socket.emit('foo:response', data);
		}));
	});

	var client;

	it('should listen websockets', (done) => {
		app.listen(5000);
		client = require('socket.io-client').connect('ws://localhost:5000');
		client.on('connect', () => done());
	});

	it('should response to requests', (done) => {
		var exampleData = 'Hello World!';

		client.on('foo:response', (data) => {
			assert.equal(exampleData, data);
			done();
		});

		client.emit('foo', exampleData);
	});
});
