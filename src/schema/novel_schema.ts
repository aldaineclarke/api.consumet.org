import { Schema, model, Document } from 'mongoose';

interface Chapter {
  id: string;
  title: string;
  url: string;
}

interface Novel extends Document {
  id: string;
  title: string;
  lastChapter: string;
  author: string;
  rating: number;
  url: string;
  novelId: string;
  views: number;
  pages: number;
  image: string;
  description: string;
  chapters: Chapter[];
  genres: string[];
  status: string;
}

const chapterSchema = new Schema<Chapter>({
    id: {
        type: String,
        required: true
      },
  title: {
    type: String,
    required: true
  },

  url: {
    type: String,
    required: true
  }
});

const novelSchema = new Schema<Novel>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  lastChapter: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  novelId: {
    type: String,
    required: true
  },
  views: {
    type: Number,
    required: true
  },
  pages: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  genres: {
    type: [String],
    required: true
  },
  chapters: [chapterSchema]
}, { timestamps: true });

const NovelModel = model<Novel>('Novel', novelSchema);

export default NovelModel;
