# Forward // Client library for NodeJS

_Connect to the Forward API server using JavaScript_

Install it with npm:

	npm install fwd-client

Or, with install it fwd-cli:

	fwd install node-client


## Usage example

	var Forward = require("fwd-client");

	var fwd = new Forward.Client({
		client: "myclient",
		key: "bc9eu2bc9u2h3efi90j10wi1jn0icnr9v"
	});

	fwd.on("error", function (err) {
		console.log("Error" + err);
	});

	fwd.get("/products", {color: "blue"}, function (products) {
		console.log("Found "+products.count+" product"+(products.count == 1 ?"":"s"));
	});


## Client API

The client API contains the following methods:

### .get(url, data, callback)

Initiate a `GET` request

### .put(url, data, callback)

Initiate a `PUT` request

### .post(url, data, callback)

Initiate a `POST` request

### .delete(url, data, callback)

Initiate a `DELETE` request

### .auth(credentials)

Authenticate with API server using `credentials`

### .close()

Close the client connection


## Events

The client emits the following events:

### on("error")

Emitted when an error occurs

### on("remote.get")

Emitted when a `GET` request is performed

### on("remote.put")

Emitted when a `PUT` request is performed

### on("remote.post")

Emitted when a `POST` request is performed

### on("remote.delete")

Emitted when a `DELETE` request is performed

### on("close")

Emitted when the client has closed the connection


## Contributing

Pull requests are welcome


## License

MIT
