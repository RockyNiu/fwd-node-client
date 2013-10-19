## fwd-node-client

*Forward is a platform to build and scale ecommerce.* This is the NodeJS client library.

Create an API account at https://getfwd.com

## Usage example

	var Forward = require('./lib/fwd-node-client');

	var fwd = new Forward.Client('client_id', 'client_key');

	fwd.get('/products', {color: 'blue'}, function(products) {
		console.log(products);
	});

## Documentation

See <http://getfwd.com/docs/clients#nodejs> for more API docs and usage examples

## Contributing

Pull requests are welcome

## License

Apache2.0
