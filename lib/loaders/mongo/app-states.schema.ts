import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MS } from 'mongoose';

@Schema({
  id: true,
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: { virtuals: true },
  versionKey: false,
  collection: 'appstates',
})
export class AppStates {
  @Prop({
    type: String,
    required: true,
  })
  public key!: string;

  @Prop({
    type: MS.Types.Mixed,
    required: true,
  })
  public value: any;
}


export const AppStatesSchema = SchemaFactory.createForClass(AppStates);

export const APP_STATES_MODEL_TOKEN = AppStates.name;

export const AppStatesModel: ModelDefinition = {
  name: APP_STATES_MODEL_TOKEN,
  schema: AppStatesSchema,
};
