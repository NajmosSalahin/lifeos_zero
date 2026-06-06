import { Router } from 'express'; import { breathingController } from './breathing.controller'; import { authenticate } from '../../middleware/authenticate';
const r = Router(); r.use(authenticate);
r.get('/techniques', breathingController.listTechniques); r.post('/techniques', breathingController.createTechnique);
r.patch('/techniques/:id', breathingController.updateTechnique); r.delete('/techniques/:id', breathingController.deleteTechnique);
r.get('/sessions', breathingController.listSessions); r.post('/sessions', breathingController.createSession);
r.get('/sessions/stats', breathingController.getSessionStats); r.delete('/sessions/:id', breathingController.deleteSession);
export default r;
