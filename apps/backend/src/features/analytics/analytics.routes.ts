import { Router } from 'express'; import { analyticsController } from './analytics.controller'; import { authenticate } from '../../middleware/authenticate';
const r = Router(); r.use(authenticate);
r.get('/overview', analyticsController.getOverview); r.get('/habits', analyticsController.getHabits);
r.get('/mood', analyticsController.getMood); r.get('/sleep', analyticsController.getSleep);
r.get('/hydration', analyticsController.getHydration); r.get('/goals', analyticsController.getGoals);
export default r;
