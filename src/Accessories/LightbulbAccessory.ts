import type { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';

import type { HomebridgePlatform } from '../platform';
import EventEmitter from 'events';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class LightbulbAccessory {
  private service: Service;
  private deviceType = 'Lightbulb';
  private id: number;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private States = {
    On: false,
    Brightness: 100,
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

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this)) // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this)); // GET - bind to the `getOn` method below

    // register handlers for the Brightness Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .onSet(this.setBrightness.bind(this)) // SET - bind to the `setBrightness` method below
      .onGet(this.getBrightness.bind(this)); // GET - bind to the `getBrightness` method below
  }

  private setupEventListeners() {
    // Listen for power state changes from Crestron
    this.eventEmitter.on(`${this.deviceType}:${this.id}:power`, (value: unknown) => {
      const isOn = Boolean(value);
      this.States.On = isOn;
      this.service.updateCharacteristic(this.platform.Characteristic.On, isOn);
      this.platform.log.debug(`Received power state from Crestron: ${isOn}`);
    });

    // Listen for brightness changes from Crestron
    this.eventEmitter.on(`${this.deviceType}:${this.id}:brightness`, (value: unknown) => {
      const brightness = Number(value);
      if (!isNaN(brightness) && brightness >= 0 && brightness <= 100) {
        this.States.Brightness = brightness;
        this.service.updateCharacteristic(this.platform.Characteristic.Brightness, brightness);
        this.platform.log.debug(`Received brightness from Crestron: ${brightness}`);
      }
    });
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue) {
    this.States.On = value as boolean;

    if (this.States.On === true && this.States.Brightness === 0) {
      // If turning on but brightness is 0, set brightness to 100
      this.States.Brightness = 100;
      this.service.updateCharacteristic(this.platform.Characteristic.Brightness, this.States.Brightness);
      
      // Send both power and brightness commands to Crestron
      this.platform.sendData({
        deviceType: this.deviceType,
        id: this.id,
        command: 'power',
        value: true,
      });
      
      this.platform.sendData({
        deviceType: this.deviceType,
        id: this.id,
        command: 'brightness',
        value: this.States.Brightness,
      });
    } else if (this.States.On === false) {
      // If turning off, set brightness to 0
      this.States.Brightness = 0;
      this.service.updateCharacteristic(this.platform.Characteristic.Brightness, this.States.Brightness);
      
      // Send power off command to Crestron
      this.platform.sendData({
        deviceType: this.deviceType,
        id: this.id,
        command: 'power',
        value: false,
      });
    } else {
      // Just send power command
      this.platform.sendData({
        deviceType: this.deviceType,
        id: this.id,
        command: 'power',
        value: this.States.On,
      });
    }

    this.platform.log.debug('Set Characteristic On ->', value);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
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

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, changing the Brightness
   */
  async setBrightness(value: CharacteristicValue) {
    // implement your own code to set the brightness
    this.States.Brightness = value as number;
    
    // If brightness is set to 0, turn off the light
    if (this.States.Brightness === 0) {
      this.States.On = false;
      this.service.updateCharacteristic(this.platform.Characteristic.On, false);
    } else if (!this.States.On) {
      // If brightness is > 0 and light is off, turn it on
      this.States.On = true;
      this.service.updateCharacteristic(this.platform.Characteristic.On, true);
    }

    // Send brightness command to Crestron
    this.platform.sendData({
      deviceType: this.deviceType,
      id: this.id,
      command: 'brightness',
      value: this.States.Brightness,
    });

    this.platform.log.debug('Set Characteristic Brightness -> ', value);
  }

  /**
   * Handle the "GET" requests from HomeKit for brightness
   */
  async getBrightness(): Promise<CharacteristicValue> {
    const brightness = this.States.Brightness;
    this.platform.log.debug('Get Characteristic Brightness ->', brightness);
    return brightness;
  }
}
