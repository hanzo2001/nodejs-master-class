
const re_detectSpacesAndHyphens = /[\s-]/g;
const re_detectAreaCode = /^((\(\+?\d+\))|(\+\d+))/; // (34) | (+34) | +34
const re_detectJunkInPhone = /[^\d]/;

class UserModel {
	populateAndVerify(userData) {
		this.userPhone    = this.sanitizePhoneNumber(userData.userPhone);
		this.firstName    = this.cleanupString(userData.firstName);
		this.lastName     = this.cleanupString(userData.lastName);
		this.password     = this.cleanupString(userData.password);
		this.tosAgreement = this.cleanupString(userData.tosAgreement);
		Object.keys(this).forEach(k => {
			if (this.isNullOrUndefined(this[k])) {throw `parameter '${k}' required`;}
		});
	}
	isNullOrUndefined(value) {
		return value === null || typeof value === "undefined";
	}
	cleanupString(value) {
		if (!(typeof value === "string")) {return null;}
		value = value.trim();
		return value || null;
	}
	sanitizePhoneNumber(value) {
		if (!(typeof value === "string")) {return null;}
		value = value.replace(re_detectAreaCode,"");
		value = value.replace(re_detectSpacesAndHyphens, "");
		if (re_detectJunkInPhone.test(value)) {return null;}
		return value;
	}
}

exports.UserModel = UserModel;
