# Crestron Bridge

A Homebridge plugin that exposes Crestron devices as HomeKit accessories, allowing you to control your Crestron system through Apple's Home app and Siri.

## Features

- **Lightbulb Control**: Control Crestron lighting devices with on/off and brightness functionality
- **Switch Control**: Control Crestron switch devices with on/off functionality
- **Real-time Communication**: Bidirectional communication with Crestron processors via TCP/IP
- **Automatic Reconnection**: Handles network disconnections and automatically reconnects
- **JSON Protocol**: Uses JSON for structured communication with Crestron systems

## Installation

If you are running Homebridge on a Raspberry Pi or similar device, you can install this plugin using:

```bash
sudo npm install -g homebridge-crestron-json
```

## Configuration

Add the following to your Homebridge `config.json`:

```json
{
  "platforms": [
    {
      "platform": "Crestron Bridge",
      "name": "Crestron Bridge",
      "host": "192.168.1.100",
      "port": 50005,
      "lightbulbs": [
        {
          "id": 1,
          "name": "Living Room Light"
        },
        {
          "id": 2,
          "name": "Kitchen Light"
        }
      ],
      "switches": [
        {
          "id": 1,
          "name": "Living Room Fan"
        },
        {
          "id": 2,
          "name": "Kitchen Outlet"
        }
      ]
    }
  ]
}
```

### Configuration Options

| Option       | Type   | Required | Default | Description                                       |
| ------------ | ------ | -------- | ------- | ------------------------------------------------- |
| `platform`   | string | Yes      | -       | Must be "Crestron Bridge"                         |
| `name`       | string | Yes      | -       | Display name for the platform (Crestron Bridge)   |
| `host`       | string | Yes      | -       | IP address or hostname of your Crestron processor |
| `port`       | number | No       | 50005   | TCP port for Crestron communication               |
| `lightbulbs` | array  | No       | []      | Array of lightbulb device configurations          |
| `switches`   | array  | No       | []      | Array of switch device configurations             |

### Lightbulb Device Configuration

Each lightbulb device requires:

| Option | Type   | Required | Description                                               |
| ------ | ------ | -------- | --------------------------------------------------------- |
| `id`   | number | Yes      | Unique identifier for this device in your Crestron system |
| `name` | string | Yes      | Display name for this device in HomeKit                   |

### Switch Device Configuration

Each switch device requires:

| Option | Type   | Required | Description                                               |
| ------ | ------ | -------- | --------------------------------------------------------- |
| `id`   | number | Yes      | Unique identifier for this device in your Crestron system |
| `name` | string | Yes      | Display name for this device in HomeKit                   |

## Crestron Integration

### JSON Protocol

This plugin communicates with Crestron using JSON messages. The protocol expects the following message format:

#### Commands sent to Crestron:

**Lightbulb commands:**

```json
{
  "deviceType": "Lightbulb",
  "id": 1,
  "command": "power",
  "value": true
}
```

```json
{
  "deviceType": "Lightbulb",
  "id": 1,
  "command": "brightness",
  "value": 75
}
```

**Switch commands:**

```json
{
  "deviceType": "Switch",
  "id": 1,
  "command": "power",
  "value": true
}
```

#### Responses expected from Crestron:

**Lightbulb responses:**

```json
{
  "deviceType": "Lightbulb",
  "id": 1,
  "command": "power",
  "value": true
}
```

```json
{
  "deviceType": "Lightbulb",
  "id": 1,
  "command": "brightness",
  "value": 75
}
```

**Switch responses:**

```json
{
  "deviceType": "Switch",
  "id": 1,
  "command": "power",
  "value": true
}
```

### Crestron Programming

You'll need to set up your Crestron processor to:

1. **Listen for TCP connections** on the configured port (default: 50005)
2. **Parse incoming JSON messages** and route commands to appropriate devices
3. **Send JSON responses** when device states change
4. **Handle device state updates** and send notifications back to Homebridge

## Troubleshooting

### Connection Issues

- **Check IP Address**: Ensure the `host` field contains the correct IP address of your Crestron processor
- **Verify Port**: Confirm the port number matches your Crestron configuration
- **Network Connectivity**: Test network connectivity between Homebridge and Crestron
- **Firewall**: Ensure the port is not blocked by firewalls

### Device Not Responding

- **Check Device IDs**: Verify that device IDs in the configuration match those in your Crestron system
- **JSON Format**: Ensure Crestron is sending properly formatted JSON responses
- **Logs**: Check Homebridge logs for error messages or malformed JSON

### Debug Mode

Run Homebridge in debug mode to see detailed logs:

```bash
homebridge -D
```

Look for messages related to:

- Connection status
- JSON parsing
- Device state changes
- Error messages

## Development

### Building from Source

```bash
git clone https://github.com/your-username/homebridge-crestron-json.git
cd homebridge-crestron-json
npm install
npm run build
npm link
```

### Testing

```bash
npm run watch
```

This will start Homebridge in watch mode, automatically rebuilding and restarting when you make changes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#troubleshooting)
2. Search existing [issues](https://github.com/your-username/homebridge-crestron-json/issues)
3. Create a new issue with detailed information about your problem

## Changelog

### 1.0.0

- Initial release
- Lightbulb accessory support
- Switch accessory support
- JSON-based communication protocol
- Automatic reconnection handling
