import mongoose from 'mongoose'
export default async function connectDB () {
  try { await mongoose.connect(process.env.MONGO_URI); console.log('Mongo connected') }
  catch (e) { console.error(e); process.exit(1) }
}

