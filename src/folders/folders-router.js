const path = require('path')
const express = require('express')
//const xss = require('xss')
const folderServices = require('./folders-service');

const foldersRouter = express.Router();
const jsonParser = express.json();

foldersRouter
    .route('/')
    .get(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        folderServices.getAllFolders(knexInstance)
        .then( folders => {
            res.json(folders)
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const name = req.body.name
        const newFolder = {};

        console.log('name: ' + newFolder); 

            if (name == null) {
                return res.status(400).json({
                    error: { message: `Missing 'name' in request body` }
                  })
            }

        newFolder.name = name;

        //console.log('test:')

        folderServices.insertFolders(
            req.app.get('db'),
            newFolder
        )
        .then(folder => {
            res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${folder.id}`))
            .json(folder)
        })
        .catch(next)
    })

    foldersRouter
    .route('/:folder_id')
    .all((req, res, next) => {
        folderServices.getById(
            req.app.get('db'),
            req.params.folder_id
          )
        .then(folder => {
            if (!folder){
                return res.status(404).json({
                    error: { message: `Folder doesn't exist` }
                  })
            }
            res.folder = folder;
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
          res.json(res.folder)  
        })
    .patch(jsonParser, (req, res, next) => {
            const { name } = req.body
            const folderToUpdate = { name }

            const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length
            if (numberOfValues === 0)
              return res.status(400).json({
                error: {
                  message: `Request body must contain 'name'`
                }
              })

              folderServices.updateFolder(
                  req.app.get('db'),
                  req.params.folder_id,
                  folderToUpdate
              )
              .then(numRowsAffected => {
                res.status(204).end()
              })
              .catch(next)
        })
    .delete((req, res, next) => {
        folderServices.deleteFolder(
            req.app.get('db'),
            req.params.folder_id
        )
        .then(numRowsAffected => {
            res.status(204).end()
          })
          .catch(next)
    })

    module.exports = foldersRouter