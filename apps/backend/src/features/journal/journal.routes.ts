import { Router } from 'express'; import { journalController } from './journal.controller'; import { authenticate } from '../../middleware/authenticate';
const r = Router(); r.use(authenticate);
r.get('/', journalController.list); r.post('/', journalController.create);
r.get('/search', journalController.search); r.get('/tags', journalController.getTags);
r.get('/categories', journalController.getCategories); r.get('/stats', journalController.getStats);
r.get('/:id', journalController.getOne); r.patch('/:id', journalController.update);
r.delete('/:id', journalController.delete); r.patch('/:id/favorite', journalController.toggleFavorite);
export default r;
