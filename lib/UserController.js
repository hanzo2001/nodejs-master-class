const { UserModel } = require("./UserModel");

const { HTTP_BAD_REQUEST } = require("../server/errorCodes");

class UserController {
	constructor(
		userService
	) {
		this.userService = userService;
	}
	processRequest(data, callback) {
		const { method } = data;
		const allowedMethods = "post.get.put.delete".split(".");
		const methodIsAllowed = allowedMethods.indexOf(method);
		if (methodIsAllowed === -1) {throw 501;}
		//console.log(data);
		switch (method) {
			case "post":   this.postUser(data.payload, callback); break;
			case "get":    this.getUser(data.pathData.userPhone, callback); break;
			case "put":    this.putUser(data.pathData.userPhone, data.payload, callback); break;
			case "delete": this.deleteUser(data.pathData.userPhone, callback); break;
		}
	}
	postUser(userData, callback) {
		const userModel = new UserModel();
		try {
			userModel.populateAndVerify(userData);
		} catch (error) {
			throw {code:HTTP_BAD_REQUEST, msg:error};
		}
		try {
			this.userService.createUser(userModel)
				.then(data => callback(200, data))
				.catch(msg => callback(400, msg));
		} catch (error) {
			throw {code:0, msg:error};
		}
	}
	getUser(userPhone, callback) {
		const userModel = new UserModel();
		const sanitizedPhoneNumber = userModel.sanitizePhoneNumber(userPhone);
		if (!sanitizedPhoneNumber) {
			throw {code:HTTP_BAD_REQUEST, msg:`Bad phone number: ${userPhone}`};
		}
		try {
			this.userService.getUserData(sanitizedPhoneNumber)
				.then(userData => new Promise((accept, reject) => {
					try {
						userModel.populateAndVerify(userData);
						accept(userModel);
					} catch (error) {
						reject({code:0, msg:`bad output from user ${sanitizedPhoneNumber}: ${error}`});
					}
				}))
				.then(data => callback(200, data))
				.catch(msg => callback(404, msg));
		} catch (error) {
			throw {code:0, msg:error};
		}
	}
	putUser(userPhone, userData, callback) {
		const userModel = new UserModel();
		const sanitizedPhoneNumber = userModel.sanitizePhoneNumber(userPhone);
		try {
			userData.userPhone = sanitizedPhoneNumber;
			userModel.populateAndVerify(userData);
		} catch (error) {
			throw {code:HTTP_BAD_REQUEST, msg:error};
		}
		try {
			this.userService.updateUser(userModel)
				.then(data => callback(200, data))
				.catch(error => callback(404, {msg:`Could not update ${userPhone}: ${error}`}));
		} catch (error) {
			throw {code:0, msg:error};
		}
	}
	deleteUser(userPhone, callback) {
		const userModel = new UserModel();
		try {
			userPhone = userModel.sanitizePhoneNumber(userPhone);
		} catch (error) {
			throw {code:HTTP_BAD_REQUEST, msg:error};
		}
		try {
			this.userService.deleteUser(userPhone)
				.then(() => callback(200, {userPhone}))
				.catch(msg => callback(404, msg));
		} catch (error) {
			throw {code:0, msg:error};
		}
	}
}

exports.UserController = UserController;
