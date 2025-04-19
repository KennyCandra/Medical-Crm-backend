import express from 'express'
const router = express.Router()
import DrugController from '../controllers/DrugsController'

router.post('/', DrugController.fetchAllDrugs)


export default router