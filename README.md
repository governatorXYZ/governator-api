### Set up environment

rename `.env.template` to `.env.development` and fill in the missing variables. For production environement 
create a file named `.env.production`.

## Requirements to run the app

To run this app you will need to have the following installed and configured on your development machine.

*__Required Software:__*

- [Node.js](https://nodejs.org/en/download/)
- [yarn](https://yarnpkg.com/getting-started/install)
- [MongoDB](https://docs.mongodb.com/manual/installation/)
  - if you are using WSL, you will need to install MongoDB on Windows and then follow the instructions [here](https://docs.microsoft.com/en-us/windows/wsl/tutorials/wsl-database#install-mongodb)
  - altenatively, you can use a cloud MongoDB service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Redis](https://redis.io/download)

*__Other Requirements__*

- [Alchemy API key](https://www.alchemy.com/)
  - For both Polygon and Ethereum
- Infura API key (and secret)
  - [Infura](https://infura.io/)
- Etherscan API key
  - [Etherscan](https://etherscan.io/)
  


### Running the app

```bash
# install
$ yarn
```

```bash
# watch mode
$ yarn start:dev
```
or

```bash
# production
$ yarn start:prod
```

if you used the default values from `.env.template` the app will run on `localhost:3000/api`.


## Stay in touch

- Website - [https://governator.xyz](https://governator.xyz/)


## License

Governator is [MIT](LICENSE).
