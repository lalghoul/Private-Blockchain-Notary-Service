/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
const BlockClass = require("./Block.js");
const BlockchainClass = require("./Blockchain.js");
const bitcoin = require("bitcoinjs-lib");
const bitcoinMessage = require("bitcoinjs-message");
const hex2ascii = require("hex2ascii");
const util = require("util");
const TimeoutRequestsWindowTime = 5 * 60 * 1000;
/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain    |
|  ================================================*/
class BlockchainController {
  /**
   * Constructor to create a new BlockController, you need to initialize here all your endpoints
   * @param {*} app
   */
  constructor(app) {
    this.app = app;
    this.mempoolValid = [];
    this.requests = [];
    this.timeoutRequests = [];
    this.timeoutMempool = [];
    this.chain = new BlockchainClass.Blockchain();
    this.validateWallet();
    this.postNewBlock();
    this.getStarByAddress();
    this.getStarByHash();
    this.requestValidation();
    this.getBlockByIndex();
    //this.initializeMockData();
  }
  getBlockByIndex() {
    this.app.get("/block/:index", (req, res) => {
      this.chain.getBlockHeight().then(height => {
        let count = JSON.parse(height);
        let index = req.params.index;
        if (count >= index) {
          this.chain.getBlock(index).then(block => {
            block = JSON.parse(block);
            block.body.stardata.storyDecoded = hex2ascii(
              block.body.stardata.story
            );
            console.log(block);
            res.set(200);
            res.send(block);
          });
        } else {
          res.status(404).send("Block Not Found!");
        }
      });
    });
  }

  getStarByHash() {
    this.app.get("/stars/hash::hash", (req, res) => {
      console.log(req.params.hash);
      this.chain

        .getBlockHeight()
        .then(height => {
          let count = JSON.parse(height);
          let block = [];
          for (let i = 0; i <= count; i++) {
            this.chain
              .getBlock(i)
              .then(data => {
                data = JSON.parse(data);
                let body = data.body;
                if (req.params.hash != undefined) {
                  if (data.hash == req.params.hash) {
                    body.stardata.storyDecoded = hex2ascii(body.stardata.story);
                    block.push(data);
                  }
                  if (i == count) {
                    res.send(block);
                    res.end();
                  }
                } else {
                  res.send("Please define your hash");
                }
              })
              .catch(err => {
                console.log(err);
                res.send(err);
              });
          }
        })
        .catch(err => {
          console.log(err);
          res.send(err);
        });
    });
  }

  getStarByAddress() {
    this.app.get("/stars/address::address", (req, res) => {
      console.log(req.params.address);
      this.chain

        .getBlockHeight()
        .then(height => {
          let count = JSON.parse(height);
          let block = [];
          for (let i = 0; i <= count; i++) {
            this.chain
              .getBlock(i)
              .then(data => {
                data = JSON.parse(data);
                let body = data.body;
                if (req.params.address != undefined) {
                  if (data.body.address == req.params.address) {
                    body.stardata.storyDecoded = hex2ascii(body.stardata.story);
                    block.push(data);
                  }
                  if (i == count) {
                    res.send(block);
                    res.end();
                  }
                } else {
                  res.send("Please define your Address");
                }
              })
              .catch(err => {
                console.log(err);
                res.send(err);
              });
          }
        })
        .catch(err => {
          console.log(err);
          res.send(err);
        });
    });
  }

  postNewBlock() {
    return this.app.post("/block/", (req, res) => {
      let star = req.body.star;
      let address = req.body.address;
      if (
        req.body.star != undefined &&
        star.dec != undefined &&
        star.ra != undefined
      ) {
        let starStory = star.story;
        let storyCount = starStory.length;
        if (this.verifyAddressRequest(address) && storyCount < 250) {
          let body = {
            address: address,
            stardata: {
              ra: star.ra,
              dec: star.dec,
              story: Buffer.from(starStory).toString("hex")
            }
          };

          res.set("Status", "Star Successfully Added");
          this.chain.addBlock(new BlockClass.Block(body)).then(block => {
            res.send(block);
            res.status(200);
            res.end();
            this.removeValidationRequest(address);
            this.removeValidationRequestMempool(address);
          });
        } else {
          res.status(500);
          res.set(
            "Erorr",
            "Sorry but we didnt find your address in the MEMPOOL"
          );
          res.end();
        }
      } else {
        res.set("Error", "Please define your star");
        res.end();
      }
    });
  }
  removeValidationRequest(address) {
    delete this.timeoutRequests[address];
    delete this.requests[address];
  }
  removeValidationRequestMempool(address) {
    delete this.mempoolValid[address];
    delete this.timeoutMempool[address];
    console.log("Address Successfully Removed From the Mempool " + address);
  }
  verifyAddressRequest(address) {
    if (typeof this.mempoolValid[address] != "undefined") {
      return true;
    } else {
      return false;
    }
  }

