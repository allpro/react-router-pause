const puppeteer = require('puppeteer')
process.env.CHROME_BIN = puppeteer.executablePath()

module.exports = {
	type: 'react-component',
	npm: {
		esModules: true,
		umd: {
			global: 'ReactRouterPause',
			externals: {
				react: 'React',
			},
		},
	},
	karma: {
		browsers: ['ChromeHeadless'],
		// transports: ['polling'],
		extra: {
			customLaunchers: {
				ChromeHeadless: {
					base: 'Chrome',
					flags: [
						'--headless',
						'--disable-gpu',
						'--no-sandbox',
						// If no remote debugging port, Chrome exits immediately
						'--remote-debugging-port=9222',
					],
				},
			},
		},
	},
}
