import mongoose from "mongoose";

const moviePurchaseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", index: true },
    pricePaid: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    paymentProvider: { type: String, default: "demo" },
    transactionId: { type: String },
  },
  { timestamps: true }
);

// each user can only buy each movie once
moviePurchaseSchema.index({ user: 1, movie: 1 }, { unique: true });

export default mongoose.models.MoviePurchase ||
  mongoose.model("MoviePurchase", moviePurchaseSchema);


