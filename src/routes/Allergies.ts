import express from 'express'
import AllergiesController from '../controllers/AllergiesController'
import Auth from '../middleware/middleware'

const router = express.Router()

router.get('/:nid', Auth.checkToken, AllergiesController.getAllergiesForPatient)

router.post('/add', Auth.checkToken, Auth.checkRoles(['doctor']), AllergiesController.addAllergy)

router.get('/specific/:allergyText', Auth.checkToken, AllergiesController.getSpecificAllergy)

router.delete('/remove/:pallergyId', Auth.checkToken, AllergiesController.removePllergy)

export default router