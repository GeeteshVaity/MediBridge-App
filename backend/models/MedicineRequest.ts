import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IMedicineRequest extends Document {
  medicineName: string;
  requestedBy: Types.ObjectId;
  patientName: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  fulfilledBy?: Types.ObjectId;
  fulfilledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineRequestSchema = new Schema<IMedicineRequest>(
  {
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'fulfilled', 'cancelled'],
      default: 'pending',
    },
    fulfilledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    fulfilledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const MedicineRequest: Model<IMedicineRequest> =
  mongoose.models.MedicineRequest || mongoose.model<IMedicineRequest>('MedicineRequest', MedicineRequestSchema, 'medicinerequests');

export default MedicineRequest;
