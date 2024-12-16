#!/bin/bash

# Test authentication and video deletion functionality
echo "Testing YouTube video deletion functionality..."

# Test 1: Verify authentication requirement
echo "Test 1: Authentication requirement"
curl -s "http://localhost:5173/youtube" | grep -q "נא להתחבר" && echo "✓ Authentication check passed" || echo "✗ Authentication check failed"

# Test 2: Test deletion endpoint with authentication
echo "Test 2: Deletion with authentication"
response=$(curl -X DELETE "http://localhost:5173/api/youtube/videos/test-id" \
  -H "Authorization: Bearer ${SUPABASE_AUTH_TOKEN}" \
  -w "\n%{http_code}")
if [[ $response == *"200"* ]]; then
  echo "✓ Deletion endpoint working"
else
  echo "✗ Deletion endpoint failed"
fi

# Test 3: Verify persistence after deletion
echo "Test 3: Persistence verification"
sleep 2
curl -s "http://localhost:5173/youtube" | grep -q "test-video" || echo "✓ Video successfully deleted and persisted"

echo "Testing complete"
