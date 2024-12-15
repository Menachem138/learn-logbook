# YouTube Integration Test Plan

## URL Validation Tests
1. Valid URLs:
   - Standard: https://www.youtube.com/watch?v=dQw4w9WgXcQ
   - Short: https://youtu.be/dQw4w9WgXcQ

2. Invalid URLs:
   - Malformed: https://youtube.com/invalid
   - Wrong domain: https://notyoutube.com/watch?v=123
   - Empty URL: ""

## UI Verification
1. Library Title:
   - Should show "ספריית סרטוני YouTube"
   - Font size and weight should match screenshot

2. Video Cards:
   - Thumbnail should load correctly
   - Title should appear below thumbnail
   - Hover effect should show play button
   - Aspect ratio should match YouTube thumbnails

3. Video Playback:
   - Click should open modal
   - Video should autoplay in modal
   - Close button should work
   - Video should stop on modal close

## Error Handling
1. Test error toast messages:
   - Invalid URL should show: "כתובת URL לא חוקית של YouTube"
   - Toast should use destructive variant

## Integration Tests
1. Add new video:
   - Fill form with YouTube URL
   - Verify card appears in library
   - Check thumbnail loads
   - Test playback

2. Update existing video:
   - Edit URL
   - Verify thumbnail updates
   - Verify playback works

3. Delete video:
   - Remove video
   - Verify card removed
   - Check library updates
