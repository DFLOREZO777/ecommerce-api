const { cloudinary } = require('./src/config/cloudinary');

cloudinary.api.ping()
  .then(() => console.log('✅ Cloudinary credentials are correct and working!'))
  .catch(err => console.error('❌ Cloudinary error:', err));
