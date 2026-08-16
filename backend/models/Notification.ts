import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: 'order' | 'stock' | 'system' | 'restock' | 'medicine-request' | 'prescription';
  title: string;
  message: string;
  read: boolean;
  relatedRequestId?: Types.ObjectId;
  relatedPrescriptionId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    type: {
      type: String,
      enum: ['order', 'stock', 'system', 'restock', 'medicine-request', 'prescription'],
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    relatedRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'MedicineRequest',
    },
    relatedPrescriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Prescription',
    },
  },
  {
    timestamps: true,
  }
);

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema, 'notifications');

export default Notification;
