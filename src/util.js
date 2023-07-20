function randomIndex(array) {
    return Math.floor(Math.random() * array.length);
}

function randomEntry(array) {
    return array[randomIndex(array)];
}

module.exports = {
  randomIndex,
  randomEntry,
};