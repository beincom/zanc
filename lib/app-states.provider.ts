import { AppStatesModuleAsyncOptions, AppStatesOptionsFactory } from './interfaces';
import { Provider, Type } from '@nestjs/common';
import { APP_STATES_MODULE_OPTIONS } from './app-states.constants';

 function createAsyncOptionsProvider(
  options: AppStatesModuleAsyncOptions,
): Provider {
  if (options.useFactory) {
    return {
      provide: APP_STATES_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }
  const inject = [
    (options.useClass || options.useExisting) as Type<AppStatesOptionsFactory>,
  ];
  return {
    provide: APP_STATES_MODULE_OPTIONS,
    useFactory: async (optionsFactory: AppStatesOptionsFactory) =>
      await optionsFactory.createAppStatesOptions(),
    inject,
  };
}

export function createAsyncProviders(
  options: AppStatesModuleAsyncOptions,
): Provider[] {
  if (options.useExisting || options.useFactory) {
    return [createAsyncOptionsProvider(options)];
  }
  const useClass = options.useClass as Type<AppStatesOptionsFactory>;
  return [
    createAsyncOptionsProvider(options),
    {
      provide: useClass,
      useClass,
    },
  ];
}
