const fs = require("fs");

class FileDataAccess {
	constructor(
		dir
	) {
		this.dir = dir;
	}
	create(name, data) {
		const filePath = `${this.dir}/${name}.json`;
		return new Promise((resolve, reject) => {
			fs.open(filePath, "wx", (err, fd) => err
				? reject(`Could not open ${filePath}`)
				: resolve(fd));
		})
		.then(fd => new Promise((resolve, reject) => {
			fs.writeFile(fd, data, (err) => err
			? reject(`Could not write to ${filePath}`)
			: resolve(fd));
		}))
		.then(fd => new Promise((resolve, reject) => {
			fs.close(fd, (err) => err
			? reject(`Could not close ${filePath}`)
			: resolve(true));
		}));
	}
	recover(name) {
		const filePath = `${this.dir}/${name}.json`;
		return new Promise((resolve, reject) => {
			fs.readFile(filePath, "utf8", (err, data) => err
				? reject(`Could not read ${filePath}`)
				: resolve(data));
		});
	}
	update(name, data) {
		const filePath = `${this.dir}/${name}.json`;
		return new Promise((resolve, reject) => {
			fs.open(filePath, "r+", (err, fd) => err
				? reject(`Could not open ${filePath}`)
				: resolve(fd));
		})
		.then(fd => new Promise((resolve, reject) => {
			fs.truncate(fd, (err) => err
				? reject(`Could not write to ${filePath}`)
				: resolve(fd));
		}))
		.then(fd => new Promise((resolve, reject) => {
			fs.writeFile(fd, data, (err) => err
				? reject(`Could not truncate ${filePath}`)
				: resolve(fd));
		}))
		.then(fd => new Promise((resolve, reject) => {
			fs.close(fd, (err) => err
				? reject(`Could not close ${filePath}`)
				: resolve(true));
		}));
	}
	destroy(name) {
		const filePath = `${this.dir}/${name}.json`;
		return new Promise((resolve, reject) => {
			fs.unlink(filePath, (err) => err
				? reject(`Could not delete ${filePath}`)
				: resolve(true));
		});
	}
}

exports.FileDataAccess = FileDataAccess;
