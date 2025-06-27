import type { API, Characteristic, DynamicPlatformPlugin, Logging, PlatformAccessory, PlatformConfig, Service } from 'homebridge';
import { EventEmitter } from 'events';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings';

import { LightbulbAccessory } from './Accessories/LightbulbAccessory';
import { SwitchAccessory } from './Accessories/SwitchAccessory';
import { TelevisionAccessory } from './Accessories/TelevisionAccessory';
import { CrestronConnector } from './crestronConnector';

interface DeviceConfig {
  id: number;
  name: string;
  [key: string]: unknown;
}

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class HomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service;
  public readonly Characteristic: typeof Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: Map<string, PlatformAccessory> = new Map();
  public readonly discoveredCacheUUIDs: string[] = [];

  private crestronConnector!: CrestronConnector;
  eventEmitter: EventEmitter = new EventEmitter();

  constructor(
    public readonly log: Logging,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.Service = api.hap.Service;
    this.Characteristic = api.hap.Characteristic;

    // Initialize Crestron connector
    const host = this.config.host || 'localhost';
    const port = this.config.port || 50005;
    this.crestronConnector = new CrestronConnector(port, host, this);

    // This is only required when using Custom Services and Characteristics not support by HomeKit
    this.log.debug('Finished initializing platform:', this.config.name);

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      // run the method to discover / register your devices as accessories
      this.discoverDevices();
    });
  }

  handleData(data: string) {
    try {
      const obj = JSON.parse(data);
      if (!obj || typeof obj !== 'object') {
        this.log.warn('Received non-object JSON from Crestron:', obj);
        return;
      }
      const { deviceType, id, command, value } = obj;
      if (!deviceType || typeof id === 'undefined' || !command) {
        this.log.warn('Malformed JSON object from Crestron:', obj);
        return;
      }
      this.log.debug('Received JSON from Crestron:', obj);
      const emitMsg = `${deviceType}:${id}:${command}`;
      this.eventEmitter.emit(emitMsg, value);
    } catch (error) {
      this.log.error('Failed to parse JSON from Crestron:', data, error);
    }
  }

  sendData(obj: Record<string, unknown>) {
    this.log.debug('Sending JSON data to Crestron:', obj);
    const jsonString = JSON.stringify(obj);
    this.crestronConnector.writeData(jsonString);
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to set up event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    // add the restored accessory to the accessories cache, so we can track if it has already been registered
    this.accessories.set(accessory.UUID, accessory);
  }

  /**
   * This is an example method showing how to register discovered accessories.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */
  discoverDevices() {
    // Register lightbulb devices
    const configLightbulbs = this.config.lightbulbs || [];
    this.registerDevices(configLightbulbs, 'Lightbulb');

    // Register switch devices
    const configSwitches = this.config.switches || [];
    this.registerDevices(configSwitches, 'Switch');

    // Register television devices
    const configTelevisions = this.config.televisions || [];
    this.registerDevices(configTelevisions, 'Television');

    // Clean up accessories that are no longer present
    this.cleanupRemovedAccessories();
  }

  registerDevices(configDevices: DeviceConfig[], deviceType: string) {
    if (!configDevices || configDevices.length === 0) {
      this.log.info(`No ${deviceType} devices configured`);
      return;
    }

    for (const device of configDevices) {
      if (!device.id || !device.name) {
        this.log.warn(`Skipping ${deviceType} device with missing id or name:`, device);
        continue;
      }

      // generate a unique id for the accessory this should be generated from
      // something globally unique, but constant, for example, the device serial
      const uuid = this.api.hap.uuid.generate(deviceType + device.id.toString());

      // see if an accessory with the same uuid has already been registered and restored from
      // the cached devices we stored in the `configureAccessory` method above
      const existingAccessory = this.accessories.get(uuid);

      if (existingAccessory) {
        // the accessory already exists
        this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

        // update the accessory context with current device data
        existingAccessory.context.device = device;
        existingAccessory.displayName = device.name;

        // create the accessory handler for the restored accessory
        switch (deviceType) {
        case 'Lightbulb':
          new LightbulbAccessory(this, existingAccessory, this.eventEmitter);
          break;
        case 'Switch':
          new SwitchAccessory(this, existingAccessory, this.eventEmitter);
          break;
        case 'Television':
          new TelevisionAccessory(this, existingAccessory, this.eventEmitter);
          break;
        default:
          this.log.warn(`Unknown device type: ${deviceType}`);
        }
      } else {
        // the accessory does not yet exist, so we need to create it
        this.log.info('Adding new accessory:', device.name);

        // create a new accessory
        const accessory = new this.api.platformAccessory(device.name, uuid);

        // store a copy of the device object in the `accessory.context`
        // the `context` property can be used to store any data about the accessory you may need
        accessory.context.device = device;

        // create the accessory handler for the newly create accessory
        switch (deviceType) {
        case 'Lightbulb':
          new LightbulbAccessory(this, accessory, this.eventEmitter);
          break;
        case 'Switch':
          new SwitchAccessory(this, accessory, this.eventEmitter);
          break;
        case 'Television':
          new TelevisionAccessory(this, accessory, this.eventEmitter);
          break;
        default:
          this.log.warn(`Unknown device type: ${deviceType}`);
          continue;
        }

        // link the accessory to your platform
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }

      // push into discoveredCacheUUIDs
      this.discoveredCacheUUIDs.push(uuid);
    }
  }

  cleanupRemovedAccessories() {
    // you can also deal with accessories from the cache which are no longer present by removing them from Homebridge
    // for example, if your plugin logs into a cloud account to retrieve a device list, and a user has previously removed a device
    // from this cloud account, then this device will no longer be present in the device list but will still be in the Homebridge cache
    for (const [uuid, accessory] of this.accessories) {
      if (!this.discoveredCacheUUIDs.includes(uuid)) {
        this.log.info('Removing existing accessory from cache:', accessory.displayName);
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  }
}
