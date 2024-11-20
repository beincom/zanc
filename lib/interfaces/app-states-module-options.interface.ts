import { RedisOptions } from 'ioredis';
import { ModuleMetadata, Provider, Type } from '@nestjs/common';

export type AppStatesControllerOptions =  {
  secretKey: string;
  secretKeyHeader?: string;
  basePath?: string;
  fetch?: string;
  update?: string;
}

export type AppStatesModuleOptions = {
 notifier: {
   channel: string;
   redisOptions: RedisOptions;
 }
};


export interface AppStatesOptionsFactory {
  createAppStatesOptions(
  ): Promise<AppStatesModuleOptions> | AppStatesModuleOptions;
}

export interface AppStatesModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  name:string;
  controllerOptions: AppStatesControllerOptions;
  useExisting?: Type<AppStatesOptionsFactory>;
  useClass?: Type<AppStatesOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<AppStatesModuleOptions> | AppStatesModuleOptions;
  inject?: any[];
  extraProviders?: Provider[];
}
