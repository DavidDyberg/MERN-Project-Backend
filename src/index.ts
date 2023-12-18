import 'dotenv/config'
import express from 'express';
import cors from 'cors'
import mongoose from 'mongoose';
import * as authController from './controllers/auth'
import * as postsController from './controllers/posts'
import * as commentsController from './controllers/comments'
import validateToken from './middleware/validateToken';

const app = express()

app.use(cors());
app.use(express.json());

app.post('/register', authController.register);
app.post('/login', authController.logIn);
app.get('/profile', validateToken, authController.profile);

app.post('/posts', validateToken, postsController.createPost);
app.get('/posts', postsController.getAllPosts)
app.get('/posts/:id', postsController.getPost)

app.post('/posts/:postId/comments', validateToken, commentsController.createComment)
app.delete('/posts/:postId/comments/:commentId', validateToken, commentsController.deleteComment)

const mongoURL = process.env.DB_URL;

if (!mongoURL) throw Error('Missing db url');

mongoose.connect(mongoURL)
    .then(() => {
        const port = parseInt(process.env.PORT || '3000');
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`)
        })
    })