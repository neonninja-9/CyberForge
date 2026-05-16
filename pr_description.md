🧪 Add tests for frontend API client

🎯 **What:** Added tests for the frontend API client module (`frontend/src/lib/api.js`) which lacked test coverage for its `fetch` interactions. Added `vitest` as a dev dependency to power the test suite.

📊 **Coverage:** Covered success paths (GET and POST requests, checking appropriate headers, methods, and payload conversion) and all error conditions (HTTP errors with JSON detail, invalid JSON parsing failures, and empty object errors).

✨ **Result:** Improved test coverage for the frontend's networking layer, creating a reliable test suite for API client configurations and error handling logic, ensuring regressions are caught early.
