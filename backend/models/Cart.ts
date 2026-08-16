import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ICartItem {
  medicineId?: Types.ObjectId;
  medicineName: string;
  quantity: number;
  shopId?: Types.ObjectId;
  price?: number;
  brand?: string;
  inventoryId?: string;
  toObject?: () => ICartItem;
}

export interface ICart extends Document {
  patientId: Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
      unique: true,
    },
    items: [
      {
        medicineId: {
          type: Schema.Types.ObjectId,
          ref: 'Inventory',
        },
        medicineName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        shopId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        price: {
          type: Number,
          default: 0,
        },
        brand: {
          type: String,
        },
        inventoryId: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema, 'carts');

export default Cart;
