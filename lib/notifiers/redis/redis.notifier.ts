import { v7 } from 'uuid';
import Redis from 'ioredis';
import { Subject, Observable } from 'rxjs';
import { Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigChangeNotification, AppStatesNotifier } from '../../interfaces';

export class RedisNotifier implements AppStatesNotifier , OnApplicationBootstrap, OnApplicationShutdown {
  private readonly _uid: string;
  private readonly _logger: Logger = new Logger(RedisNotifier.name);

  private _publisher: Redis;
  private _subscriber: Redis;
  private readonly channel: string;
  private _changes$ = new Subject<ConfigChangeNotification>();

   constructor(
    channel: string,
    publisher: Redis,
    subscriber: Redis,
  ) {
    this._uid = v7()
      this.channel = channel;
    this._publisher = publisher;
    this._subscriber = subscriber;
  }
  private _init(): void {
    this._subscriber.subscribe(this.channel).catch(error => {
      this._logger.error('Failed to subscribe to config changes:', error);
    });
    this._subscriber.on('message', (channel: string, message: string) => {
      if (channel === this.channel) {
        try {
          const event = JSON.parse(message) as ConfigChangeNotification;
          if(event.nodeId !== this._uid) {
            this._logger.log(`New sync event from node: ${event.nodeId} at ${new Date(event.timestamp).toISOString()}`);
            this._changes$.next(event);
          }
        } catch (error) {
          this._logger.error('Failed to parse config change notification:', error);
        }
      }
    });
  }

  public async notify(event: ConfigChangeNotification): Promise<number> {
    return this._publisher.publish(
      this.channel,
      JSON.stringify({
          type: 'out_of_sync',
          timestamp: event.timestamp,
          nodeId: event.nodeId || this._uid,
          extra: event.extra || {},
        },
      ),
    );
  }

  public get changes$(): Observable<ConfigChangeNotification> {
    return this._changes$.asObservable();
  }

  public async disconnect(): Promise<void> {
    this._changes$.complete();
    Promise.all([
      this._subscriber.quit(),
      this._publisher.quit(),
    ]).catch((ex: Error) => this._logger.error("Can not quit", ex));
  }

   onApplicationBootstrap() {
      this._init();
  }

  async onApplicationShutdown(signal?: string) {
    this._logger.debug(`Application shutdown: signal=${signal}`);
    await this.disconnect();
  }
}


