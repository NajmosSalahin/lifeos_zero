import { Router } from 'express'; import { moodController } from './mood.controller'; import { authenticate } from '../../middleware/authenticate';
const r = Router(); r.use(authenticate);
r.get('/', moodController.list); r.post('/', moodController.create);
r.get('/today', moodController.getToday); r.get('/insights', moodController.getInsights);
r.get('/calendar', moodController.getCalendar);
r.patch('/:id', moodController.update); r.delete('/:id', moodController.delete);
export default r;
