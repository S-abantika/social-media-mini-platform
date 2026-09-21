const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      maxlength: [2000, 'Post cannot exceed 2000 characters']
    },
    image: {
      type: String,
      default: ''
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    likesCount: {
      type: Number,
      default: 0,
      index: true
    },
    commentsCount: {
      type: Number,
      default: 0
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ]
  },
  {
    timestamps: true
  }
);

// Indexes
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ content: 'text' });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
