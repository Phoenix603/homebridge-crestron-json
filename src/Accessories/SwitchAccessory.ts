import type { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';

import type { HomebridgePlatform } from '../platform.js';
import EventEmitter from 'events';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class SwitchAccessory {
  private service: Service;
  private deviceType = 'Switch';
  private id: number;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private States = {
    On: false,
  };

  constructor(
    private readonly platform: HomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    private eventEmitter: EventEmitter,
  ) {
    this.id = accessory.context.device.id;
    
    // Set up event listeners for Crestron responses
    this.setupEventListeners();
    
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Crestron')
      .setCharacteristic(this.platform.Characteristic.Model, 'Crestron' + this.deviceType)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default');

    // get the Switch service if it exists, otherwise create a new Switch service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Switch

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this)) // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this)); // GET - bind to the `getOn` method below
  }

  private setupEventListeners() {
    // Listen for power state changes from Crestron
    this.eventEmitter.on(`${this.deviceType}:${this.id}:power`, (value: unknown) => {
      const isOn = Boolean(value);
      this.States.On = isOn;
      this.service.updateCharacteristic(this.platform.Characteristic.On, isOn);
      this.platform.log.debug(`Received power state from Crestron: ${isOn}`);
    });
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Switch.
   */
  async setOn(value: CharacteristicValue) {
    this.States.On = value as boolean;

    // Send power command to Crestron
    this.platform.sendData({
      deviceType: this.deviceType,
      id: this.id,
      command: 'power',
      value: this.States.On,
    });

    this.platform.log.debug('Set Characteristic On ->', value);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Switch is on.
   *
   * GET requests should return as fast as possible. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.
   * In this case, you may decide not to implement `onGet` handlers, which may speed up
   * the responsiveness of your device in the Home app.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  async getOn(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    const isOn = this.States.On;

    this.platform.log.debug('Get Characteristic On ->', isOn);

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return isOn;
  }
} 