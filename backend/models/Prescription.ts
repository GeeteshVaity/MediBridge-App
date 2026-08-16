import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IMedicine {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  quantity?: number;
}

export interface IPrescription extends Document {
  patientId: Types.ObjectId;
  patientName: string;
  imageUrl: string;
  imageData?: string; // Base64 encoded image
  medicines: IMedicine[];
  notes?: string;
  status: 'pending' | 'offers-received' | 'accepted' | 'completed';
  acceptedOfferId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineSchema = new Schema<IMedicine>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      type: String,
      trim: true,
    },
    frequency: {
      type: String,
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
    },
  },
  { _id: false }
);

const PrescriptionSchema = new Schema<IPrescription>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Prescription image URL is required'],
    },
    imageData: {
      type: String,
    },
    medicines: {
      type: [MedicineSchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'offers-received', 'accepted', 'completed'],
      default: 'pending',
    },
    acceptedOfferId: {
      type: Schema.Types.ObjectId,
      ref: 'PrescriptionOffer',
    },
  },
  {
    timestamps: true,
  }
);

const Prescription: Model<IPrescription> =
  mongoose.models.Prescription || mongoose.model<IPrescription>('Prescription', PrescriptionSchema, 'prescriptions');

export default Prescription;
