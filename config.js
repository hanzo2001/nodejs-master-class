
const environments = {};

environments.staging = {
	httpPort: 3000,
	httpsPort: 3001,
	x509key: './https/key.pem',
	x509cert: './https/cert.pem',
	envName: 'staging'
};

environments.production = {
	httpPort: 5000,
	httpsPort: 5001,
	x509key: './https/key.pem',
	x509cert: './https/cert.pem',
	envName: 'production'
};

const currentMode = process.env.NODE_ENV;

module.exports = environments[currentMode] || environments.staging;
