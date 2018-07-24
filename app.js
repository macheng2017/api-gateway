const express = require('express')
const httpProxy = require('http-proxy')
const morgan = require('morgan')

const auth = require('./middleware/auth')
const serviceConfig = require('./service_config')

const proxy = httpProxy.createServer()
const app = express()

app.use(morgan('tiny'))

const goto = function (req, res, next) {
  proxy.web(req, res, {
    target: req.target
  }, (err) => {
    res.status(500).end(req.target + ' error.')
  })
}

const userRouter = express.Router()
userRouter.get('/:id/info', goto)

const postRouter = express.Router()
postRouter.post('/:id/info', auth, goto)

const messageRouter = express.Router()
messageRouter.put('/:id/info', auth, goto)

const configTarget = function (target) {
  return function (req, res, next) {
    req.target = target
    next()
  }
}

app.use('/user', configTarget(serviceConfig['/user']), userRouter)
app.use('/post', configTarget(serviceConfig['/post']), postRouter)
app.use('/message', configTarget(serviceConfig['/message']), messageRouter)

module.exports = app
