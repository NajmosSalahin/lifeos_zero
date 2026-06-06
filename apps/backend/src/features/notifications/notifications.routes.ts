import { Router } from 'express'; import { notificationsController } from './notifications.controller'; import { authenticate } from '../../middleware/authenticate';
const r = Router(); r.use(authenticate);
r.get('/', notificationsController.list); r.get('/unread-count', notificationsController.unreadCount);
r.patch('/read-all', notificationsController.markAllRead); r.patch('/:id/read', notificationsController.markRead);
r.delete('/:id', notificationsController.delete);
export default r;
