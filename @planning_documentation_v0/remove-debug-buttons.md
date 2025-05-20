# Remove Debug Buttons from Feed Page

**Status:** Complete

## Summary
Removed the two debug UI sections from the feed page (`src/app/(feed)/page.tsx`):
- Ingest News from External API button
- Manual News API Sync button

These were only for development/testing and are no longer needed in production. The rest of the feed and login/register prompt remain unchanged.

## Implementation
- Deleted the state and handlers for debug buttons.
- Removed the two debug `<div>` sections containing the buttons and their result/error displays.
- No changes to the main feed, loading, error, or login/register UI.

## Next Steps
- Confirm the feed page displays as expected without the debug sections.
- Continue UI/UX polish and feature development as planned. 