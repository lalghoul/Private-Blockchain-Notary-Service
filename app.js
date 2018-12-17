//Importing Express.js module
const express = require("express");
//Importing BodyParser.js module
const bodyParser = require("body-parser");

/**
 * Class Definition for the REST API
 */
class BlockchainAPI {
  /**
   * Constructor that allows initialize the class
   */
  constructor() {
    this.app = express();
    this.app.use(bodyParser.json()); // support json encoded bodies
    this.app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
    this.initExpress();
    this.initExpressMiddleWare();
    this.initControllers();

    this.start();
  }

  /**
   * Initilization of the Express framework
   */
  initExpress() {
    this.app.set("port", 8000);
  }

  /**
   * Initialization of the middleware modules
   */
  initExpressMiddleWare() {
    this.app.use(bodyParser.json()); // support json encoded bodies
    this.app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
  }

  /**
   * Initilization of all the controllers
   */
  initControllers() {
    require("./blockController.js")(this.app);
  }

  /**
   * Starting the REST Api application
   */
  start() {
    let self = this;
    this.app.listen(this.app.get("port"), () => {
      console.log(`Server Listening for port: ${self.app.get("port")}`);
    });
  }
}

new BlockchainAPI();
