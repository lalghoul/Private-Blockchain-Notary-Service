# Private Blockchain Notary Service

This project is private Blockchain that stores favorite stars for users locally using LevelDB integrated with RESTFUL API.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site).

```
https://nodejs.org/en/
```

### Installing

1. Clone the repository to your local computer.
2. Open the terminal and install the packages: `npm install`.
3. Run your application `node app.js`
4. Go to your browser and type: `http://localhost:8000/block`
5. Function initializeMockData() will add 10 blocks to Blockchain for testing.

## Example submits a validation request

Users start out by submitting a validation request to an API endpoint:

```
curl -X POST \
  http://localhost:8000/requestValidation \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "address":"1Yf5kmMoETfAvLDmWQ31Z8DYUs5yhb1bC"
}

```

Then You should receive a response:

```
{
    "address": "1Yf5kmMoETfAvLDmWQ31Z8DYUs5yhb1bC",
    "requestTimeStamp": "1545081932",
    "message": "1Yf5kmMoETfAvLDmWQ31Z8DYUs5yhb1bC:1545081932:starRegistery",
    "timeLeft": 300
}
```

## After that you need to sign message and send your address with signature:

```
curl -X POST \
 http://localhost:8000/message-signature/validate/ \
 -H 'Content-Type: application/json' \
 -H 'cache-control: no-cache' \
 -d '{
"address":"1Yf5kmMoETfAvLDmWQ31Z8DYUs5yhb1bC"
"signature":"IF8STiQpRybrvdBpfnVaRTKzqd4d1gjp85RM8O//+lGfSD1XZtePuGPrjYGHQSVEEqau+tyCnGQf1Bo1b4uLgYM="
}'

```

And you will receive a response like that:

```

{
"registerStar": true,
"status": {
"address": "1Yf5kmMoETfAvLDmWQ31Z8DYUs5yhb1bC",
"requestTimeStamp": "1545081932",
"message": "1Yf5kmMoETfAvLDmWQ31Z8DYUs5yhb1bC:1545081932:starRegistery",
"validationWindow": 1800,
"messageSignature": true
}
}

```

## Now you can register your favorite start by sending a request:

```

curl -X POST \
 http://localhost:8000/block/ \
 -H 'Content-Type: application/json' \
 -H 'cache-control: no-cache' \
 -d '{
"address":"1Yf5kmMoETfAvLDmWQ31Z8DYUs5yhb1bC"
"star":" {
"dec": "68° 52' 56.9",
"ra": "16h 29m 1.0s",
"story": "Found star using https://www.google.com/sky/"
}"
}'

```

Congrats! Your favorite star has been added:

```

{
"hash": "65269605d01a74323264c9f368f204fd7ba3bd22dca00b2a4542595419e4a9b5",
"height": 12,
"body": {
"address": "1Yf5kmMoETfAvLDmWQ31Z8DYUs5yhb1bC",
"stardata": {
"ra": "16h 29m 1.0s",
"dec": "68° 52' 56.9",
"story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
}
},
"time": "1545082032",
"previousBlockHash": "9ffa9ef32bd7db53ad0047b76b7c40e206ced93ff1cc710d7236b5b1f841fe1b"
}

```

Now you can search for your star using hash,address or height:

## Example searching using address:

```
$ curl http://localhost:8000/stars/address:[ADDRESS]

```

## Example searching using hash:

```

$ curl http://localhost:8000/stars/hash:[HASH]


```

## Example searching using height:

```

$ curl http://localhost:8000/block/[HEIGHT]


```

## Built With

- [ExpressJs](https://expressjs.com) - The web framework used.
- [LevelDB](http://leveldb.org/) - Database.
- [Crypto-js](https://www.npmjs.com/package/crypto-js) - Used to hash blocks with SHA256.
- [hex2ascii](https://www.npmjs.com/package/hex2ascii) - Convert hex to ascii in JavaScript.
- [bitcoinjs-message](https://www.npmjs.com/package/bitcoinjs-message) - Sign a Bitcoin message.
- [bitcoinjs-lib](https://www.npmjs.com/package/bitcoinjs-lib) - A javascript Bitcoin library for node.js and browsers.

```

```
