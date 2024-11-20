import { v7 } from 'uuid';
import { DynamicModule, Inject, Module, OnModuleInit, Provider, Type } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  APP_STATES_LOADER_TOKEN,
  APP_STATES_MODULE_ID,
  APP_STATES_MODULE_OPTIONS,
  APP_STATES_NOTIFIER_TOKEN,
} from './app-states.constants';
import {
  AppStatesLoader,
  AppStatesModuleAsyncOptions,
  AppStatesModuleOptions, AppStatesNotifier,
} from './interfaces';

import { RedisNotifier } from './notifiers/redis';
import { AppStatesModel, MongoLoader } from './loaders/mongo';
import { createControllerFactory, createRedisClient } from './utils';
import { AppStatesService } from './app-states.service';
import { createAsyncProviders } from './app-states.provider';


@Module({
  imports: [
    MongooseModule.forFeature([AppStatesModel]),
  ],
  providers: [AppStatesService],
  exports:[AppStatesService]
})
export class AppStatesModule implements OnModuleInit{

  static async forRootAsync(
    options: AppStatesModuleAsyncOptions
  ): Promise<DynamicModule> {
    const asyncProviders = createAsyncProviders(options);

    const notifierProvider = {
      provide: APP_STATES_NOTIFIER_TOKEN,
      useFactory: async (appStatesOptions: AppStatesModuleOptions): Promise<AppStatesNotifier> => {
        const {notifier} = appStatesOptions;
        const {publisher, subscriber} = await createRedisClient(notifier.redisOptions);
       return new RedisNotifier(options.name + notifier.channel,publisher,subscriber);
      },
      inject: [APP_STATES_MODULE_OPTIONS],
    };

    const loaderProvider = {
      imports:[MongooseModule],
      provide: APP_STATES_LOADER_TOKEN,
      useClass: MongoLoader,
    };

    const providers = [
      ...asyncProviders,
      notifierProvider,
      loaderProvider,
      {
        provide: APP_STATES_MODULE_ID,
        useValue: v7(),
      },
      ...(options.extraProviders || []),
    ];

    const exports: Array<Provider> = [
      notifierProvider,
      loaderProvider,
    ];


    return {
      global: true,
      module: AppStatesModule,
      imports: options.imports,
      controllers:[createControllerFactory(options.controllerOptions)],
      providers,
      exports,
    };
  }


  constructor(
    @Inject(APP_STATES_LOADER_TOKEN) private readonly _loader: AppStatesLoader,
    @Inject(APP_STATES_NOTIFIER_TOKEN) private readonly _notifier: AppStatesNotifier,
    private readonly _appStatesService: AppStatesService,
  ) {}

  private async _sync() {
    this._appStatesService.clean();
    const states = await this._loader.fetch();
    this._appStatesService.init(states);
  }

  async onModuleInit() {
    this._notifier.changes$.subscribe({
      next: async (event) => {
        return this._sync();
      }
    })
    await this._sync();
  }
}
