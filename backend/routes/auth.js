const express = require('express');
const router = express.Router();
const User = require('../models/User')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');


const JWT_SECRET = "IamDeeps";

// ROUTE-1: creating a User using Post by endpoint "/api/auth/createuser", no authentication required
router.post('/createuser', [
    body('name', 'Name must have minimum 3 characters').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must have minimum 5 characters').isLength({ min: 5 })
], async (req, res) => {
    let success = false;

    // checking for bad request and returning them
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ success, errors: result.array() });
    }

    console.log(req.body);

    try {
        // checking if user with this email already exists
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, "error": "Sorry, user with this email already exists" });
        }

        // hashing password from user request
        let myPlaintextPassword = req.body.password;
        let salt = await bcrypt.genSalt(10);
        let secPassword = await bcrypt.hash(myPlaintextPassword, salt);

        // creating new user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPassword
        })

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE-2: loging in a User using Post by endpoint "/api/auth/login", no authentication required
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password field cannot be empty').exists()
], async (req, res) => {
    let success = false;

    // checking for bad request and returning them
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }

    console.log(req.body);

    const { email, password } = req.body;
    try {
        // checking if user with this email exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success, "error": "please enter correct credentials" });
        }

        // checking if password matches
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return res.status(400).json({ success, "error": "please enter correct credentials" });
        }

        // if both credentials are correct
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE-3: fetching logged in User details using Post by endpoint "/api/auth/getuser", Login/authentication required
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.json(user);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

module.exports = router;