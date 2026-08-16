import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICard extends Document {
  userId: mongoose.Types.ObjectId;
  cardNumber?: string;
  cardHolderName?: string;
  last4?: string;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema = new Schema<ICard>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cardNumber: {
      type: String,
      trim: true,
    },
    cardHolderName: {
      type: String,
      trim: true,
    },
    last4: {
      type: String,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Card: Model<ICard> =
  mongoose.models.Card || mongoose.model<ICard>('Card', CardSchema, 'card');

export default Card;
