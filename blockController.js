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
const ValidRequestWindowTime = 30 * 60 * 1000;
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
    this.chain = new BlockchainClass.Blockchain();
    this.validateWallet();
    this.postNewBlock();
    this.getStar();
    this.requestValidation();
    this.initializeMockData();
  }

  getStar() {
    this.app.get("/stars/", (req, res) => {
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
                if (req.body.hash != undefined) {
                  if (data.hash == req.body.hash) {
                    body.stardata.storyDecoded = hex2ascii(body.stardata.story);
                    block.push(data);
                  }
                  if (i == count) {
                    res.send(block);
                    res.end();
                  }
                } else if (req.body.address != undefined) {
                  if (body.address == req.body.address) {
                    body.stardata.storyDecoded = hex2ascii(body.stardata.story);
                    block.push(data);
                  }
                  if (i == count) {
                    res.send(block);
                    res.end();
                  }
                } else if (req.body.height != undefined) {
                  if (data.height == req.body.height) {
                    block = data;
                    body.stardata.storyDecoded = hex2ascii(body.stardata.story);
                  }
                  if (i == count) {
                    res.send(block);
                    res.end();
                  }
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
      let star = JSON.parse(req.body.star);
      let address = req.body.address;
      if (
        req.body.star != undefined ||
        star.dec != undefined ||
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
        let starRegistery = "starRegistery";
        req.userData = address + ":" + requestedTimestamp + ":" + starRegistery;
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
      res.header("Content-Type", "application/x-www-form-urlencoded");
      let signature = req.body.signature;
      let address = req.body.address;
      if (!this.verifyAddressRequest(address)) {
        if (typeof self.timeoutRequests[address] != "undefined") {
          let isValid = bitcoinMessage.verify(
            self.requests[address].message,
            address,
            signature
          );

          if (isValid) {
            let status = {
              address: address,
              requestTimeStamp: this.requests[address].requestedTimestamp,
              message: this.requests[address].message,
              validationWindow: 1800,
              messageSignature: true
            };
            let bodyResponse = { registerStar: true, status: status };
            this.mempoolValid[address] = bodyResponse;
            setTimeout(function() {
              self.removeValidationRequestMempool(address);
            }, ValidRequestWindowTime);

            res.status(200);
            res.send(bodyResponse);
            this.removeValidationRequest(address);
            res.end();
          } else {
            res.set("Error", "Signature invalid" + isValid);
            res.end();
          }
        } else {
          res.set(
            "Error",
            "No request matched for this address! Please make a request"
          );
          res.end();
        }
      } else {
        console.log("You already made a request. Please send your star data");
        res.send(self.mempoolValid[address]);
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
