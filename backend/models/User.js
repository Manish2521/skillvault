import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const schema = new mongoose.Schema({
  name:  { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  totalSizeMB:   { type: Number, default: 0 },
})

schema.methods.match = async function (pwd) { return bcrypt.compare(pwd, this.passwordHash) }

schema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next()
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10)
  next()
})

export default mongoose.model('User', schema)
