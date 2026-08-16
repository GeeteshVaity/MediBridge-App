import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IOfferMedicine {
  medicineName: string;
  brand?: string;
  quantity: number;
  price: number;
  available: boolean;
  notes?: string;
}

export interface IPrescriptionOffer extends Document {
  prescriptionId: Types.ObjectId;
  shopId: Types.ObjectId;
  shopName: string;
  medicines: IOfferMedicine[];
  totalAmount: number;
  deliveryFee: number;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const OfferMedicineSchema = new Schema<IOfferMedicine>(
  {
    medicineName: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    available: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const PrescriptionOfferSchema = new Schema<IPrescriptionOffer>(
  {
    prescriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Prescription',
      required: [true, 'Prescription ID is required'],
    },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Shop ID is required'],
    },
    shopName: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
    },
    medicines: {
      type: [OfferMedicineSchema],
      required: true,
      validate: {
        validator: function (v: IOfferMedicine[]) {
          return v && v.length > 0;
        },
        message: 'At least one medicine is required in the offer',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
PrescriptionOfferSchema.index({ prescriptionId: 1, shopId: 1 }, { unique: true });
PrescriptionOfferSchema.index({ shopId: 1, status: 1 });

const PrescriptionOffer: Model<IPrescriptionOffer> =
  mongoose.models.PrescriptionOffer || mongoose.model<IPrescriptionOffer>('PrescriptionOffer', PrescriptionOfferSchema, 'prescriptionoffers');

export default PrescriptionOffer;
