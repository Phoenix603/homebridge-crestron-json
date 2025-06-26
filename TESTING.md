# Testing Guide for Crestron Bridge

This guide will help you test your Crestron Bridge in different scenarios.

## Prerequisites

1. **Homebridge installed globally**

   ```bash
   sudo npm install -g homebridge
   ```

2. **Plugin built and linked**
   ```bash
   npm run build
   sudo npm link
   ```

## Testing Methods

### Method 1: Watch Mode (Recommended for Development)

This automatically rebuilds and restarts Homebridge when you make code changes:

```bash
npm run watch
```

This will:

- Build the plugin
- Link it to Homebridge
- Start Homebridge in debug mode
- Watch for file changes and restart automatically

### Method 2: Manual Testing with Mock Server

1. **Start the mock Crestron server** (in a separate terminal):

   ```bash
   node test/test-plugin.js
   ```

2. **Start Homebridge manually** (in another terminal):
   ```bash
   homebridge -D
   ```

### Method 3: Testing with Real Crestron System

1. **Configure your real Crestron processor** to:

   - Listen on TCP port 41794 (or your configured port)
   - Parse JSON messages from Homebridge
   - Send JSON responses back

2. **Update your Homebridge config** with the real Crestron IP address

3. **Start Homebridge**:
   ```bash
   homebridge -D
   ```

## Test Configuration

The plugin comes with a test configuration in `test/hbConfig/config.json`:

```json
{
  "platform": "Crestron Bridge",
  "name": "Crestron Bridge",
  "host": "localhost",
  "port": 41794,
  "lightbulbs": [
    {
      "id": 1,
      "name": "Living Room Light"
    },
    {
      "id": 2,
      "name": "Kitchen Light"
    },
    {
      "id": 3,
      "name": "Bedroom Light"
    }
  ]
}
```

## What to Test

### 1. Connection Testing

**Expected behavior:**

- Homebridge should connect to Crestron on startup
- Logs should show "Connected to Crestron processor"
- If connection fails, it should retry every 2 seconds

**Test commands:**

```bash
# Start mock server
node test/test-plugin.js

# In another terminal, start Homebridge
homebridge -D
```

### 2. Device Discovery

**Expected behavior:**

- Homebridge should discover 3 lightbulb devices
- Devices should appear in the Home app
- Device names should match the configuration

**Check logs for:**

```
Adding new accessory: Living Room Light
Adding new accessory: Kitchen Light
Adding new accessory: Bedroom Light
```

### 3. Lightbulb Control

**Test in Home app:**

1. Open the Home app
2. Find your Crestron devices
3. Try turning lights on/off
4. Try adjusting brightness

**Expected JSON messages sent to Crestron:**

```json
{"deviceType":"Lightbulb","id":1,"command":"power","value":true}
{"deviceType":"Lightbulb","id":1,"command":"brightness","value":75}
```

### 4. State Synchronization

**Test bidirectional communication:**

1. Change device state in Crestron
2. Verify Home app updates automatically
3. Change state in Home app
4. Verify Crestron receives the command

**Expected JSON responses from Crestron:**

```json
{"deviceType":"Lightbulb","id":1,"command":"power","value":true}
{"deviceType":"Lightbulb","id":1,"command":"brightness","value":75}
```

### 5. Error Handling

**Test scenarios:**

- Disconnect network cable
- Stop Crestron server
- Send malformed JSON
- Use invalid device IDs

**Expected behavior:**

- Automatic reconnection attempts
- Graceful error handling
- Informative log messages

## Debug Logs

Enable debug mode to see detailed logs:

```bash
homebridge -D
```

**Key log messages to look for:**

**Connection:**

```
Connecting to localhost:41794
Connected to Crestron processor
```

**Device operations:**

```
Sending JSON data to Crestron: {"deviceType":"Lightbulb","id":1,"command":"power","value":true}
Received JSON from Crestron: {"deviceType":"Lightbulb","id":1,"command":"power","value":true}
```

**Errors:**

```
Connection error: connect ECONNREFUSED
Reconnecting to localhost:41794 in 2 seconds...
Failed to parse JSON from Crestron: invalid json
```

## Testing Checklist

- [ ] Plugin builds without errors
- [ ] Plugin links successfully to Homebridge
- [ ] Homebridge starts without errors
- [ ] Connection to Crestron established
- [ ] Devices discovered and appear in Home app
- [ ] Turning lights on/off works
- [ ] Brightness control works
- [ ] State changes sync between Home app and Crestron
- [ ] Reconnection works after network interruption
- [ ] Error handling works for malformed data
- [ ] Logs provide useful debugging information

## Troubleshooting

### Common Issues

1. **"Plugin not found" error**

   - Run `sudo npm link` again
   - Check that the plugin name matches in config

2. **Connection refused**

   - Verify Crestron server is running
   - Check port number in configuration
   - Ensure firewall allows the connection

3. **Devices not appearing**

   - Check device IDs in configuration
   - Verify JSON format in Crestron responses
   - Check Homebridge logs for errors

4. **State not syncing**
   - Verify Crestron is sending proper JSON responses
   - Check that device IDs match
   - Ensure event listeners are working

### Getting Help

If you encounter issues:

1. Check the logs in debug mode
2. Verify your configuration
3. Test with the mock server first
4. Check the [README.md](README.md) for more details
5. Create an issue on GitHub with detailed information

## Advanced Testing

### Load Testing

Test with multiple devices and rapid state changes:

```json
{
  "lightbulbs": [
    { "id": 1, "name": "Light 1" },
    { "id": 2, "name": "Light 2" },
    { "id": 3, "name": "Light 3" },
    { "id": 4, "name": "Light 4" },
    { "id": 5, "name": "Light 5" }
  ]
}
```

### Network Testing

Test various network conditions:

- Slow connections
- Packet loss
- Intermittent connectivity
- High latency

### Integration Testing

Test with real Crestron systems:

- Different Crestron processor models
- Various network configurations
- Multiple simultaneous connections
