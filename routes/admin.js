const router = require('express').Router()
const controller = require('../controller')
const Admin = require('../models/admin')

router.get('/check', (req,res) => res.send('hello world'))
router.post('/signup/admin', controller.signUp(Admin))
router.post('/signin', controller.signIn(Admin))


module.exports = router