  requestValidation() {
    let self = this;
    this.app.post("/requestValidation/", (req, res) => {
      let address = req.body.address;
      if (typeof this.timeoutRequests[address] === "undefined") {
        let requestedTimestamp = new Date()
          .getTime()
          .toString()
          .slice(0, -3);
        let starRegistry = "starRegistry";
        req.userData = address + ":" + requestedTimestamp + ":" + starRegistry;
        self.timeoutRequests[address] = setTimeout(function() {
          self.removeValidationRequest(address);
        }, TimeoutRequestsWindowTime);

        let timeElapse =
          new Date()
            .getTime()
            .toString()
            .slice(0, -3) - requestedTimestamp;
        let timeLeft = TimeoutRequestsWindowTime / 1000 - timeElapse;
        res.status(200);
        let bodyResponse = {
          address: address,
          requestTimeStamp: requestedTimestamp,
          message: req.userData,
          timeLeft: timeLeft
        };
        let userOBJ = {
          address: address,
          message: req.userData,
          requestedTimestamp: requestedTimestamp
        };
        this.requests[address] = userOBJ;
        res.send(bodyResponse);
        res.end();
      } else {
        let timeElapse =
          new Date()
            .getTime()
            .toString()
            .slice(0, -3) - this.requests[address].requestedTimestamp;
        let timeLeft = TimeoutRequestsWindowTime / 1000 - timeElapse;
        res.status(500);
        this.requests[address].timeLeft = timeLeft;
        res.send(this.requests[address]);
        res.end();
      }
    });
  }

  validateWallet() {
    let self = this;
    self.app.post("/message-signature/validate/", (req, res) => {
      let signature = req.body.signature;
      let address = req.body.address;
      let requestedTimestamp = new Date()
        .getTime()
        .toString()
        .slice(0, -3);
      if (!this.verifyAddressRequest(address)) {
        if (typeof self.timeoutRequests[address] != "undefined") {
          // Verify if the signature correct
          let isValid = bitcoinMessage.verify(
            self.requests[address].message,
            address,
            signature
          );

          if (isValid) {
            let timeElapse =
              new Date()
                .getTime()
                .toString()
                .slice(0, -3) - requestedTimestamp;
            let timeLeft = TimeoutRequestsWindowTime / 1000 - timeElapse;
            this.timeoutMempool[address] = requestedTimestamp;
            let status = {
              address: address,
              requestTimeStamp: this.requests[address].requestedTimestamp,
              message: this.requests[address].message,
              validationWindow: timeLeft,
              messageSignature: true
            };
            // Adding the request to the mempool
            this.mempoolValid[address] = { registerStar: true, status: status };

            // Remove Validtions Request From requests
            this.removeValidationRequest(address);

            // Remove Valdtion Request After 5mins from the mempool
            setTimeout(function() {
              self.removeValidationRequestMempool(address);
            }, TimeoutRequestsWindowTime);

            // Send Response to body
            res.status(200);
            res.send(this.mempoolValid[address]);
            res.end();
          } else {
            res.send("Signature invalid" + isValid);
            res.set("Error", "Signature invalid" + isValid);
            res.end();
          }
        } else {
          res.set(
            "Error",
            "No request matched for this address! Please make a request"
          );
          res.send(
            "No request matched for this address! Please make a request"
          );
          res.end();
        }
      } else {
        console.log("You already made a request. Please send your star data");
        console.log(this.mempoolValid[address].status.validationWindow);
        let timeElapse =
          new Date()
            .getTime()
            .toString()
            .slice(0, -3) - this.timeoutMempool[address];
        let timeLeft = TimeoutRequestsWindowTime / 1000 - timeElapse;
        this.mempoolValid[address].status.validationWindow = timeLeft;
        console.log(this.mempoolValid[address]);
        res.send(this.mempoolValid[address]);
      }
    });
  }

  initializeMockData() {
    let self = this;
    return this.chain.getBlockHeight().then(height => {
      if (height === 0) {
        (function theLoop(i) {
          console.log("initializing MockData to the chain" + i);
          setTimeout(function() {
            let body = {
              address: "1Yf5kmMoETfAvLDmWQ31Z8DYUs5yhb1bC",
              stardata: {
                ra: "16h 29m 1.0s",
                dec: "68° 52' 56.9",
                story:
                  "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
              }
            };
            let blockAux = new BlockClass.Block(body);
            self.chain.addBlock(blockAux);
            i++;
            if (i < 10) theLoop(i);
          }, 10000);
        })(0);
      }
    });
  }
}
/**
 * Exporting the BlockController class
 * @param {*} app
 */
module.exports = app => {
  return new BlockchainController(app);
};
