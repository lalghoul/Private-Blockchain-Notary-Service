/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
const SHA256 = require("crypto-js/sha256");
const level = require("level");
const chainDB = "./chaindata";
const db = level(chainDB);
const BlockClass = require("./Block.js");
/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain    |
|  ================================================*/
class Blockchain {
  constructor() {
    this.checkGenesisBlock();
  }

  addBlock(newBlock) {
    return new Promise((resolve, reject) => {
      this.getBlockCount()
        .then(height => {
          newBlock.height = JSON.parse(height);
          newBlock.time = new Date()
            .getTime()
            .toString()
            .slice(0, -3);
          if (newBlock.height > 0) {
            this.getBlock(newBlock.height - 1)
              .then(block => {
                newBlock.previousBlockHash = JSON.parse(block).hash;

                newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

                addDataToLevelDB(JSON.stringify(newBlock));
                resolve(newBlock);
              })
              .catch(error => {
                console.log(error);
              });
          } else {
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
            addDataToLevelDB(JSON.stringify(newBlock));
            resolve(newBlock);
          }
        })
        .catch(error => {
          console.log(error);
        });
    });
  }
  getBlockHeight() {
    let currentHeight = 0;
    return new Promise((resolve, reject) => {
      db.createReadStream()
        .on("data", function(data) {
          currentHeight++;
        })
        .on("error", function(err) {
          return console.log("Unable to get block height", err);
          reject(err);
        })
        .on("close", function() {
          resolve(currentHeight - 1);
        });
    });
  }
  getBlockCount() {
    let currentHeight = 0;
    return new Promise((resolve, reject) => {
      db.createReadStream()
        .on("data", function(data) {
          currentHeight++;
        })
        .on("error", function(err) {
          console.log("Unable to get block height", err);
          reject(err);
        })
        .on("close", function() {
          resolve(currentHeight);
        });
    });
  }
  // get block
  getBlock(blockHeight) {
    // return object as a single string
    return getLevelDBData(blockHeight)
      .then(ret => {
        ret = JSON.parse(ret);
        //console.log(ret);
        return ret;
      })
      .catch(err => {
        console.log(err);
      });
  }
  // validate block
  validateBlock(blockHeight) {
    // get block object
    new Promise((resolve, reject) => {
      this.getBlock(blockHeight)
        .then(block => {
          let blockData = JSON.parse(block);
          let blockHash = JSON.parse(block).hash;
          blockData.hash = "";
          let validBlockHash = SHA256(JSON.stringify(blockData)).toString();
          // Compare
          if (blockHash === validBlockHash) {
            console.log("Block is Valid!");
            resolve(true);
          } else {
            console.log(
              "Block #" +
                blockHeight +
                " Invalid hash:\n" +
                blockHash +
                "<>" +
                validBlockHash
            );
            reject(false);
          }
        })
        .catch(error => {
          console.log(error);
        });
    });
  }
  // Validate blockchain
  validateChain() {
    let errorLog = [];
    this.getBlockHeight().then(height => {
      let heightNum = JSON.parse(height);
      var promises = [];
      for (var i = 0; i < heightNum; i++) {
        promises.push(this.chainChecker(i));
      }
      Promise.all(promises).then(() => {
        if (errorLog.length > 0) {
          console.log("Block errors = " + errorLog.length);
          console.log("Blocks: " + errorLog);
        } else {
          console.log("Blockchain is valid");
        }
      });
    });
  }
  // validate block
  chainChecker(i) {
    return new Promise(resolve => {
      this.getBlock(i + 1).then(blockPlus => {
        let blockHash = JSON.parse(blockPlus).previousBlockHash;

        this.getBlock(i).then(block => {
          let previousHash = JSON.parse(block).hash;
          if (blockHash !== previousHash) {
            errorLog.push(i);
            console.log(
              "Block Number" +
                i +
                "and Block" +
                (i + 1) +
                "are not chained together"
            );
          } else {
            console.log(
              "Block Number " + i + " and Block " + (i + 1) + " are chained."
            );
          }
          resolve();
        });
      });
    });
  }
  checkGenesisBlock() {
    this.getBlockCount()
      .then(height => {
        if (height == 0) {
          let newBlock = new BlockClass.Block("Genesis block");
          // UTC timestamp
          newBlock.time = new Date()
            .getTime()
            .toString()
            .slice(0, -3);
          newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
          addDataToLevelDB(JSON.stringify(newBlock));
          console.log("Genesis Block Added");
        } else {
          console.log("Genesis Block Founded");
        }
      })
      .catch(error => {
        console.log(error);
      });
  }
  // Get block by hash

  getBlockByWalletAddress(address) {
    let self = this;
    let block = null;
    let star = data.block;
    return new Promise(function(resolve, reject) {
      self.db
        .createReadStream()
        .on("data", function(data) {
          if (star[address] === address) {
            block = data;
          }
        })
        .on("error", function(err) {
          reject(err);
        })
        .on("close", function() {
          resolve(block);
        });
    });
  }
}
//db functions
// Add data to levelDB with key/value pair
function addLevelDBData(key, value) {
  db.put(key, JSON.stringify(value), function(err) {
    if (err) return console.log("Block " + key + " submission failed", err);
  });
}
// Get data from levelDB with key
function getLevelDBData(key) {
  return new Promise((resolve, reject) => {
    db.get(key, function(err, value) {
      if (err) {
        reject(err);
        //  return err;
      } else {
        resolve(value);
        //return value;
      }
    });
  });
}

// Add data to levelDB with value
function addDataToLevelDB(value) {
  let i = 0;
  db.createReadStream()
    .on("data", function(data) {
      i++;
    })
    .on("error", function(err) {
      return console.log("Unable to read data stream!", err);
    })
    .on("close", function() {
      console.log("Block #" + i);
      console.log("Block #" + value);
      addLevelDBData(i, value);
      return value;
    });
}

module.exports.Blockchain = Blockchain;
