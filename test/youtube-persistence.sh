#!/bin/bash

echo "YouTube Video Persistence Test Plan"
echo "================================="
echo "1. Testing video persistence after refresh"
echo "2. Testing auth state management"
echo "3. Testing video reappearance behavior"
echo ""
echo "Prerequisites:"
echo "- Dev server running on http://localhost:8080"
echo "- User authenticated"
echo "- At least one video added to library"
echo ""
echo "Test Steps:"
echo "1. Open browser and navigate to YouTube library"
echo "2. Verify initial video load"
echo "3. Refresh page"
echo "4. Verify videos persist"
echo "5. Add new video"
echo "6. Verify all videos visible"
echo "7. Refresh again"
echo "8. Verify persistence"
echo ""
echo "Expected Results:"
echo "- Videos should persist after refresh"
echo "- No need to add new video to see existing ones"
echo "- Auth state should be maintained"
echo ""
echo "Press Enter to start testing..."
read

# Start browser tests
echo "Opening browser..."
curl -s http://localhost:8080 > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ Dev server accessible"
else
    echo "✗ Error: Dev server not responding"
    exit 1
fi
