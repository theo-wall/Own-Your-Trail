const {createTrail,createUser,listTrails,findUserByEmail,listUsers,getTrailById, getTrailByFind, update} = require('../models/trailsAndUserDataMongoose')
const cloudinary = require("../utils/cloudinary")
const upload = require("../utils/multer")
const fs = require('fs')
const express = require('express')
const router = express.Router()

require ("dotenv").config()
const bcrypt = require ("bcryptjs")
const jwt = require ("jsonwebtoken")

const verifyToken = require("../models/auth")

router.post ('/tokenTestingRoute', verifyToken, (req,res) => {
    console.log ("Your token is still active!")
    res.send("token is valid")
})

router.post('/createTrail', verifyToken, async (req, res) => { //per Tony's Nov 24 video should be a post not a get
    let trailInfo = req.body
    newId = await createTrail(trailInfo)
    res.json(newId)
})

router.post('/updateTrail/:id', verifyToken, async (req, res) => {
    let id = req.params.id
    let updatedTrail = req.body
    console.log('updating trail', id, 'with', updatedTrail )
    let newTrail = await update(id, updatedTrail)
    console.log('trail updated to', newTrail)
    res.send(newTrail)
})

router.post('/addImage', upload.array('image'), async (req, res) => {
    try {
        const uploader = async (path) => await cloudinary.uploads(path, 'images')
        
        if(req.method === 'POST') {
            const urls = []
    
            const files = req.files
  
            for (const file of files) {
                const { path } = file
            
                const newPath = await uploader(path)
            
                urls.push(newPath)
            
                fs.unlinkSync(path)
            }

            res.send({
                message: 'Images Uploaded Successfully',
                data: urls
            })
        } else {
            res.send.json()({
                err: 'Upload Failed'
            })
        }
    } catch (error) {
        console.log('rejected in routes', error)
    }
    })

router.post('/createUser', async (req, res) => {

    try {
        // our register logic starts here
        const { user_name, email, password } = await req.body

        // validate user input
        if (!(email && password && user_name)) {
            return res.status(400).send({message: "All inputs are required!", userToken:null})
        }

        // check if user already exists
        // Validate if user exists in our database
        const oldUser = await findUserByEmail(email.toLowerCase())

        if (oldUser) {
            return res.status(409).send({message: "User Already Exists! Please login", userToken:null})
        }

        // Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10)

        // Create user in our database
        const user = await createUser ({
            userName: user_name,
            userEmail: email.toLowerCase(),
            userPassword: encryptedPassword,
        })

        // Create token
        const token = jwt.sign (
            { user_id: user.userId, email },
            process.env.TOKEN_KEY,
            {expiresIn: "2h",}
        )
        
        // save user token and remove password and email info from user

        user.userToken=token
        user.userEmail=''
        user.userPassword=''
    
        // return new user
        res.status(201).json(user)
    } catch (err) {
        console.log (err)
    }

})

router.post ('/login', async (req,res) => {

    // our login logic starts here
    try {
        // Get user input
        const {email, password} = req.body

        // Validate user input
        if (!(email && password)) {
           return res.status(400).send({message: "All inputs are required!", userToken: null})
        }

        // Validate if user exists in our database
        const user = await findUserByEmail(email.toLowerCase())

        if (user && (await bcrypt.compare (password, user.userPassword))) {
            // Create token
            const token = jwt.sign (
                {user_id: user.userId, email},
                process.env.TOKEN_KEY,
                {expiresIn: "2h"}
            )
            
            // save user token and remove password and email info from user
            user.userToken = token
            user.userEmail=''
            user.userPassword=''
            
            // user
            return res.status(200).json(user)
        }
        res.status(401).send({message: "Invalid Credentials!", userToken: null})
    } catch (err) {
        console.log(err)
    }
    // our register logic ends here

})

router.get('/listTrails', async (req, res) => {
    res.json(await listTrails())
})

router.get('/getTrailInfo/:id', async (req, res) => {
    let trailId = req.params.id
    console.log('we made it into the getTrailById API endpoint', trailId)
    res.json(await getTrailById(trailId))
})

router.get('/listTrailsByFind/:quadrant', async (req, res) => {
    let trailQuadrant = req.params.quadrant
    console.log('Searching by key', trailQuadrant)
    res.json(await getTrailByFind(trailQuadrant))
})

router.get('/listUsers', async (req, res) => {
    res.json(await listUsers())
})


module.exports = router
