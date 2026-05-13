import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MemoDocument = HydratedDocument<Memo>;

@Schema({ timestamps: true })
export class Memo {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: String, default: null })
  summary!: string | null;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ required: true, index: true })
  userId!: string;
}

export const MemoSchema = SchemaFactory.createForClass(Memo);

MemoSchema.index({ title: 'text', content: 'text' });
