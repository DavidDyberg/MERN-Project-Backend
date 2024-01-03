import 'dotenv/config'
import express from 'express';
import cors from 'cors'
import mongoose from 'mongoose';
import multer from 'multer';
import * as authController from './controllers/auth'
import * as postsController from './controllers/posts'
import * as commentsController from './controllers/comments'
import * as votesController from './controllers/votes'
import * as imagesController from './controllers/images'
import validateToken from './middleware/validateToken'

const app = express()

app.use(cors());
app.use(express.json());
app.use('/static/', express.static(__dirname + '/../uploads'))

const upload = multer();

app.post('/register', authController.register);
app.post('/login', authController.logIn);
app.get('/profile', validateToken, authController.profile);

app.post('/posts', validateToken,upload.single('image'), postsController.createPost);
app.get('/posts', postsController.getAllPosts)
app.get('/posts/:id', postsController.getPost)
app.delete('/posts/:id/delete', validateToken, postsController.deletePost)
app.put('/posts/:id/edit', validateToken, postsController.editPost)

app.post('/posts/:postId/upvote', validateToken, votesController.upvote)
app.post('/posts/:postId/downvote', validateToken, votesController.downvote)

app.post('/posts/:postId/comments', validateToken, commentsController.createComment)
app.delete('/posts/:postId/comments/:commentId', validateToken, commentsController.deleteComment)

app.get('/images/:fieldId', imagesController.getImage)

const mongoURL = process.env.DB_URL;

if (!mongoURL) throw Error('Missing db url');

mongoose.connect(mongoURL)
    .then(() => {
        const port = parseInt(process.env.PORT || '3000');
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`)
        })
    })