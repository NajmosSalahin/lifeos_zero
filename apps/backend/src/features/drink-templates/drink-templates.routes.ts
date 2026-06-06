import { Router } from 'express'; import { drinkTemplatesController } from './drink-templates.controller'; import { authenticate } from '../../middleware/authenticate';
const r = Router(); r.use(authenticate);
r.get('/', drinkTemplatesController.list); r.post('/', drinkTemplatesController.create);
r.patch('/:id', drinkTemplatesController.update); r.delete('/:id', drinkTemplatesController.delete);
export default r;
