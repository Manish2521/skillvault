import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { 
      type: String, 
      required: function () { return this.provider === "local"; } 
    },
    provider: { type: String, default: "local" },
    providerId: { type: String },
    totalSizeMB: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Hash before saving only if password exists
userSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.match = async function (pwd) {
  if (!this.password) return false;
  return await bcrypt.compare(pwd, this.password);
};

export default mongoose.model("User", userSchema);
