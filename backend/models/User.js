import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const schema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String
})

schema.methods.match = async function (pwd) { return bcrypt.compare(pwd, this.passwordHash) }

schema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next()
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10)
  next()
})

export default mongoose.model('User', schema)
