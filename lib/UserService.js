const { UserModel } = require("./UserModel");

class UserService {
	constructor(
		fda
	) {
		this.fda = fda;
	}
	createUser(userModel) {
		const userPhone = userModel.userPhone;
		return this.fda.create(userPhone, JSON.stringify(userModel)).then(() => userModel);
	}
	getUserData(userPhone) {
		return this.fda.recover(userPhone).then(userData => JSON.parse(userData));
	}
	updateUser(userModel) {
		const userPhone = userModel.userPhone;
		return this.fda.update(userPhone, JSON.stringify(userModel)).then(() => userModel);
	}
	deleteUser(userPhone) {
		return this.fda.destroy(userPhone);
	}
}

exports.UserService = UserService;
