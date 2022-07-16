module.exports = {
	apps : [{
		name: 'WaM_bot',
		script: './bot.js',
		watch: true,
		env: {
			'NODE_ENV': 'development'
		},
		env_production: {
			'NODE_ENV': 'production',
		}
	}],
};
