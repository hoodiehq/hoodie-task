# hoodie-task

> Hoodie Tasks core module

THIS IS WORK IN PROGRESS - USING HOODIE-STORE AS BASIS FOR THE ALL NEW HOODIE TASK SERVER & CLIENT MODULES.
PLEASE NOTE: MANY HOODIE-STORE CODE/REFERENCES MAY PERSIST UNTIL FULLY ADAPTED.

`hoodie-tasks` combines [task-client](https://github.com/hoodiehq/hoodie-task-client),
[task-server](https://github.com/hoodiehq/hoodie-task-server).

## Usage

Start the demo server

```
npm start
```

If you want to use the store module as plugin of your [Hapi](http://hapijs.com/)
server, check out [example/index.js](exmaple/index.js) to see how to register
the [task-server](https://github.com/hoodiehq/hoodie-task-server) and how
to bundle and server the [task-client](https://github.com/hoodiehq/hoodie-task-client)

## Testing

Local setup

```
git clone https://github.com/hoodiehq/hoodie-task.git
cd hoodie-task
npm install
```

Run end-to-end tests with selenium

```
npm test
```

## Contributing

Have a look at the Hoodie project's [contribution guidelines](https://github.com/hoodiehq/hoodie/blob/master/CONTRIBUTING.md).
If you want to hang out you can join our [Hoodie Community Chat](http://hood.ie/chat/).

## License

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
