/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
const BlockClass = require("./Block.js");
const BlockchainClass = require("./Blockchain.js");
const bitcoin = require("bitcoinjs-lib");
const bitcoinMessage = require("bitcoinjs-message");
const util = require("util");
const TimeoutRequestsWindowTime = 5 * 60 * 1000;
const ValidRequestWindowTime = 1800;
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
    this.getBlockByIndex();
    this.postNewBlock();
    this.registerStar();
    this.requestValidation();
    this.initializeMockData();
  }

  getBlockByIndex() {
    this.app.get("/block/:index", (req, res) => {
      this.chain.getBlockHeight().then(height => {
        let count = JSON.parse(height);
        let index = req.params.index;
        if (count >= index) {
          this.chain.getBlock(index).then(block => {
            res.set(200);
            res.set("Content-Type", "text/plain");
            res.set("Data", block);
            res.set("Connection", "close");
            res.status(200).send(block);
          });
        } else {
          res.status(404).send("Block Not Found!");
        }
      });
    });
  }
  postNewBlock() {
    let self = this;
    return this.app.post("/block/:data", (req, res) => {
      // Add your code here
      let body = req.params.data;
      if (body === "") {
        res.status(415).send("Block Body is empty");
      } else {
        let newblock = new BlockClass.Block(body);
        self.chain
          .addBlock(newblock)
          .then(block => {
            res.set(200);
            res.set("Content-Type", "text/plain");
            res.set("Data", JSON.stringify(block));
            res.set("Connection", "close");
            res.status(200).send(JSON.stringify(block));
          })
          .catch(err => {
            res.status(415).send("Something went wrong");
            console.log(err);
          });
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
  simpleStringify(object) {
    var simpleObject = {};
    for (var prop in object) {
      if (!object.hasOwnProperty(prop)) {
        continue;
      }
      if (typeof object[prop] == "object") {
        continue;
      }
      if (typeof object[prop] == "function") {
        continue;
      }
      simpleObject[prop] = object[prop];
    }
    return simpleObject; // returns cleaned up JSON
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
    this.app.post("/requestValidation/:address", (req, res) => {
      let address = req.params.address;
      if (typeof this.timeoutRequests[address] === "undefined") {
        let address = req.params.address;
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
        res.set("address", address);
        res.set("message", req.userData);
        res.set("requestedTimestamp", requestedTimestamp);
        res.set("timeLeft", timeLeft);
        let userOBJ = {
          address: address,
          message: req.userData,
          requestedTimestamp: requestedTimestamp
        };
        this.requests[address] = userOBJ;
        res.end();
      } else {
        let timeElapse =
          new Date()
            .getTime()
            .toString()
            .slice(0, -3) - this.requests[address].requestedTimestamp;
        let timeLeft = TimeoutRequestsWindowTime / 1000 - timeElapse;
        res.status(500);
        res.set("Error", "You already made a request.");
        res.set("Address", this.requests[address].address);
        res.set("message", this.requests[address].message);
        res.set(
          "requestedTimestamp",
          this.requests[address].requestedTimestamp
        );
        res.set("timeLeft", timeLeft);
        res.end();
      }
    });
  }

  validateWallet() {
    let self = this;
    self.app.post(
      "/message-signature/validate/:address/:signature",
      (req, res) => {
        res.header("Content-Type", "application/x-www-form-urlencoded");
        let signature = decodeURIComponent(req.params.signature);
        let address = decodeURIComponent(req.params.address);
        if (!this.verifyAddressRequest(address)) {
          if (typeof self.timeoutRequests[address] != "undefined") {
            let isValid = bitcoinMessage.verify(
              self.requests[address].message,
              address,
              signature
            );

            if (isValid) {
              res.status(200);

              let status = {
                address: address,
                requestTimeStamp: this.requests[address].requestedTimestamp,
                message: this.requests[address].message,
                validationWindow: 1800,
                messageSignature: true
              };
              this.mempoolValid[address] = status;
              res.set("Status", JSON.stringify(this.mempoolValid[address]));
              res.end();
            } else {
              res.set("Error", isValid);
              res.set("Status", JSON.stringify(this.mempoolValid[address]));
              res.end();
            }
          } else {
            res.set("Sig", signature);
            res.set("Address", address);
            res.set(
              "Error",
              "No request matched for this address! Please make a request"
            );
            res.end();
          }
        } else {
          res.set("Error", "You already made a request.");
          res.end();
        }
      }
    );
  }
  registerStar() {
    this.app.post("/addstar", (req, res) => {
      let star = JSON.parse(req.body.star);
      let address = req.body.address;
      let starStory = star.story;
      if (!this.verifyAddressRequest(address)) {
        let body = {
          address: address,
          stardata: {
            ra: star.ra,
            dec: star.dec,
            mag: star.mag,
            cen: star.cen,
            story: starStory
          }
        };
        res.status(200);
        res.set("Status", "Star Successfully Added");
        res.set("Block", JSON.stringify(body));
        res.end();
        console.log(body);
        this.chain.addBlock(new BlockClass.Block(body));
      } else {
        res.status(500);
        res.set("Erorr", "Somthing went wrong!!");
        res.end();
      }
    });
  }

  initializeMockData() {
    let self = this;
    return this.chain.getBlockHeight().then(height => {
      if (height === 0) {
        (function theLoop(i) {
          setTimeout(function() {
            let blockAux = new BlockClass.Block(`Test Data #${i}`);
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
