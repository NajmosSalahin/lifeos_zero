import { Router } from 'express'; import { goalsController } from './goals.controller'; import { authenticate } from '../../middleware/authenticate';
const r = Router(); r.use(authenticate);
r.get('/', goalsController.list); r.post('/', goalsController.create);
r.get('/:id', goalsController.getOne); r.patch('/:id', goalsController.update); r.delete('/:id', goalsController.delete);
r.patch('/:id/progress', goalsController.updateProgress); r.patch('/:id/complete', goalsController.complete);
r.post('/:id/milestones', goalsController.addMilestone);
r.patch('/:id/milestones/:mid', goalsController.updateMilestone); r.delete('/:id/milestones/:mid', goalsController.deleteMilestone);
r.patch('/:id/milestones/:mid/complete', goalsController.completeMilestone);
export default r;
