const fs = require("fs");

const { FileDataAccess } = require("./lib/FileDataAccess");
const { UserService } = require("./lib/UserService");
const { UserController } = require("./lib/UserController");

const { dataDir } = require("./config");

function verifyDirectoryAccess(dir) {
	const rwx = fs.constants.R_OK | fs.constants.W_OK | fs.constants.X_OK;
	try {
		fs.accessSync(dir, rwx);
	} catch (error) {
		throw `Cannot access directory ${dir}`;
	}
}

function bootstrapUsersController() {
	const usersDir = `${dataDir}/users`;
	try {
		verifyDirectoryAccess(usersDir);
	} catch (error) {
		throw `(${UserController.name}) ${error}`;
	}
	const fda = new FileDataAccess(usersDir);
	const service = new UserService(fda);
	const controller = new UserController(service);
	return (requestData, callback) => controller.processRequest(requestData, callback);
}

exports.bootstrapUsersController = bootstrapUsersController;
