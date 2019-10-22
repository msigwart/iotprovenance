function check(expression, msg) {
  if (!expression) throw new Error(msg);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  check,
  sleep
};