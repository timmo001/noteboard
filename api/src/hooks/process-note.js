// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

module.exports = function(_options = {}) {
  // eslint-disable-line no-unused-vars
  return async context => {
    const { data } = context;
    const {
      x,
      y,
      background,
      height,
      width,
      font_size,
      color,
      text,
      style
    } = data;

    // Throw an error if we didn't get a x position
    if (!x) throw new Error('A note must have a x position');

    // Throw an error if we didn't get a y position
    if (!y) throw new Error('A note must have a y position');

    // Number validation
    if (!Number.isInteger(x))
      throw new Error('The x position must be a number');
    if (!Number.isInteger(y))
      throw new Error('The y position must be a number');
    if (height && !Number.isInteger(height))
      throw new Error('Height must be a number');
    if (width && !Number.isInteger(width))
      throw new Error('Width must be a number');
    if (font_size && !Number.isInteger(font_size))
      throw new Error('The font_size must be a number');

    // The authenticated user
    const user = context.params.user;

    // Override the original data (so that people can't submit additional stuff)
    context.data = {
      x,
      y,
      background,
      height,
      width,
      font_size,
      color,
      text,
      style,
      // Set the user id
      userId: user._id,
      // Add the current date
      createdAt: new Date().getTime()
    };

    // Best practice: hooks should always return the context
    return context;
  };
};
