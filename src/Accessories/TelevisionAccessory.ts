import type { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';
import type { HomebridgePlatform } from '../platform.js';
import EventEmitter from 'events';

export class TelevisionAccessory {
  private televisionService: Service;
  private speakerService: Service;
  private deviceType = 'Television';
  private id: number;

  private States = {
    Active: 0, // 0 = inactive, 1 = active
    ActiveIdentifier: 1, // input
    Volume: 50,
    Muted: false,
  };

  // Example input sources
  private inputSources = [
    { id: 1, name: 'HDMI 1' },
    { id: 2, name: 'HDMI 2' },
    { id: 3, name: 'Apple TV' },
  ];

  constructor(
    private readonly platform: HomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    private eventEmitter: EventEmitter,
  ) {
    this.id = accessory.context.device.id;
    this.setupEventListeners();

    // Set up accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Crestron')
      .setCharacteristic(this.platform.Characteristic.Model, 'CrestronTelevision')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default');

    // Television Service
    this.televisionService = this.accessory.getService(this.platform.Service.Television)
      || this.accessory.addService(this.platform.Service.Television);
    this.televisionService.setCharacteristic(this.platform.Characteristic.ConfiguredName, accessory.context.device.name);
    this.televisionService.setCharacteristic(
      this.platform.Characteristic.SleepDiscoveryMode,
      this.platform.Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE,
    );

    // Power (Active)
    this.televisionService.getCharacteristic(this.platform.Characteristic.Active)
      .onSet(this.setActive.bind(this))
      .onGet(this.getActive.bind(this));

    // Input selection
    this.televisionService.getCharacteristic(this.platform.Characteristic.ActiveIdentifier)
      .onSet(this.setActiveIdentifier.bind(this))
      .onGet(this.getActiveIdentifier.bind(this));

    // Remote key
    this.televisionService.getCharacteristic(this.platform.Characteristic.RemoteKey)
      .onSet(this.setRemoteKey.bind(this));

    // Add input sources
    this.inputSources.forEach((input) => {
      const inputService = this.accessory.getService(input.name)
        || this.accessory.addService(this.platform.Service.InputSource, input.name, input.id.toString());
      inputService
        .setCharacteristic(this.platform.Characteristic.Identifier, input.id)
        .setCharacteristic(this.platform.Characteristic.ConfiguredName, input.name)
        .setCharacteristic(this.platform.Characteristic.IsConfigured, this.platform.Characteristic.IsConfigured.CONFIGURED)
        .setCharacteristic(this.platform.Characteristic.InputSourceType, this.platform.Characteristic.InputSourceType.HDMI)
        .setCharacteristic(this.platform.Characteristic.CurrentVisibilityState, this.platform.Characteristic.CurrentVisibilityState.SHOWN);
      this.televisionService.addLinkedService(inputService);
    });

    // Speaker Service
    this.speakerService = this.accessory.getService(this.platform.Service.TelevisionSpeaker)
      || this.accessory.addService(this.platform.Service.TelevisionSpeaker);
    this.speakerService.setCharacteristic(this.platform.Characteristic.Active, this.platform.Characteristic.Active.ACTIVE);
    this.speakerService.setCharacteristic(this.platform.Characteristic.VolumeControlType, this.platform.Characteristic.VolumeControlType.ABSOLUTE);
    this.speakerService.getCharacteristic(this.platform.Characteristic.VolumeSelector)
      .onSet(this.setVolumeSelector.bind(this));
    this.speakerService.getCharacteristic(this.platform.Characteristic.Volume)
      .onSet(this.setVolume.bind(this))
      .onGet(this.getVolume.bind(this));
    this.speakerService.getCharacteristic(this.platform.Characteristic.Mute)
      .onSet(this.setMute.bind(this))
      .onGet(this.getMute.bind(this));
  }

  private setupEventListeners() {
    // Power
    this.eventEmitter.on(`${this.deviceType}:${this.id}:power`, (value: unknown) => {
      this.States.Active = value ? 1 : 0;
      this.televisionService.updateCharacteristic(this.platform.Characteristic.Active, this.States.Active);
    });
    // Input
    this.eventEmitter.on(`${this.deviceType}:${this.id}:input`, (value: unknown) => {
      this.States.ActiveIdentifier = Number(value);
      this.televisionService.updateCharacteristic(this.platform.Characteristic.ActiveIdentifier, this.States.ActiveIdentifier);
    });
    // Volume
    this.eventEmitter.on(`${this.deviceType}:${this.id}:volume`, (value: unknown) => {
      this.States.Volume = Number(value);
      this.speakerService.updateCharacteristic(this.platform.Characteristic.Volume, this.States.Volume);
    });
    // Mute
    this.eventEmitter.on(`${this.deviceType}:${this.id}:mute`, (value: unknown) => {
      this.States.Muted = Boolean(value);
      this.speakerService.updateCharacteristic(this.platform.Characteristic.Mute, this.States.Muted);
    });
  }

  // Power
  async setActive(value: CharacteristicValue) {
    this.States.Active = value as number;
    this.platform.sendData({
      deviceType: this.deviceType,
      id: this.id,
      command: 'power',
      value: this.States.Active === 1,
    });
  }
  async getActive(): Promise<CharacteristicValue> {
    return this.States.Active;
  }

  // Input
  async setActiveIdentifier(value: CharacteristicValue) {
    this.States.ActiveIdentifier = value as number;
    this.platform.sendData({
      deviceType: this.deviceType,
      id: this.id,
      command: 'input',
      value: this.States.ActiveIdentifier,
    });
  }
  async getActiveIdentifier(): Promise<CharacteristicValue> {
    return this.States.ActiveIdentifier;
  }

  // Remote key
  async setRemoteKey(value: CharacteristicValue) {
    this.platform.sendData({
      deviceType: this.deviceType,
      id: this.id,
      command: 'remoteKey',
      value,
    });
  }

  // Volume
  async setVolume(value: CharacteristicValue) {
    this.States.Volume = value as number;
    this.platform.sendData({
      deviceType: this.deviceType,
      id: this.id,
      command: 'volume',
      value: this.States.Volume,
    });
  }
  async getVolume(): Promise<CharacteristicValue> {
    return this.States.Volume;
  }

  // Volume selector (up/down)
  async setVolumeSelector(value: CharacteristicValue) {
    this.platform.sendData({
      deviceType: this.deviceType,
      id: this.id,
      command: 'volumeSelector',
      value, // 0 = increment, 1 = decrement
    });
  }

  // Mute
  async setMute(value: CharacteristicValue) {
    this.States.Muted = value as boolean;
    this.platform.sendData({
      deviceType: this.deviceType,
      id: this.id,
      command: 'mute',
      value: this.States.Muted,
    });
  }
  async getMute(): Promise<CharacteristicValue> {
    return this.States.Muted;
  }
} 