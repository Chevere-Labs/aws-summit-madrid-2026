# Fetch Bogota Sessions

Scripts to capture and transform AWS Summit Bogotá 2026 session data into `sessions.json`.

## Prerequisites

- [mitmproxy](https://mitmproxy.org/) installed (`brew install mitmproxy`)
- AWS Events mobile app installed on your phone
- Phone and computer on the same network

## Step 1: Capture API responses with mitmproxy

### Start the proxy

```bash
mitmproxy -p 8080
```

### Configure your phone

1. Go to **Settings > Wi-Fi** on your phone
2. Tap the `(i)` icon next to your connected network
3. Scroll to **HTTP Proxy** > **Manual**
4. Set:
   - **Server**: Your computer's IP (run `ifconfig | grep "inet " | grep -v 127.0.0.1` to find it)
   - **Port**: `8080`
5. Save

### Install the mitmproxy CA certificate

1. Open Safari on your phone and visit `http://mitm.it`
2. Tap the **Apple** icon to download the certificate
3. Go to **Settings > General > VPN & Device Management**
4. Tap the downloaded certificate and install it
5. Go to **Settings > General > About > Certificate Trust Settings**
6. Enable trust for the mitmproxy certificate

### Capture the sessions

1. Open the **AWS Events** app
2. Navigate to the **Bogotá** event
3. Open the **Sessions** catalog and scroll through the list to trigger API calls
4. In mitmproxy, you'll see requests to `api.us-east-1.prod.events.aws.a2z.com`

### Find the GraphQL request

In mitmproxy, filter for the session endpoint:

```
~u attendee/graphql
```

This will show the `ListSessions` GraphQL mutation. Select it and view the response body.

### Export the response

**Option A — Save from mitmproxy UI:**
1. Select the flow with the GraphQL response
2. Press `e` to export, choose `response.body`
3. Save as `bogota-sessions.json`

**Option B — Save programmatically:**
```bash
mitmdump -p 8080 -w capture.mitm --set flow_detail=3
# After capturing, filter and save:
mitmdump -r capture.mitm --set flow_detail=3 -q \
  --filter "~u attendee/graphql" \
  -w bogota-filtered.mitm
```

Then extract the response body using the transformation script's `--help` for guidance.

**Option C — Quick command line (recommended):**

Start capture in headless mode, then stop with Ctrl+C after browsing sessions:

```bash
mitmdump -p 8080 -w bogota-capture.mitm
```

Then extract the JSON response body from the capture file.

## Step 2: Transform to sessions.json

Once you have the raw GraphQL response as JSON (e.g., `bogota-sessions.json`):

```bash
cd summit-planner
node scripts/fetch-sessions.mjs bogota-sessions.json
```

### Options

```bash
# Override timezone and date
node scripts/fetch-sessions.mjs bogota-sessions.json --timezone "America/Bogota" --date "2026-07-30"

# Custom output path
node scripts/fetch-sessions.mjs bogota-sessions.json --output src/data/sessions.json

# Filter by eventId (if response contains multiple events)
node scripts/fetch-sessions.mjs bogota-sessions.json --event-id "some-uuid-here"

# Show help
node scripts/fetch-sessions.mjs --help
```

### Speaker data

The base `ListSessions` GraphQL query does **not** include speaker/presenter data. If your capture includes a separate speakers endpoint, you can extend the script. Otherwise, speakers will be empty arrays — add them manually or via a second mitmproxy capture of the session detail endpoint.

## Step 3: Verify

```bash
npm run dev    # Check the app loads all Bogota sessions
npm run build  # Verify no TypeScript errors
```
