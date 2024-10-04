import express from 'express'
import { errorHandlerMiddleware } from './middlewares/error-handler.middleware'
import { jsonResponseMiddleware } from './middlewares/json-respsone.middleware'
import conferenceRoutes from './routes/conference.routes'

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(jsonResponseMiddleware)
app.use(conferenceRoutes)
app.use(errorHandlerMiddleware)


export default app;