import { Request, Response } from "express";
import mongoose from "mongoose";
import Post from "../models/Post";
import { assertDefined } from "../utils/assertDefined";


export const createPost = async (req: Request, res: Response) => {
    assertDefined(req.userId)
    const { title, link, body } = req.body;

    try {
        const post = new Post({
            title,
            link,
            body,
            author: req.userId
        })

        if (req.file) {

            const dbConnection = mongoose.connection;

            const bucket = new mongoose.mongo.GridFSBucket(dbConnection.db, {
                bucketName: 'images'
            })

            const uploadStream = bucket.openUploadStream(req.file.originalname);
            const filedId = uploadStream.id;

            await new Promise((resolve, reject) => {
                uploadStream.once('finish', resolve)
                uploadStream.once('error', reject)

                uploadStream.end(req.file?.buffer)
            })

            post.image = {
                mimeType: req.file.mimetype,
                size: req.file.size,
                id: filedId
            }
        }

          const savePost = await post.save();
          res.status(201).json(savePost)
    } catch (error) {
        console.log(error)
        res.status(500).json( {message: 'Failed to create post'})
    }
}

export const getAllPosts = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit?.toString() || '5')
    const page = parseInt(req.query.page?.toString() || '1')

    if (isNaN(page)) {
        res.status(400).json( { message: 'Pagenumber does not exist ' + page})
    } 

    const posts = await Post
        .find({}, '-comments')
        .sort({createdAt: 'descending'})
        .limit(limit)
        .skip(limit * (page - 1))
        .populate('author', 'userName');

    const totalCount = await Post.countDocuments();

    res.status(200).json({
        posts,
        totalPages: Math.ceil(totalCount/limit),
        query: req.query
    })
}

export const getPost = async (req: Request, res: Response) => {
    const { id } = req.params;

    const post = await Post.findById(id).populate('author', 'userName').populate('comments.author');

    if (!post) {
        return res.status(404).json({ message: 'Could not find post for id: ' + id})
    }

    res.status(200).json(post)
}

export const deletePost = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId } = req
    assertDefined(userId)
    const post = await Post.findById(id)

    if (!post) {
        return res.status(404).json({ message: 'No post found for id: ' + id})
    }

    if (post.author.toString() !== userId) {
        return res.status(403).json({ message: 'Not authorized' })
    }
    await post.deleteOne()

    return res.status(200).json({ message: 'post deleted'})
}

export const editPost = async (req: Request, res: Response) => {
    const { id } = req.params
    const { userId } = req
    assertDefined(userId)

    const { title, link, body } = req.body

    const post = await Post.findById(id)

    if (!post) {
        return res.status(404).json({ message: 'No post found for id: ' + id})
    }

    if (post.author.toString() !== userId) {
        return res.status(403).json({ message: 'Not authorized' })
    }

    await post.updateOne({ title, link, body })

    const updatedPost = await post.save()

    return res.status(200).json(updatedPost)
}