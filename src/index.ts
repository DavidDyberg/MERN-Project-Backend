import express from 'express';

const app = express()
const port = 3000

app.use('/', (req, res) => {
    console.log('Root route hit')

    res.send('Hello world!!!')
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})