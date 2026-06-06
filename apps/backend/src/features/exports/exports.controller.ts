import { asyncHandler } from '../../middleware/asyncHandler'; import { exportsService } from './exports.service';
export const exportsController = {
  exportCSV: asyncHandler(async (req, res) => {
    const csv = await exportsService.exportCSV(req.user!._id!.toString(), req.params.module, String(req.query.from||''), String(req.query.to||''));
    res.setHeader('Content-Type', 'text/csv'); res.setHeader('Content-Disposition', `attachment; filename="${req.params.module}-export.csv"`); res.send(csv);
  }),
  exportJSON: asyncHandler(async (req, res) => {
    const data = await exportsService.exportJSON(req.user!._id!.toString());
    res.setHeader('Content-Type', 'application/json'); res.setHeader('Content-Disposition', 'attachment; filename="lifeos-backup.json"'); res.json(data);
  }),
  exportMarkdown: asyncHandler(async (req, res) => {
    const md = await exportsService.exportMarkdown(req.user!._id!.toString(), req.params.module);
    res.setHeader('Content-Type', 'text/markdown'); res.setHeader('Content-Disposition', `attachment; filename="${req.params.module}-export.md"`); res.send(md);
  }),
};
