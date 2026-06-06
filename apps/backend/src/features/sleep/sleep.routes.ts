import { Router } from 'express'; import { sleepController } from './sleep.controller'; import { authenticate } from '../../middleware/authenticate';
const r = Router(); r.use(authenticate);
r.get('/', sleepController.list); r.post('/', sleepController.create); r.get('/stats', sleepController.getStats);
r.patch('/:id', sleepController.update); r.delete('/:id', sleepController.delete);
export default r;
