## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev
```

## Examples

The `src/examples` folder contains examples how to subscribe to 
server-side-events via browser (`front-end-example.html`) and via nodejs 
(`node-example.ts`). To make it work locally you have to set `API_CORS_ORIGIN=true`
in `.env` file (see .env.template). Run `yarn start` and
open `src/examples/front-end-example.html` in your browser. In another 
tab navigate to `localhost:3000/governator`. Use the swagger GUI to send 
a post request. `front-end-example.html` should update with the payload you've sent.

## Stay in touch

- Website - [https://governator.xyz](https://governator.xyz/)

## License

Nest is [AGPLv3](LICENSE).
