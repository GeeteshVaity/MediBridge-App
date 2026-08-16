import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IRestockRequest extends Document {
  shopId: Types.ObjectId;
  medicineName: string;
  quantity: number;
  priority: 'urgent' | 'normal' | 'low';
  status: 'pending' | 'in-transit' | 'delivered';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RestockRequestSchema = new Schema<IRestockRequest>(
  {
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Shop ID is required'],
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    priority: {
      type: String,
      enum: ['urgent', 'normal', 'low'],
      default: 'normal',
    },
    status: {
      type: String,
      enum: ['pending', 'in-transit', 'delivered'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const RestockRequest: Model<IRestockRequest> =
  mongoose.models.RestockRequest || mongoose.model<IRestockRequest>('RestockRequest', RestockRequestSchema, 'restockrequests');

export default RestockRequest;
