# Admin Job Editing Fix & Enhancement

## Date: 2026-01-27

### Problem
Users report that the Admin 'Edit Job' functionality is not working as expected. Investigation reveals:
1. **UI Inconsistency:** The 'Edit' button in the main jobs list (`/admin/jobs`) navigates to the *details* page instead of opening the edit dialog.
2. **Data Handling:** Potential issues with how 'none' values for teams/workers are handled during update, and ensuring date fields are correctly formatted.

### Goal
Ensure Admin users can seamlessly edit all job details directly from the jobs list and the details page, with robust error handling.

### Phase 1: Jobs List UI Fix
- [x] Update `apps/web/app/[locale]/admin/jobs/page.tsx` to use `JobDialog` for the edit action instead of a simple Link.
- [x] Ensure `JobDialog` is properly populated with the job data when opened from the list.

### Phase 2: Data Validation & Persistence
- [x] Review `JobDialog` submission logic (`onSubmit`) to correctly handle 'none' values for `teamId` and `workerId`.
- [x] Verify `updateJobAction` in `apps/web/lib/actions/jobs.ts` handles dates and optional fields correctly.
- [x] Improve error feedback in `JobDialog` to display server-side validation errors.

### Phase 3: Verification
- [x] Verify editing a job from the main list works.
- [x] Verify editing a job from the details page works.
- [x] Verify all fields (status, dates, assignments) are correctly updated in the database.
