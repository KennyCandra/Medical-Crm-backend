import express from 'express'
import AllergiesController from '../controllers/AllergiesController'
import Auth from '../middleware/middleware'

const router = express.Router()


router.get('/:nid', AllergiesController.getAllergiesForPatient)

router.post('/add', Auth.checkToken, AllergiesController.addAllergy)

router.get('/specific/:allergyText', AllergiesController.getSpecificAllergy)

router.delete('/remove/:pallergyId', AllergiesController.removePllergy)

export default router