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

## Running the tests

Use POSTMAN or CURL to send GET requests to the Blockchain by adding to the URL block height.

```
http://localhost:8000/block/[blockheight]
```

Example URL path:
http://localhost:8000/block/0, where '0' is the block height.

## Example GET Response

For URL, http://localhost:8000/block/0

```
X-Powered-By →Express
Content-Type →text/plain; charset=utf-8
Data →{"hash":"e4d04d5522c0a2d777695e8b374211fae3bf4f270f45924ce635682bb1b87e35","height":0,"body":"Test Block","time":"1541273025","previousBlockHash":""}
Connection →close
Content-Length →208
ETag →W/"d0-Nam5HnrdK6hqMyz5HW9XEqdxgVs"
Date →Sat, 03 Nov 2018 19:23:45 GMT
```

## Example POST Response

Example URL path:
http://localhost:8000/block/(Mydata) where (Mydata) is the block data.

Example For URL, http://localhost:8000/block/Foo

```
X-Powered-By →Express
Content-Type →text/plain; charset=utf-8
Data →{"hash":"5a4cfcb0eeb4ea09eeba722fec4fa8795cb1b8aef3c855f92f59eef4ee956a4e","height":21,"body":"Foo","time":"1541275030","previousBlockHash":"e4d04d5522c0a2d777695e8b374211fae3bf4f270f45924ce635682bb1b87e35"}
Connection →close
Content-Length →207
ETag →W/"cf-1dfORKZcSoeamE44HYEj6a4iUPs"
Date →Sat, 03 Nov 2018 19:57:11 GMT
```

## Example submits a validation request

Users start out by submitting a validation request to an API endpoint:

```
curl -X POST \
  http://localhost:8000/requestValidation \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "address":"1Yf5kmMoETfAvLDmWQ31Z8DYUs5yhb1bC"
}'
```

Then You should receive a response:

```
X-Powered-By →Express
address →1Yf5kmMoETfAvLDmWQ31Z8DYUs5yhb1bC
message →1Yf5kmMoETfAvLDmWQ31Z8DYUs5yhb1bC:1544887415:starRegistery
requestedTimestamp →1544887415
timeLeft →300
Date →Sat, 15 Dec 2018 15:23:35 GMT
Connection →keep-alive
Content-Length →0
```

After that you need to sign message and send your address with signature:

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
X-Powered-By →Express
Content-Type →application/x-www-form-urlencoded
Status →{"address":"1Yf5kmMoETfAvLDmWQ31Z8DYUs5yhb1bC","requestTimeStamp":"1544892006","message":"1Yf5kmMoETfAvLDmWQ31Z8DYUs5yhb1bC:1544892006:starRegistery","validationWindow":1800,"messageSignature":true}
Date →Sat, 15 Dec 2018 16:40:18 GMT
Connection →keep-alive
Content-Length →0
```

Now you can register your favorite start by sending a request:

```
curl -X POST \
  http://localhost:8000/message-signature/validate/ \
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
X-Powered-By →Express
Content-Type →application/x-www-form-urlencoded
Status →Star Successfully Added
Block →{"hash":"b0df8e59f9cc5df9df92a14424a80f988faa78bf9a35125b2feae1bf6c31c6ed","height":113,"body":{"address":"1Yf5kmMoETfAvLDmWQ31Z8DYUs5yhb1bC","stardata":{"ra":"16h 29m 1.0s","dec":"68° 52' 56.9","story":"466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"}},"time":"1544892231","previousBlockHash":"2230724804633f7862c1038f558be8edb7a488b93cb4126601970321978fd948","storyDecoded":"Found star using https://www.google.com/sky/"}
Date →Sat, 15 Dec 2018 16:43:51 GMT
Connection →keep-alive
Content-Length →0
```

Now you can search for your star using hash,address or height:

Example searching using address:

```
curl -X POST \
  http://localhost:8000/stars/ \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "address":"1Yf5kmMoETfAvLDmWQ31Z8DYUs5yhb1bC"
}'
```

Example searching using hash:

```
curl -X POST \
  http://localhost:8000/stars/ \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "hash":"b0df8e59f9cc5df9df92a14424a80f988faa78bf9a35125b2feae1bf6c31c6ed"
}'
```

Example searching using height:

```
curl -X POST \
  http://localhost:8000/stars/ \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "height":"1"
}'
```

## Built With

- [ExpressJs](https://expressjs.com) - The web framework used.
- [LevelDB](http://leveldb.org/) - Database.
- [Crypto-js](https://www.npmjs.com/package/crypto-js) - Used to hash blocks with SHA256.
- [hex2ascii](https://www.npmjs.com/package/hex2ascii) - Convert hex to ascii in JavaScript.
- [bitcoinjs-message](https://www.npmjs.com/package/bitcoinjs-message) - Sign a Bitcoin message.
- [bitcoinjs-lib](https://www.npmjs.com/package/bitcoinjs-lib) - A javascript Bitcoin library for node.js and browsers.
