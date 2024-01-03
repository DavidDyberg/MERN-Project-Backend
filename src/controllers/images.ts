import { Request, Response } from "express";
import mongoose from 'mongoose'


export const getImage = (req: Request, res: Response) => {
    const dbConnection = mongoose.connection;
    const bucket = new mongoose.mongo.GridFSBucket(dbConnection.db, {
        bucketName: 'images'
    })

    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(req.params.id)) 

    

    downloadStream.on('data', (chunk) => {
        res.write(chunk);
    })

    downloadStream.on('end', () => {
        res.end();
    })
}