import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IInventory extends Document {
  shopId: Types.ObjectId;
  medicineName: string;
  quantity: number;
  expiryDate?: Date;
  brand?: string;
  price?: number;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
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
      min: [0, 'Quantity cannot be negative'],
    },
    expiryDate: {
      type: Date,
    },
    brand: {
      type: String,
      trim: true,
      default: 'Generic',
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
  },
  {
    timestamps: true,
  }
);

const Inventory: Model<IInventory> =
  mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', InventorySchema, 'inventories');

export default Inventory;
