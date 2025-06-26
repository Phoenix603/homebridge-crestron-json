<p align="center">

<img src="https://github.com/homebridge/branding/raw/latest/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>

<span align="center">

# Homebridge Platform Plugin Template

</span>

> [!IMPORTANT] > **Homebridge v2.0 Information**
>
> This template currently has a
>
> - `package.json -> engines.homebridge` value of `"^1.8.0 || ^2.0.0-beta.0"`
> - `package.json -> devDependencies.homebridge` value of `"^2.0.0-beta.0"`
>
> This is to ensure that your plugin will build and run on both Homebridge v1 and v2.
>
> Once Homebridge v2.0 has been released, you can remove the `-beta.0` in both places.

---

This is a template Homebridge dynamic platform plugin and can be used as a base to help you get started developing your own plugin.

This template should be used in conjunction with the [developer documentation](https://developers.homebridge.io/). A full list of all supported service types, and their characteristics is available on this site.

### Clone As Template

Click the link below to create a new GitHub Repository using this template, or click the _Use This Template_ button above.

<span align="center">

### [Create New Repository From Template](https://github.com/homebridge/homebridge-plugin-template/generate)

</span>

### Setup Development Environment

To develop Homebridge plugins you must have Node.js 18 or later installed, and a modern code editor such as [VS Code](https://code.visualstudio.com/). This plugin template uses [TypeScript](https://www.typescriptlang.org/) to make development easier and comes with pre-configured settings for [VS Code](https://code.visualstudio.com/) and ESLint. If you are using VS Code install these extensions:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

### Install Development Dependencies

Using a terminal, navigate to the project folder and run this command to install the development dependencies:

```shell
npm install
```

### Update package.json

Open the [`package.json`](./package.json) and change the following attributes:

- `name` - this should be prefixed with `homebridge-` or `@username/homebridge-`, is case-sensitive, and contains no spaces nor special characters apart from a dash `-`
- `displayName` - this is the "nice" name displayed in the Homebridge UI
- `homepage` - link to your GitHub repo's `README.md`
- `repository.url` - link to your GitHub repo
- `bugs.url` - link to your GitHub repo issues page

When you are ready to publish the plugin you should set `private` to false, or remove the attribute entirely.

### Update Plugin Defaults

Open the [`src/settings.ts`](./src/settings.ts) file and change the default values:

- `PLATFORM_NAME` - Set this to be the name of your platform. This is the name of the platform that users will use to register the plugin in the Homebridge `config.json`.
- `PLUGIN_NAME` - Set this to be the same name you set in the [`package.json`](./package.json) file.

Open the [`config.schema.json`](./config.schema.json) file and change the following attribute:

- `pluginAlias` - set this to match the `PLATFORM_NAME` you defined in the previous step.

See the [Homebridge API docs](https://developers.homebridge.io/#/config-schema#default-values) for more details on the other attributes you can set in the `config.schema.json` file.

### Build Plugin

TypeScript needs to be compiled into JavaScript before it can run. The following command will compile the contents of your [`src`](./src) directory and put the resulting code into the `dist` folder.

```shell
npm run build
```

### Link To Homebridge

Run this command so your global installation of Homebridge can discover the plugin in your development environment:

```shell
npm link
```

You can now start Homebridge, use the `-D` flag, so you can see debug log messages in your plugin:

```shell
homebridge -D
```

### Watch For Changes and Build Automatically

If you want to have your code compile automatically as you make changes, and restart Homebridge automatically between changes, you first need to add your plugin as a platform in `./test/hbConfig/config.json`:

```
{
...
    "platforms": [
        {
            "name": "Config",
            "port": 8581,
            "platform": "config"
        },
        {
            "name": "<PLUGIN_NAME>",
            //... any other options, as listed in config.schema.json ...
            "platform": "Crestron Bridge"
        }
    ]
}
```

and then you can run:

```shell
npm run watch
```

This will launch an instance of Homebridge in debug mode which will restart every time you make a change to the source code. It will load the config stored in the default location under `~/.homebridge`. You may need to stop other running instances of Homebridge while using this command to prevent conflicts. You can adjust the Homebridge startup command in the [`nodemon.json`](./nodemon.json) file.

### Customise Plugin

You can now start customising the plugin template to suit your requirements.

- [`src/platform.ts`](./src/platform.ts) - this is where your device setup and discovery should go.
- [`src/platformAccessory.ts`](./src/platformAccessory.ts) - this is where your accessory control logic should go, you can rename or create multiple instances of this file for each accessory type you need to implement as part of your platform plugin. You can refer to the [developer documentation](https://developers.homebridge.io/) to see what characteristics you need to implement for each service type.
- [`config.schema.json`](./config.schema.json) - update the config schema to match the config you expect from the user. See the [Plugin Config Schema Documentation](https://developers.homebridge.io/#/config-schema).

### Versioning Your Plugin

Given a version number `MAJOR`.`MINOR`.`PATCH`, such as `1.4.3`, increment the:

1. **MAJOR** version when you make breaking changes to your plugin,
2. **MINOR** version when you add functionality in a backwards compatible manner, and
3. **PATCH** version when you make backwards compatible bug fixes.

You can use the `npm version` command to help you with this:

```shell
# major update / breaking changes
npm version major

# minor update / new features
npm version update

# patch / bugfixes
npm version patch
```

### Publish Package

When you are ready to publish your plugin to [npm](https://www.npmjs.com/), make sure you have removed the `private` attribute from the [`package.json`](./package.json) file then run:

```shell
npm publish
```

If you are publishing a scoped plugin, i.e. `@username/homebridge-xxx` you will need to add `--access=public` to command the first time you publish.

#### Publishing Beta Versions

You can publish _beta_ versions of your plugin for other users to test before you release it to everyone.

```shell
# create a new pre-release version (eg. 2.1.0-beta.1)
npm version prepatch --preid beta

# publish to @beta
npm publish --tag beta
```

Users can then install the _beta_ version by appending `@beta` to the install command, for example:

```shell
sudo npm install -g homebridge-example-plugin@beta
```

### Best Practices

Consider creating your plugin with the [Homebridge Verified](https://github.com/homebridge/verified) criteria in mind. This will help you to create a plugin that is easy to use and works well with Homebridge.
You can then submit your plugin to the Homebridge Verified list for review.
The most up-to-date criteria can be found [here](https://github.com/homebridge/verified#requirements).
For reference, the current criteria are:

- **General**
  - The plugin must be of type [dynamic platform](https://developers.homebridge.io/#/#dynamic-platform-template).
  - The plugin must not offer the same nor less functionality than that of any existing **verified** plugin.
- **Repo**
  - The plugin must be published to NPM and the source code available on a GitHub repository, with issues enabled.
  - A GitHub release should be created for every new version of your plugin, with release notes.
- **Environment**
  - The plugin must run on all [supported LTS versions of Node.js](https://github.com/homebridge/homebridge/wiki/How-To-Update-Node.js), at the time of writing this is Node v18, v20 and v22.
  - The plugin must successfully install and not start unless it is configured.
  - The plugin must not execute post-install scripts that modify the users' system in any way.
  - The plugin must not require the user to run Homebridge in a TTY or with non-standard startup parameters, even for initial configuration.
- **Codebase**
  - The plugin must implement the [Homebridge Plugin Settings GUI](https://developers.homebridge.io/#/config-schema).
  - The plugin must not contain any analytics or calls that enable you to track the user.
  - If the plugin needs to write files to disk (cache, keys, etc.), it must store them inside the Homebridge storage directory.
  - The plugin must not throw unhandled exceptions, the plugin must catch and log its own errors.

### Useful Links

Note these links are here for help but are not supported/verified by the Homebridge team

- [Custom Characteristics](https://github.com/homebridge/homebridge-plugin-template/issues/20)

# Crestron Bridge

A Homebridge plugin that exposes Crestron devices as HomeKit accessories, allowing you to control your Crestron system through Apple's Home app and Siri.

## Features

- **Lightbulb Control**: Control Crestron lighting devices with on/off and brightness functionality
- **Real-time Communication**: Bidirectional communication with Crestron processors via TCP/IP
- **Automatic Reconnection**: Handles network disconnections and automatically reconnects
- **JSON Protocol**: Uses JSON for structured communication with Crestron systems

## Installation

If you are running Homebridge on a Raspberry Pi or similar device, you can install this plugin using:

```bash
sudo npm install -g homebridge-crestron
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
      "port": 41794,
      "lightbulbs": [
        {
          "id": 1,
          "name": "Living Room Light"
        },
        {
          "id": 2,
          "name": "Kitchen Light"
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
| `port`       | number | No       | 41794   | TCP port for Crestron communication               |
| `lightbulbs` | array  | No       | []      | Array of lightbulb device configurations          |

### Lightbulb Device Configuration

Each lightbulb device requires:

| Option | Type   | Required | Description                                               |
| ------ | ------ | -------- | --------------------------------------------------------- |
| `id`   | number | Yes      | Unique identifier for this device in your Crestron system |
| `name` | string | Yes      | Display name for this device in HomeKit                   |

## Crestron Integration

### JSON Protocol

This plugin communicates with Crestron using JSON messages. The protocol expects the following message format:

#### Commands sent to Crestron:

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

#### Responses expected from Crestron:

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

### Crestron Programming

You'll need to set up your Crestron processor to:

1. **Listen for TCP connections** on the configured port (default: 41794)
2. **Parse incoming JSON messages** and route commands to appropriate devices
3. **Send JSON responses** when device states change
4. **Handle device state updates** and send notifications back to Homebridge

### Example Crestron SIMPL+ Module

Here's a basic example of how to handle the JSON communication in Crestron:

```simpl+
// Input: JSON string from Homebridge
// Output: Parsed device type, ID, command, and value

// Parse incoming JSON and extract fields
// Route commands to appropriate devices
// Send JSON responses when device states change
```

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
git clone https://github.com/your-username/homebridge-crestron.git
cd homebridge-crestron
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
2. Search existing [issues](https://github.com/your-username/homebridge-crestron/issues)
3. Create a new issue with detailed information about your problem

## Changelog

### 1.0.0

- Initial release
- Lightbulb accessory support
- JSON-based communication protocol
- Automatic reconnection handling
