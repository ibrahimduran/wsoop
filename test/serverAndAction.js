var assert = require('chai').assert;
var { Server, Action } = require('../build');

describe('Server', function() {
	var app;

	it('should create applicaton', function() {
		app = new Server();
		assert.equal(app.constructor, Server);
	});

	var actions;

	it('should create actions', () => {
		actions = new Action()
			.add('test', (socket, data) => { if (socket) {socket.emit('test', data);} return 'this is test'; })
			.add(
				new Action('sub')
					.add('foo', (socket, data) => { if (socket) {socket.emit('sub:foo', data);} return 'this is sub:foo'; })
					.add('bar', (socket, data) => { if (socket) {socket.emit('sub:bar', data);} return 'this is sub:bar'; })
			);

		actions.toArray().forEach(plain => {
			assert.equal('this is ' + plain.event, plain.callback(null));
		});
	});

	it('should load actions', () => {
		app.add(actions);
	});

	var client = require('socket.io-client');

	it('should listen websockets', (done) => {
		app.listen(5000);
		client = client.connect('ws://localhost:5000');
		client.on('connect', () => done());
	});

	it('should response to requests', (done) => {
		client.on('test', (data) => {
			assert.equal(data, 'test_data');

			client.on('sub:foo', (data) => {
				assert.equal(data, 'sub:foo_data');

				client.on('sub:bar', (data) => {
					assert.equal(data, 'sub:bar_data');
					done();
				});
				
				client.emit('sub:bar', 'sub:bar_data');
			});
			
			client.emit('sub:foo', 'sub:foo_data');
		});
		
		client.emit('test', 'test_data');
	});
});
