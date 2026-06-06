import { Router } from 'express'; import { calendarController } from './calendar.controller'; import { authenticate } from '../../middleware/authenticate';
const r = Router(); r.use(authenticate);
r.get('/', calendarController.getMonth); r.get('/:date', calendarController.getDay);
export default r;
