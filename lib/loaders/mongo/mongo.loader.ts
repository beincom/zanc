import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AppStatesLoader } from '../../interfaces';
import { APP_STATES_MODEL_TOKEN, AppStates } from './app-states.schema';

export type AppStatesResult = Record<string, any>;

export class MongoLoader implements AppStatesLoader<AppStatesResult, AppStatesResult> {
  constructor(
    @InjectModel(APP_STATES_MODEL_TOKEN) private readonly _model: Model<AppStates>,
  ) {
  }

  async fetch(): Promise<AppStatesResult> {
    const docs = await this._model.find({});
    const plainObjects = docs.map((doc) => doc.toObject());
    return  plainObjects.reduce((acc, {key, value}) => ({...acc, [key]: value}), {});
  }

  async update(update: AppStatesResult, deleteKeys: string[]): Promise<boolean> {
    const operations = Object.entries(update).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: {
          $set: {
            value,
          },
        },
        upsert: true,
      }
    }));
    const deleteOperation = {
      deleteMany: {
        filter: {
          key: {
            $in: deleteKeys,
          },
        },
      },
    }
    const result = await this._model.bulkWrite([...operations,deleteOperation]);
    return result.isOk();
  }

  async delete(input: AppStatesResult): Promise<boolean> {
    const keys = Object.keys(input);
    const result = await this._model.deleteMany({
      key: {
        $in: keys,
      },
    });
    return result.deletedCount === keys.length;
  }
}
