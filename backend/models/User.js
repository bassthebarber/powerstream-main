// backend/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true, // ✅ this alone defines the unique index
    },
    password: { type: String, required: true, minlength: 6 },
    avatarUrl: { type: String, default: "" },

    // ✅ Role-based Access Control (RBAC)
    role: {
      type: String,
      enum: ["admin", "finance", "legal", "investor", "user"],
      default: "user",
    },

    // ✅ Account control flags
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "suspended", "banned"],
      default: "active",
    },

    // ✅ Admin flag (legacy compatibility)
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Encrypt password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Compare password for login
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ✅ Hide sensitive fields when sending user data
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// ❌ REMOVE this line completely:
// UserSchema.index({ email: 1 });   ← this caused the duplicate index warning

export default mongoose.model("User", UserSchema);
