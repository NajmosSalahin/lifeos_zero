import { Router } from 'express'; import { hydrationController } from './hydration.controller'; import { authenticate } from '../../middleware/authenticate';
const r = Router(); r.use(authenticate);
r.get('/', hydrationController.list); r.post('/', hydrationController.create);
r.get('/today', hydrationController.getToday); r.get('/stats', hydrationController.getStats);
r.delete('/:id', hydrationController.delete);
export default r;
