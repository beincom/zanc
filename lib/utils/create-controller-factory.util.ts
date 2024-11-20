import { addedDiff, deletedDiff, updatedDiff } from 'deep-object-diff';
import { Body, Controller, Get, Inject, Post, Headers, ForbiddenException } from '@nestjs/common';
import { APP_STATES_LOADER_TOKEN, APP_STATES_NOTIFIER_TOKEN } from '../app-states.constants';
import { AppStatesControllerOptions, AppStatesLoader, AppStatesNotifier } from '../interfaces';

export const createControllerFactory = (options: AppStatesControllerOptions) => {
  const {
    secretKey,
    secretKeyHeader="x-secret-key",
    basePath = 'app-states',
    fetch = 'fetch',
    update ='update'
  } = options;

  @Controller(basePath)
  class AppStatesController {

    constructor(
      @Inject(APP_STATES_LOADER_TOKEN)  readonly _loader: AppStatesLoader,
      @Inject(APP_STATES_NOTIFIER_TOKEN)  readonly _notifier: AppStatesNotifier,
    ) {}


    @Get(fetch)
    fetch(@Headers(secretKeyHeader) secretKey: string){
      if(!secretKey || secretKey !== options.secretKey) {
        throw new ForbiddenException()
      }
      return this._loader.fetch();
    }

    @Post(update)
   async update(
     @Headers(secretKeyHeader) secretKey: string,
     @Body() states: Record<string, any>) {
      if(!secretKey || secretKey !== options.secretKey) {
        throw new ForbiddenException()
      }

      const original = await this._loader.fetch();
      const added = addedDiff(original, states)
      const deleted = deletedDiff(original, states)
      const updated = updatedDiff(original, states)

      const result = await this._loader.update({
        ...added,
        ...updated
      },
        Object.keys(deleted)
      );

      if(result){
        await this._notifier.notify({
          timestamp: Date.now(),
        })
      }
      return "ok";
    }

  }


  return AppStatesController
}
