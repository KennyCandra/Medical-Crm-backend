import express from 'express'
const router = express.Router()
import DrugController from '../controllers/DrugsController'

router.get('/', DrugController.fetchAllDrugs)


export default router