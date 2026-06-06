import { Router } from 'express'; import { exportsController } from './exports.controller'; import { authenticate } from '../../middleware/authenticate';
const r = Router(); r.use(authenticate);
r.get('/csv/:module', exportsController.exportCSV); r.get('/json', exportsController.exportJSON);
r.get('/markdown/:module', exportsController.exportMarkdown);
export default r;
