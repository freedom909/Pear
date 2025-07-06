import { connect, model, Schema } from 'mongoose';

async function inspect() {
  try {
    await connect('mongodb://localhost:27017/pear');
    const User = model('User', new Schema({}, { strict: false }));
    
    // Count documents with null email
    const nullCount = await User.countDocuments({ email: null });
    console.log('Documents with null email:', nullCount);
    
    // Get indexes info
    const indexes = await User.collection.indexes();
    console.log('Collection indexes:', indexes);
    
    // Get first few users
    const users = await User.find().limit(5);
    console.log('Sample users:', users);
    
    process.exit(0);
  } catch (err) {
    console.error('Inspection failed:', err);
    process.exit(1);
  }
}

inspect();