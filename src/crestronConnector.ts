import { Socket } from 'net';
import { HomebridgePlatform } from './platform';

export class CrestronConnector {
  platform: HomebridgePlatform;
  crestronConnector: Socket;
  port: number;
  host: string;
  private dataBuffer = '';

  constructor(port: number, host: string, platform: HomebridgePlatform) {
    this.platform = platform;
    this.crestronConnector = new Socket();
    this.port = port;
    this.host = host;

    if (this.host && this.host !== '') {
      this.setupEventHandlers();
      this.connectToHost();
    } else {
      this.platform.log.error('Invalid host configuration');
    }
  }

  private setupEventHandlers() {
    this.crestronConnector.on('error', this.connErrorEvent.bind(this));
    this.crestronConnector.on('timeout', this.connTimeOutEvent.bind(this));
    this.crestronConnector.on('connect', this.connectedEvent.bind(this));
    this.crestronConnector.on('data', this.dataEvent.bind(this));
    this.crestronConnector.on('end', this.disconnectedEvent.bind(this));
    this.crestronConnector.on('close', this.disconnectedEvent.bind(this));
  }

  connectToHost() {
    if (this.crestronConnector) {
      this.platform.log.info(`Connecting to ${this.host}:${this.port}`);
      this.crestronConnector.connect(this.port, this.host);
    }
  }

  connErrorEvent(error: Error) {
    this.platform.log.error('Connection error:', error.message);
    if (this.crestronConnector) {
      this.crestronConnector.destroy();
    }
  }

  connTimeOutEvent() {
    this.platform.log.warn('Connection timeout');
    this.crestronConnector.destroy();
  }

  dataEvent(data: Buffer): void {
    if (this.platform) {
      // Convert buffer to string and add to buffer
      this.dataBuffer += data.toString();
      
      // Try to parse complete JSON messages
      this.parseJsonMessages();
    }
  }

  private parseJsonMessages() {
    // Look for complete JSON objects (assuming they are separated by newlines or are complete)
    let newlineIndex = this.dataBuffer.indexOf('\n');
    
    while (newlineIndex !== -1) {
      const message = this.dataBuffer.substring(0, newlineIndex).trim();
      this.dataBuffer = this.dataBuffer.substring(newlineIndex + 1);
      
      if (message) {
        this.platform.handleData(message);
      }
      
      newlineIndex = this.dataBuffer.indexOf('\n');
    }
    
    // If no newlines, try to parse as a single JSON object
    if (this.dataBuffer.trim() && !this.dataBuffer.includes('\n')) {
      try {
        JSON.parse(this.dataBuffer);
        // If we can parse it, it's a complete message
        this.platform.handleData(this.dataBuffer);
        this.dataBuffer = '';
      } catch (error) {
        // Incomplete JSON, keep it in buffer
        this.platform.log.debug('Incomplete JSON received, buffering...');
      }
    }
  }

  connectedEvent() {
    this.platform.log.info('Connected to Crestron processor');
  }

  disconnectedEvent() {
    this.platform.log.warn('Disconnected from Crestron processor');
    this.platform.log.info(`Reconnecting to ${this.host}:${this.port} in 5 seconds...`);
    setTimeout(() => {
      this.connectToHost();
    }, 5000);
  }

  writeData(data: string) {
    if (this.crestronConnector && !this.crestronConnector.destroyed) {
      // Add newline to ensure message separation
      const message = data + '\n';
      this.crestronConnector.write(message);
      this.platform.log.debug('Sent to Crestron:', data);
    } else {
      this.platform.log.error('Cannot send data: connection not available');
    }
  }

  disconnect() {
    if (this.crestronConnector) {
      this.crestronConnector.destroy();
    }
  }
}