import { Review, Product } from '../models/index.js';

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product_id: req.params.productId }).lean();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    if (!product_id || !rating) return res.status(400).json({ error: 'Missing required fields' });

    const review = await Review.create({ product_id, user_id: req.user.id, rating, comment });

    // Update product rating
    const reviews = await Review.find({ product_id }).lean();
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(product_id, { rating: avgRating, total_reviews: reviews.length });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (String(review.user_id) !== String(req.user.id)) return res.status(403).json({ error: 'Not authorized' });

    Object.assign(review, req.body);
    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
