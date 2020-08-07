const express = require('express');
//get router tool from express
const router = express.Router();
const {
  check,
  validationResult,
} = require('express-validator');
const auth = require('../../middleware/authenticateToken');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route     POST api/posts
// @descrip   Create a post
// @access    Private
router.post(
  '/',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    //If there is an error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    try {
      //
      const user = await User.findById(
        req.user.id
      ).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      //to be able to send it back as json
      const post = await newPost.save();

      res.json(post);
      //
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route     GET api/posts
// @descrip   GET all posts
// @access    Private

router.get('/', auth, async (req, res) => {
  try {
    //sort through the post with the most recent first
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route     GET api/posts/:id
// @descrip   GET post by ID
// @access    Private

router.get('/:id', auth, async (req, res) => {
  try {
    //sort through the post with the most recent first
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ msg: 'Post not found' });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res
        .status(404)
        .json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route     DELETE api/posts/:id
// @descrip   DELETE a post
// @access    Private

router.delete('/:id', auth, async (req, res) => {
  try {
    //sort through the post with the most recent first
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ msg: 'Post not found' });
    }

    //Check if user is valid
    if (post.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: 'User not authorized' });
    }

    await post.remove();

    //
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res
        .status(404)
        .json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route     PUT api/posts/like/:id
// @descrip   Like a post
// @access    Private

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if the post has already been like
    //for every like inside of the like.user array, if any one of them has similar id to..., then...
    if (
      post.likes.filter(
        (like) => like.user.toString() === req.user.id
      ).length > 0
    ) {
      return res
        .json(400)
        .json({ msg: 'Post already liked' });
    }

    post.likes.unshift({ user: req.user.id });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
