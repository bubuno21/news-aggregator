# Feed and Story Detail Comments Design

## Problem Statement

We encountered an issue where the feed page (`/`) was attempting to fetch comments with a non-UUID value `storyId=(feed)`, causing PostgreSQL errors since `storyId` in the database is defined as a UUID type.

## Solution Implemented

We implemented a two-part solution:

1. **Separation of Feed and Story Detail Logic**
   - Feed page (`/app/(feed)/page.tsx`) only shows story headlines and article links without comments
   - Story detail page (`/app/(story)/[clusterId]/page.tsx`) shows full story with comments, where `clusterId` is a valid UUID

2. **Robust API Validation**
   - Added UUID validation in `/api/comments/route.ts` to gracefully handle invalid UUIDs
   - If `storyId` is `(feed)` or not a valid UUID format, returns an empty comments array instead of an error
   - Maintains backward compatibility with existing code while avoiding database errors

## Implementation Details

### Comments API Validation

```typescript
// Helper function to validate UUID format
function isValidUUID(str: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// In GET function
if (storyId === '(feed)' || !isValidUUID(storyId)) {
  return NextResponse.json({ comments: [] }, { status: 200 });
}
```

## Benefits

- **Improved Error Handling**: The application gracefully handles invalid inputs
- **Clean Separation of Concerns**: 
  - Feed page: for browsing and discovery
  - Story detail page: for reading and commenting
- **Better User Experience**: No error messages or broken UI due to invalid UUIDs
- **Database Protection**: Prevents invalid queries from reaching the database

## Future Considerations

If we want to show comment previews on the feed page in the future, we should:

1. Implement a dedicated API endpoint like `/api/feed-previews` that returns the latest stories with a preview of their top comments
2. Use proper database joins or separate queries to avoid the UUID validation issues

This approach maintains data integrity while providing flexibility for future feature development. 