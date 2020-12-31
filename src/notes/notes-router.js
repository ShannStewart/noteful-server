const path = require('path')
const express = require('express')
const xss = require('xss')
const noteServices = require('./notes-service')

const notesRouter = express.Router();
const jsonParser = express.json();

const cleanNotes = notes => ({
    id: notes.id,
    name: notes.name,
    content: xss(notes.content),
    modified: notes.modified
})

notesRouter
    .route('/')
    .get(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        noteServices.getAllNotes(knexInstance)
        .then( notes => {
            res.json(notes.map(cleanNotes))
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name, content, folder } = req.body
        const newNote = { }
        newNote.name = name;

        for (const [key, value] of Object.entries(newNote)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                  })
            }
        }

        newNote.content = content;
        newNote.folder = folder;

        noteServices.insertNotes(
            req.app.get('db'),
            newNote
        )
        .then(note => {
            res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${note.id}`))
            .json(cleanNotes(note))
        })
        .catch(next)
    })

    notesRouter
    .route('/:note_id')
    .all((req, res, next) => {
        noteServices.getById(
            req.app.get('db'),
            req.params.note_id
          )
        .then(note => {
            if (!note){
                return res.status(404).json({
                    error: { message: `Note doesn't exist` }
                  })
            }
            res.note = note;
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
          res.json(cleanNotes(res.note))  
        })
    .patch(jsonParser, (req, res, next) => {
            const { name, content, folder } = req.body
            const noteToUpdate = { name, content, folder }

            const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
            if (numberOfValues === 0)
              return res.status(400).json({
                error: {
                  message: `Request body must contain either 'name', 'content', or 'folder'`
                }
              })

              noteServices.updateNote(
                  req.app.get('db'),
                  req.params.note_id,
                  noteToUpdate
              )
              .then(numRowsAffected => {
                res.status(204).end()
              })
              .catch(next)
        })
    .delete((req, res, next) => {
        noteServices.deleteNote(
            req.app.get('db'),
            req.params.note_id
        )
        .then(numRowsAffected => {
            res.status(204).end()
          })
          .catch(next)
    })

    module.exports = notesRouter