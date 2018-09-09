
let environments = {};

environments.staging = {
	httpPort: 3000,
	httpsPort: 3001,
	envName: 'staging'
};

environments.production = {
	httpPort: 5000,
	httpsPort: 5001,
	envName: 'production'
};

var currentEnvironment = process.env.NODE_ENV === 'production' ? process.env.NODE_ENV : 'staging';

module.exports = environments[currentEnvironment] || environments.staging;
