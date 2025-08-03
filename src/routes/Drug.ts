import express from 'express'
const router = express.Router()
import DrugController from '../controllers/DrugsController'

router.post('/', DrugController.fetchAllDrugs)

router.post('/interaction', DrugController.getInteractions)

router.get('/search/:value', DrugController.searchDrug)


export default router