// this middleware fix the sometime code's reload bug of nextjs
// optional but better
module.exports = {
	webpackDevMiddleware: config => {
		config.watchOptions.poll = 300
		return config
	}
}
