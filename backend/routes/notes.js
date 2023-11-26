const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes')
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');


// ROUTE-1: fetching all user notes using Get by endpoint "/api/notes/fetchallnotes", Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE-2: adding a note using Post by endpoint "/api/notes/addnote", Login required
router.post('/addnote', fetchuser, [
    body('title', 'Title must have minimum 3 characters').isLength({ min: 3 }),
    body('description', 'Description must have minimum 5 characters').isLength({ min: 5 })
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;

        // checking for bad request and returning them
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        // creating new note and adding it to database
        const note = await Notes.create({
            title, description, tag, user: req.user.id
        })

        res.json(note);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE-3: updating a note using Put by endpoint "/api/notes/updatenote", Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        // creating a newNote object
        const newNote = {};

        if (title) {
            newNote.title = title
        }
        if (description) {
            newNote.description = description
        }
        if (tag) {
            newNote.tag = tag
        }

        // finding the note to update
        let note = await Notes.findById(req.params.id);

        // if note does not exist
        if (!note) {
            return res.status(404).send("Not found");
        }

        // if user id of note is not equal to user id of the authentication token
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed");
        }

        // updating the note
        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });

        res.json(note);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE-4: deleting a note using Delete by endpoint "/api/notes/deletenote", Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // finding the note to delete
        let note = await Notes.findById(req.params.id);

        // if note does not exist
        if (!note) {
            return res.status(404).send("Not found");
        }

        // if user id of note is not equal to user id of the authentication token
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed");
        }

        // deleting the note
        note = await Notes.findByIdAndDelete(req.params.id);

        res.json({ "success": "Note deleted successfully", note: note });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

module.exports = router;