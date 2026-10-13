const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    audience: {
      type: String,
      default: 'general audience',
    },
    tone: {
      type: String,
      default: 'professional yet conversational',
    },
    status: {
      type: String,
      enum: ['pending', 'researching', 'planning', 'writing', 'editing', 'completed', 'failed'],
      default: 'pending',
    },
    // Multi-agent outputs
    researchBrief: {
      type: String,
      default: '',
    },
    outline: {
      type: String,
      default: '',
    },
    seoData: {
      primaryKeyword: String,
      secondaryKeywords: [String],
      titleOptions: [String],
      metaDescription: String,
      slug: String,
    },
    content: {
      type: String, // Final Markdown content
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
