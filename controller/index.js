const Admin = require('../models/admin')
const Item = require('../models/item')
const Cart = require('../models/cart')
const bcrypt = require('bcrypt')
const axios = require('axios')
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


module.exports = {
  signUp: (model) => async(req,res) => {
    try{
      const {email,password} = req.body
      console.log(email, password)

      if(!email || !password){
        throw new Error('check email and password')
      }

      bcrypt.hash(password, 12, async function(err, hash) {
        try{
          const user =  await model.create({ ...req.body, password: hash })
          const cart =  await Cart.create({user: user.id})
          console.log(user)
          res.status(200).json({ user, cart })
        }catch(err){
          res.status(404).json({ err })
        }
      })
    }catch(err){
      res.status(500).json({ err })
    }
  },
  signIn: (model) => async(req,res) => {
    try{
      const {email,password} = req.body

      console.log(req.body)
      if(email && password){
        const valid = await model.findOne({email})
        console.log(valid)
        res.status(200).json({ user: valid })
      }
      throw new Error('check email and password')
    }catch(err){
      res.status(404).json({ err })
    }
  },
  createItem: async(req, res) => {
    try{
      console.log('hey')
      console.log(req.body)
      console.log(req.query.id)
      // const pic = await axios.post(`https://api.imgbb.com/1/upload?key=${process.env.IMGBBKEY}`, {
      //   image: picture
      // })

      // console.log(pic)
      // res.status(200).json({})

      const newItem = await Item.create({user: req.query.id, sold: false, ...req.body})

      res.status(200).json({newItem})
    }catch(err){
      res.status(500).json({err})
    }
  },
  updateItem: async(req, res) => {
    try{
      const updatedItem = await Item.findByIdAndUpdate({_id: req.query.id}, req.body, {new:true}).lean().exec()
      res.status(200).json({ updatedItem })
    }catch(err){
      res.status(500).json({err})
    }
  },
  getItems: async(req, res) => {
    try{
      const items = await Item.find( { sold: false } )
      console.log(items)
      res.status(200).json({doc : items})
    }catch(err){
      res.status(500).json({err})
    }
  },
  getItem: async(req, res) => {
    try{
      const item = await Item.findById( { _id: req.query.id } )
      res.status(200).json({item})
    }catch(err){
      res.status(500).json({err})
    }
  },
  deleteItem: async(req, res) => {
    try{
      const item = await Item.findByIdAndDelete({user: req.query.id}).lean().exec()
      res.status(200).json({item})
    }catch(err){
      res.status(500).json({err})
    }
  },
  getCart: async(req, res) => {
    try{
      const cart = await Cart.findOne( { user: req.query.id} )
      const items = await Item.find().where('_id').in(cart.items).exec()
      const listItems = []
      items.map(i => {
        listItems.push({name: i.name, description: i.description, amount: i.price * 100})
      })
      console.log('new t',listItems)
      res.status(200).json({doc : items})
    }catch(err){
      res.status(500).json({err})
    }
  },
  addToCart: async(req, res) => {
    try{
      const [records] = await Item.find().where('_id').in(req.body.id).exec();
      // console.log(records)
      const cart = await Cart.findOneAndUpdate( { user: req.query.id}, {$push: {items: req.body.id}, $inc: { price: records.price}}, {new: true }).lean().exec()
      console.log(cart)
      res.status(200).json({doc : cart})
    }catch(err){
      console.log(err)
      res.status(500).json({err})
    }
  },
  removeFromCart: async(req, res) => {
    try{
      const cart = await Cart.findOneAndUpdate( { user: req.query.id}, {$pull: {items: req.body.id}, $inc: { price: -1}}, {new: true }).lean().exec()

      res.status(200).json({doc : cart})
    }catch(err){
      console.log(err)
      res.status(500).json({err})
    }
  },
  getCategory: async(req, res) => {
    try{
      const records = await Item.find().where('category').in(req.query.category).exec();
      
      res.status(200).json({doc : records})
    }catch(err){
      console.log(err)
      res.status(500).json({err})
    }
  },
  checkout: async (req, res) => {
    try{
      const cart = await Cart.findOne( { user: req.query.id} )
      console.log('cart', cart)
      const items = await Item.find().where('_id').in(cart.items).exec()
      const listItems = []
      items.map(i => {
        listItems.push({name: i.name, description: i.description, amount: i.price * 100, currency: "usd", quantity: 1})
      })
      console.log(listItems)
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: listItems,
        success_url: "https://ksks2121.netlify.app/",
        cancel_url: "https://ksks2121.netlify.app/"
      });
      console.log(session)
      res.json(session);
    }catch(err){
      console.log(err)
      res.status(500).json({err})
    }
  }
}
